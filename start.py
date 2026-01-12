"""
SpotiDownloader - Startup Script
Automatically sets up and starts the application
"""
import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

def print_header():
    print("=" * 60)
    print("🎧 SpotiDownloader - Startup Script")
    print("=" * 60)
    print()

def check_python_version():
    """Check if Python version is 3.11 or higher."""
    if sys.version_info < (3, 11):
        print("❌ Python 3.11 o superior es requerido.")
        print(f"   Versión actual: {sys.version}")
        sys.exit(1)
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor} detectado")

def check_node():
    """Check if Node.js is installed."""
    try:
        result = subprocess.run(
            ["node", "--version"],
            capture_output=True,
            text=True,
            check=True
        )
        print(f"✓ Node.js {result.stdout.strip()} detectado")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js no encontrado. Por favor instala Node.js 16+")
        return False

def setup_backend():
    """Setup backend dependencies."""
    print("\n📦 Configurando Backend...")
    backend_dir = Path(__file__).parent / "backend"
    
    # Check if virtual environment exists
    venv_dir = backend_dir / "venv"
    if not venv_dir.exists():
        print("   Creando entorno virtual...")
        subprocess.run([sys.executable, "-m", "venv", str(venv_dir)], check=True)
    
    # Determine pip path
    if sys.platform == "win32":
        pip_path = venv_dir / "Scripts" / "pip.exe"
        python_path = venv_dir / "Scripts" / "python.exe"
    else:
        pip_path = venv_dir / "bin" / "pip"
        python_path = venv_dir / "bin" / "python"
    
    # Install requirements
    print("   Instalando dependencias de Python...")
    requirements_file = backend_dir / "requirements.txt"
    subprocess.run(
        [str(pip_path), "install", "-r", str(requirements_file), "--quiet"],
        check=True
    )
    
    # Setup FFmpeg
    print("   Configurando FFmpeg...")
    ffmpeg_setup = backend_dir / "utils" / "ffmpeg_setup.py"
    subprocess.run([str(python_path), str(ffmpeg_setup)], check=True)
    
    print("✓ Backend configurado correctamente")
    return python_path

def setup_frontend():
    """Setup frontend dependencies."""
    print("\n📦 Configurando Frontend...")
    frontend_dir = Path(__file__).parent / "frontend"
    
    # Check if node_modules exists
    node_modules = frontend_dir / "node_modules"
    if not node_modules.exists():
        print("   Instalando dependencias de Node.js...")
        subprocess.run(
            ["npm", "install"],
            cwd=frontend_dir,
            check=True
        )
    else:
        print("   Dependencias ya instaladas")
    
    # Build frontend
    print("   Construyendo frontend...")
    subprocess.run(
        ["npm", "run", "build"],
        cwd=frontend_dir,
        check=True
    )
    
    print("✓ Frontend configurado correctamente")

def check_env_file():
    """Check if .env file exists with required variables."""
    env_file = Path(__file__).parent / ".env"
    
    if not env_file.exists():
        print("\n⚠️  Archivo .env no encontrado")
        print("   Por favor crea un archivo .env con tus credenciales de Spotify:")
        print("   SPOTIFY_CLIENT_ID=tu_client_id")
        print("   SPOTIFY_CLIENT_SECRET=tu_client_secret")
        return False
    
    # Check if variables are set
    with open(env_file, 'r') as f:
        content = f.read()
        if 'SPOTIFY_CLIENT_ID' not in content or 'SPOTIFY_CLIENT_SECRET' not in content:
            print("\n⚠️  Credenciales de Spotify no configuradas en .env")
            return False
    
    print("✓ Archivo .env configurado")
    return True

def start_server(python_path):
    """Start the FastAPI server."""
    print("\n🚀 Iniciando servidor...")
    backend_dir = Path(__file__).parent / "backend"
    
    # Determine uvicorn path
    if sys.platform == "win32":
        uvicorn_path = backend_dir / "venv" / "Scripts" / "uvicorn.exe"
    else:
        uvicorn_path = backend_dir / "venv" / "bin" / "uvicorn"
    
    # Start server
    print("   Servidor iniciando en http://localhost:8000")
    print("\n" + "=" * 60)
    print("✓ Aplicación lista!")
    print("   Abre tu navegador en: http://localhost:8000")
    print("   Presiona Ctrl+C para detener el servidor")
    print("=" * 60 + "\n")
    
    # Open browser after a short delay
    time.sleep(2)
    webbrowser.open("http://localhost:8000")
    
    # Start server (this will block)
    try:
        subprocess.run(
            [str(uvicorn_path), "main:app", "--reload"],
            cwd=backend_dir,
            check=True
        )
    except KeyboardInterrupt:
        print("\n\n👋 Servidor detenido. ¡Hasta luego!")

def main():
    """Main startup function."""
    print_header()
    
    # Check requirements
    check_python_version()
    
    if not check_node():
        sys.exit(1)
    
    if not check_env_file():
        sys.exit(1)
    
    # Setup
    try:
        python_path = setup_backend()
        setup_frontend()
        
        # Start server
        start_server(python_path)
        
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error durante la configuración: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n👋 Configuración cancelada")
        sys.exit(0)

if __name__ == "__main__":
    main()
