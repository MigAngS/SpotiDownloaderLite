from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
from services import downloader
import asyncio
from concurrent.futures import ThreadPoolExecutor

from models.song import Song
from services.spotify_client import get_playlist_tracks
from services.youtube_client import search_youtube
from utils.zipper import zip_files
from utils.progress_manager import progress_manager

router = APIRouter()

downloads_dir = Path(__file__).resolve().parent.parent.parent / "downloads"
downloads_dir.mkdir(exist_ok=True)

executor = ThreadPoolExecutor(max_workers=3)

class PlaylistRequest(BaseModel):
    playlist_url: str

class DownloadRequest(BaseModel):
    playlist_url: str
    selected_songs: list[Song]
    session_id: str


@router.post("/convert", response_model=list[Song])
async def convert_playlist(req: PlaylistRequest):
    try:
        songs = get_playlist_tracks(req.playlist_url)
        return songs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def download_song_async(song: Song, temp_dir: Path, session_id: str):
    song_id = song.id or song.query
    
    try:
        progress_manager.update_song_progress(
            session_id, song_id, "started", 0, f"Iniciando descarga de {song.title}"
        )
        
        progress_manager.update_song_progress(
            session_id, song_id, "searching", 10, "Buscando en YouTube..."
        )
        
        youtube_url = await asyncio.get_event_loop().run_in_executor(
            executor, search_youtube, song.query
        )
        
        if not youtube_url:
            raise Exception("No se encontró la canción en YouTube")
        
        progress_manager.update_song_progress(
            session_id, song_id, "downloading", 30, "Descargando audio..."
        )
        
        await asyncio.get_event_loop().run_in_executor(
            executor, downloader.download_songs, youtube_url, temp_dir, song.title, song.artist
        )
        
        progress_manager.update_song_progress(
            session_id, song_id, "converting", 90, "Finalizando..."
        )
        
        progress_manager.update_song_progress(
            session_id, song_id, "completed", 100, "Completado"
        )
        
        return True
        
    except Exception as e:
        error_msg = str(e)
        
        # Mensaje específico para errores de bot detection
        if '403' in error_msg or 'bot' in error_msg or 'bloqueó' in error_msg:
            print(f"⚠️ YouTube bloqueó {song.title}. Continuando con siguiente canción...")
            progress_manager.update_song_progress(
                session_id, song_id, "error", 0, 
                "YouTube bloqueó esta descarga temporalmente"
            )
        else:
            print(f"Error downloading {song.title}: {str(e)}")
            progress_manager.update_song_progress(
                session_id, song_id, "error", 0, f"Error: {str(e)}"
            )
        
        return False  # Continuar con siguiente canción


async def process_downloads(songs: list[Song], temp_dir: Path, session_id: str):
    completed = 0
    successful_downloads = 0
    
    for index, song in enumerate(songs):
        # Verificar si la sesión ha sido cancelada
        if progress_manager.is_cancelled(session_id):
            print(f"🛑 Sesión {session_id} cancelada. Deteniendo descargas.")
            return

        progress_manager.update_session_progress(
            session_id, completed, f"{song.title} - {song.artist}"
        )
        
        success = await download_song_async(song, temp_dir, session_id)
        
        if success:
            successful_downloads += 1
        
        completed += 1
        progress_manager.update_session_progress(session_id, completed, "")
    
    if successful_downloads == 0:
        progress_manager.update_session_progress(session_id, completed, "")
        return
    
    try:
        zip_path = temp_dir.parent / f"{session_id}.zip"
        zip_files(temp_dir, zip_path)
        
        if zip_path.exists() and zip_path.stat().st_size > 0:
            download_url = f"/api/download-file/{session_id}"
            progress_manager.complete_session(session_id, download_url)
        else:
            raise Exception("ZIP file is empty or was not created")
            
    except Exception as e:
        print(f"Error creating ZIP: {str(e)}")


@router.post("/download")
async def download_playlist(req: DownloadRequest, background_tasks: BackgroundTasks):
    try:
        progress_manager.create_session(req.session_id, len(req.selected_songs))
        
        temp_dir = downloads_dir / req.session_id
        temp_dir.mkdir(exist_ok=True)
        
        background_tasks.add_task(process_downloads, req.selected_songs, temp_dir, req.session_id)
        
        return {
            "status": "started",
            "session_id": req.session_id,
            "message": "Descarga iniciada en segundo plano"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/progress/{session_id}")
async def get_progress(session_id: str):
    progress = progress_manager.get_progress(session_id)
    
    if not progress:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return progress


@router.post("/cancel/{session_id}")
async def cancel_download(session_id: str):
    progress_manager.cancel_session(session_id)
    return {"status": "cancelled", "message": "Descarga cancelada"}


@router.get("/download-file/{session_id}")
async def download_file(session_id: str):
    zip_path = downloads_dir / f"{session_id}.zip"
    
    if not zip_path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    if zip_path.stat().st_size == 0:
        raise HTTPException(status_code=404, detail="Archivo vacío")
    
    return FileResponse(
        path=zip_path,
        filename=f"spotify_playlist_{session_id}.zip",
        media_type="application/zip"
    )
