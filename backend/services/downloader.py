from yt_dlp import YoutubeDL
from pathlib import Path
import os
import re
import traceback
from typing import Optional, Callable

# Import FFmpeg setup utility
from utils.ffmpeg_setup import get_ffmpeg_path

# Import configuration and retry handler
from config import get_base_ydl_opts, YOUTUBE_STRATEGIES
from utils.retry_handler import RetryHandler

# Get FFmpeg path from local installation
FFMPEG_LOCATION = get_ffmpeg_path()

# Global dictionary for download progress tracking
DOWNLOAD_PROGRESS = {}


def sanitize_filename(name: str) -> str:
    """Remove invalid characters from filename."""
    name = re.sub(r'[\\/:\\"*?<>|]+', '', name)
    name = re.sub(r'\\s+', ' ', name).strip()
    return name


def _download_with_strategy(
    youtube_url: str,
    output_dir: Path,
    strategy: dict,
    title: str = None,
    artist: str = None,
    filename: str = None,
    progress_callback: Optional[Callable] = None,
    song_id: Optional[str] = None
):
    """
    Download a song from YouTube using a specific strategy.
    
    Args:
        youtube_url: YouTube video URL
        output_dir: Directory to save the downloaded file
        strategy: YouTube extraction strategy to use
        title: Song title
        artist: Artist name
        filename: Custom filename (optional)
        progress_callback: Callback function for progress updates
        song_id: Unique identifier for tracking progress
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    if filename:
        base_name = filename
    elif title and artist:
        base_name = f"{title} - {artist}"
    else:
        base_name = "%(title)s"

    safe_base = sanitize_filename(base_name)
    outtmpl = os.path.join(str(output_dir), f"{safe_base}.%(ext)s")

    def progress_hook(d):
        """Hook to track download progress."""
        if progress_callback and song_id:
            status = d.get('status')
            
            if status == 'downloading':
                total = d.get('total_bytes') or d.get('total_bytes_estimate', 0)
                downloaded = d.get('downloaded_bytes', 0)
                
                if total > 0:
                    percentage = (downloaded / total) * 100
                    speed = d.get('speed', 0)
                    eta = d.get('eta', 0)
                    
                    progress_callback({
                        'song_id': song_id,
                        'status': 'downloading',
                        'percentage': round(percentage, 2),
                        'downloaded_bytes': downloaded,
                        'total_bytes': total,
                        'speed': speed,
                        'eta': eta
                    })
            
            elif status == 'finished':
                progress_callback({
                    'song_id': song_id,
                    'status': 'converting',
                    'percentage': 95,
                    'message': 'Convirtiendo a MP3...'
                })

    # Get base options and merge with download-specific options
    base_opts = get_base_ydl_opts()
    
    ydl_opts = {
        **base_opts,
        "format": "bestaudio/best",
        "outtmpl": outtmpl,
        "noplaylist": True,
        "progress_hooks": [progress_hook] if progress_callback else [],
        "extractor_args": {
            "youtube": strategy
        },
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }],
    }

    if FFMPEG_LOCATION:
        ydl_opts["ffmpeg_location"] = FFMPEG_LOCATION

    # Notify start
    if progress_callback and song_id:
        progress_callback({
            'song_id': song_id,
            'status': 'started',
            'percentage': 0,
            'message': f'Iniciando descarga de {title or "canción"}...'
        })

    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])

    # Notify completion
    if progress_callback and song_id:
        progress_callback({
            'song_id': song_id,
            'status': 'completed',
            'percentage': 100,
            'message': 'Descarga completada!'
        })


def download_songs(
    youtube_url: str, 
    output_dir: Path, 
    title: str = None, 
    artist: str = None, 
    filename: str = None,
    progress_callback: Optional[Callable] = None,
    song_id: Optional[str] = None
):
    """
    Download a song from YouTube with automatic retry using multiple strategies.
    
    Args:
        youtube_url: YouTube video URL
        output_dir: Directory to save the downloaded file
        title: Song title
        artist: Artist name
        filename: Custom filename (optional)
        progress_callback: Callback function for progress updates
        song_id: Unique identifier for tracking progress
    """
    retry_handler = RetryHandler(max_retries=len(YOUTUBE_STRATEGIES))
    
    try:
        return retry_handler.execute_with_retry(
            _download_with_strategy,
            youtube_url,
            output_dir=output_dir,
            title=title,
            artist=artist,
            filename=filename,
            progress_callback=progress_callback,
            song_id=song_id
        )
        
    except Exception as e:
        error_msg = str(e)
        
        # Provide user-friendly error messages
        if '403' in error_msg or 'bot' in error_msg or 'bloqueó' in error_msg:
            print(f"❌ YouTube bloqueó la descarga de '{title or youtube_url}' después de múltiples intentos")
            
            # Notify error through callback
            if progress_callback and song_id:
                progress_callback({
                    'song_id': song_id,
                    'status': 'error',
                    'percentage': 0,
                    'message': 'YouTube bloqueó esta descarga temporalmente'
                })
            
            raise Exception(
                "YouTube bloqueó la descarga después de múltiples intentos. "
                "Esto puede ser temporal. Intenta de nuevo en unos minutos."
            )
        else:
            print(f"❌ Error al descargar '{title or youtube_url}': {error_msg}")
            traceback.print_exc()
            
            # Notify error through callback
            if progress_callback and song_id:
                progress_callback({
                    'song_id': song_id,
                    'status': 'error',
                    'percentage': 0,
                    'message': f'Error: {str(e)}'
                })
            
            raise

