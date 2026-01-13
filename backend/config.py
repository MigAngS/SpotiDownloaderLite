"""
Configuración centralizada para yt-dlp con múltiples estrategias anti-bot
"""
import os

# User-Agent moderno (Chrome en Windows)
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

# Estrategias de extractor para YouTube (se intentarán en orden)
YOUTUBE_STRATEGIES = [
    {
        "name": "web_default",
        "player_client": ["web"],
        "player_skip": []
    },
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
    opts = {
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

    # Verificar si existe archivo de cookies (ya sea local o inyectado por Render secrets)
    # Render suele montar secrets en /etc/secrets/ o en la raíz si se configura así
    cookie_locations = [
        "cookies.txt",  # Local / Root
        "/etc/secrets/cookies.txt",  # Render Secret File standard path
        "backend/cookies.txt"
    ]
    
    for cookie_path in cookie_locations:
        if os.path.exists(cookie_path):
            print(f"🍪 Cookies encontradas en: {cookie_path}")
            
            # COPY LOGIC STARTS HERE
            try:
                import shutil
                import tempfile
                
                # Crear archivo temporal
                temp_cookie = tempfile.NamedTemporaryFile(delete=False, suffix='.txt')
                temp_cookie.close()
                
                shutil.copy2(cookie_path, temp_cookie.name)
                print(f"🍪 Cookies copiadas a: {temp_cookie.name}")
                opts["cookiefile"] = temp_cookie.name
                
                # CRITICAL CHANGE: Remove explicit User-Agent when using cookies
                # to avoid mismatch with the browser session in the cookies
                if "user_agent" in opts:
                    del opts["user_agent"]
                
                # Disable advanced optimizations that might look suspicious with authenticated session
                opts["youtube_include_dash_manifest"] = True
                opts["youtube_include_hls_manifest"] = True
                
            except Exception as e:
                print(f"⚠️ Error preparing cookies: {e}")
                opts["cookiefile"] = cookie_path
                
            break
            
    return opts
