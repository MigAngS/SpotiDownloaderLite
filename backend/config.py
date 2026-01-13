"""
Configuración centralizada para yt-dlp con múltiples estrategias anti-bot
"""

# User-Agent moderno (Chrome en Windows)
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

# Estrategias de extractor para YouTube (se intentarán en orden)
YOUTUBE_STRATEGIES = [
    {
        "name": "ios_app",
        "player_client": ["ios"],
        "player_skip": ["configs"]
    },
    {
        "name": "android_app",
        "player_client": ["android"],
        "player_skip": ["webpage"]
    },
    {
        "name": "mweb", 
        "player_client": ["mweb"],
        "player_skip": []
    },
    {
        "name": "tv_client",
        "player_client": ["tv"],
        "player_skip": []
    }
]

def get_base_ydl_opts():
    """Retorna opciones base de yt-dlp optimizadas para producción"""
    return {
        "quiet": True,
        "no_warnings": True,
        "user_agent": USER_AGENT,
        "socket_timeout": 30,
        "retries": 3,
        "fragment_retries": 3,
    }
