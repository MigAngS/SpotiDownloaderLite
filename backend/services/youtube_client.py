from yt_dlp import YoutubeDL
import re
from config import get_base_ydl_opts, YOUTUBE_STRATEGIES

def normalize(text: str) -> str:
    return re.sub(r'\\W+', '', text).lower()

def search_youtube(query: str, artist: str = "") -> str:
    """
    Search for a song on YouTube and return the best match URL.
    
    Args:
        query: Song title or search query
        artist: Artist name (optional, improves search accuracy)
        
    Returns:
        YouTube video URL of the best match
        
    Raises:
        RuntimeError: If search fails or no results found
    """
    try:
        # Get base options and merge with search-specific options
        base_opts = get_base_ydl_opts()
        
        ydl_opts = {
            **base_opts,
            'skip_download': True,
            'default_search': 'ytsearch10',
            'noplaylist': True,
            'extract_flat': 'in_playlist',
            'extractor_args': {
                'youtube': YOUTUBE_STRATEGIES[0]  # Use first strategy for search
            }
        }

        if artist:
            query = f"{query} {artist}"
        
        with YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(query, download=False)

            if 'entries' not in result or not result['entries']:
                return None

            entries = result['entries'][:5]  # Solo analizamos los 5 primeros
            artist_norm = normalize(artist)

            def score(entry):
                title = entry.get('title', '').lower()
                uploader = entry.get('uploader', '').lower()
                title_norm = normalize(title)
                uploader_norm = normalize(uploader)

                s = 0
                if artist_norm and (artist_norm in title_norm or artist_norm in uploader_norm):
                    s += 3
                if any(k in title for k in ["audio", "lyrics", "letra"]):
                    s += 2
                if "official" in title:
                    s += 1
                if any(k in title for k in ["live", "mix", "video"]):
                    s -= 2
                return s

            best_entry = max(entries, key=score)
            return f"https://www.youtube.com/watch?v={best_entry['id']}"

    except Exception as e:
        raise RuntimeError(f"Error en búsqueda de YouTube: {str(e)}")
