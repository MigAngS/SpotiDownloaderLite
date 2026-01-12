from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pathlib import Path
from api.routes import router as api_router

app = FastAPI(
    title="SpotiDownloader API",
    description="Convierte tus playlists de Spotify en archivos MP3 descargables vía YouTube.",
    version="2.0.0"
)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar las rutas de la API bajo el prefijo /api
app.include_router(api_router, prefix="/api")

# Ruta del frontend compilado
frontend_path = Path(__file__).resolve().parent.parent / "frontend" / "dist"

# Servir archivos estáticos del frontend
if frontend_path.exists():
    # Servir assets (JS, CSS)
    assets_path = frontend_path / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")
    
    # Servir otros archivos estáticos (vite.svg, favicon, etc.)
    @app.get("/vite.svg")
    async def serve_vite_svg():
        svg_file = frontend_path / "vite.svg"
        if svg_file.exists():
            return FileResponse(svg_file)
        return HTMLResponse("Not found", status_code=404)

# Servir el index.html para la ruta raíz y cualquier otra ruta (SPA)
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # Si es una ruta de API, no servir el frontend
    if full_path.startswith("api/"):
        return HTMLResponse("<h1>Not Found</h1>", status_code=404)
    
    # Servir index.html para todas las demás rutas
    index_file = frontend_path / "index.html"
    if index_file.exists():
        return HTMLResponse(index_file.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>Error: Frontend no encontrado</h1>", status_code=404)
