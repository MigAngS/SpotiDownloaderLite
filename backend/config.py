"""
Configuración centralizada para yt-dlp con múltiples estrategias anti-bot
"""

# User-Agent moderno (Chrome en Windows)
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

# Estrategias de extractor para YouTube (se intentarán en orden)
YOUTUBE_STRATEGIES = [
    {
        "name": "ios_standalone",
        "player_client": ["ios"],
        "player_skip": ["webpage", "configs"]
    },
    {
        "name": "android_standalone",
        "player_client": ["android"],
        "player_skip": ["webpage", "configs"]
    },
    {
        "name": "tv_embedded",
        "player_client": ["tv"],
        "player_skip": ["webpage", "configs"]
    },
    {
        "name": "tvhtml5",
        "player_client": ["tvhtml5"],
        "player_skip": ["configs"]
    },
    {
        "name": "web_creator",
        "player_client": ["web_creator"],
        "player_skip": ["configs"]
    },
    {
        "name": "mediaconnect",
        "player_client": ["mediaconnect"],
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
        "retries": 5,
        "fragment_retries": 15,
        # Permitir ejecución de JS/WASM para saltar firmas de YouTube
        "n_sig_allow_js": True,
        "n_sig_allow_wasm": True,
        # Opciones avanzadas para evitar bloqueos
        "cachedir": False,
        "youtube_include_dash_manifest": False,
        "youtube_include_hls_manifest": False,
        "no_check_certificate": True,
        "prefer_insecure": True,
    }
