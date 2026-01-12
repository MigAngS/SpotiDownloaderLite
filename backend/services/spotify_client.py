import os
import re
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv
from models.song import Song

load_dotenv()

# Autenticación con Spotify
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET")
))

def extract_playlist_id(url: str) -> str:
    """
    Extrae de forma robusta el ID de una playlist desde cualquier URL válida de Spotify.
    """
    match = re.search(r'playlist/([a-zA-Z0-9]+)', url)
    if match:
        return match.group(1)
    raise ValueError("No se pudo extraer el ID de la playlist desde la URL proporcionada.")

def get_playlist_tracks(playlist_url: str) -> list[Song]:
    try:
        playlist_id = extract_playlist_id(playlist_url)
        results = sp.playlist_items(playlist_id)
        songs: list[Song] = []

        for item in results["items"]:
            track = item.get("track")
            if not track:  # Evita errores si algún ítem es None
                continue
            title = track['name']
            artist = track['artists'][0]['name']
            query = f"{title} - {artist}"
            songs.append(Song(title=title, artist=artist, query=query))

        return songs
    except Exception as e:
        raise RuntimeError(f"Error al obtener canciones: {str(e)}")
