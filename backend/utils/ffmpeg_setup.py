"""
FFmpeg Setup Utility
Automatically downloads and configures FFmpeg binaries for the project.
"""
import os
import sys
import platform
import zipfile
import tarfile
import shutil
from pathlib import Path
import urllib.request
from typing import Optional

# FFmpeg download URLs for different platforms
FFMPEG_URLS = {
    "Windows": "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip",
    "Linux": "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz",
    "Darwin": "https://evermeet.cx/ffmpeg/ffmpeg-6.1.zip"  # macOS
}


def get_bin_directory() -> Path:
    """Get the bin directory path for FFmpeg binaries."""
    backend_dir = Path(__file__).resolve().parent.parent
    bin_dir = backend_dir / "bin" / "ffmpeg"
    return bin_dir


def is_ffmpeg_installed() -> bool:
    """Check if FFmpeg is already installed in the project."""
    bin_dir = get_bin_directory()
    
    if platform.system() == "Windows":
        ffmpeg_exe = bin_dir / "ffmpeg.exe"
        ffprobe_exe = bin_dir / "ffprobe.exe"
        return ffmpeg_exe.exists() and ffprobe_exe.exists()
    else:
        ffmpeg_exe = bin_dir / "ffmpeg"
        ffprobe_exe = bin_dir / "ffprobe"
        return ffmpeg_exe.exists() and ffprobe_exe.exists()


def download_file(url: str, destination: Path) -> None:
    """Download a file from URL to destination with progress."""
    print(f"Descargando FFmpeg desde {url}...")
    
    def report_progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        percent = min(downloaded * 100 / total_size, 100)
        sys.stdout.write(f"\rProgreso: {percent:.1f}%")
        sys.stdout.flush()
    
    urllib.request.urlretrieve(url, destination, reporthook=report_progress)
    print("\n¡Descarga completada!")


def extract_ffmpeg_windows(archive_path: Path, bin_dir: Path) -> None:
    """Extract FFmpeg from Windows ZIP archive."""
    print("Extrayendo archivos...")
    
    with zipfile.ZipFile(archive_path, 'r') as zip_ref:
        # Find ffmpeg.exe and ffprobe.exe in the archive
        for file_info in zip_ref.filelist:
            filename = os.path.basename(file_info.filename)
            if filename in ["ffmpeg.exe", "ffprobe.exe"]:
                # Extract to bin directory
                file_info.filename = filename
                zip_ref.extract(file_info, bin_dir)
    
    print("Extracción completada!")


def extract_ffmpeg_linux(archive_path: Path, bin_dir: Path) -> None:
    """Extract FFmpeg from Linux tar.xz archive."""
    print("Extrayendo archivos...")
    
    with tarfile.open(archive_path, 'r:xz') as tar_ref:
        # Find ffmpeg and ffprobe in the archive
        for member in tar_ref.getmembers():
            filename = os.path.basename(member.name)
            if filename in ["ffmpeg", "ffprobe"]:
                # Extract to bin directory
                member.name = filename
                tar_ref.extract(member, bin_dir)
                # Make executable
                (bin_dir / filename).chmod(0o755)
    
    print("Extracción completada!")


def extract_ffmpeg_macos(archive_path: Path, bin_dir: Path) -> None:
    """Extract FFmpeg from macOS ZIP archive."""
    print("Extrayendo archivos...")
    
    with zipfile.ZipFile(archive_path, 'r') as zip_ref:
        zip_ref.extractall(bin_dir)
        # Make executable
        (bin_dir / "ffmpeg").chmod(0o755)
    
    # Download ffprobe separately for macOS
    ffprobe_url = "https://evermeet.cx/ffmpeg/ffprobe-6.1.zip"
    ffprobe_archive = bin_dir.parent / "ffprobe.zip"
    
    download_file(ffprobe_url, ffprobe_archive)
    
    with zipfile.ZipFile(ffprobe_archive, 'r') as zip_ref:
        zip_ref.extractall(bin_dir)
        (bin_dir / "ffprobe").chmod(0o755)
    
    ffprobe_archive.unlink()
    print("Extracción completada!")


def setup_ffmpeg() -> Optional[Path]:
    """
    Download and setup FFmpeg binaries.
    Returns the path to the FFmpeg bin directory if successful.
    """
    if is_ffmpeg_installed():
        print("✓ FFmpeg ya está instalado en el proyecto.")
        return get_bin_directory()
    
    system = platform.system()
    
    if system not in FFMPEG_URLS:
        print(f"❌ Sistema operativo no soportado: {system}")
        return None
    
    print(f"Configurando FFmpeg para {system}...")
    
    bin_dir = get_bin_directory()
    bin_dir.mkdir(parents=True, exist_ok=True)
    
    # Download FFmpeg
    url = FFMPEG_URLS[system]
    archive_name = "ffmpeg_download" + (".zip" if system in ["Windows", "Darwin"] else ".tar.xz")
    archive_path = bin_dir.parent / archive_name
    
    try:
        download_file(url, archive_path)
        
        # Extract based on platform
        if system == "Windows":
            extract_ffmpeg_windows(archive_path, bin_dir)
        elif system == "Linux":
            extract_ffmpeg_linux(archive_path, bin_dir)
        elif system == "Darwin":
            extract_ffmpeg_macos(archive_path, bin_dir)
        
        # Clean up archive
        archive_path.unlink()
        
        print(f"✓ FFmpeg instalado correctamente en: {bin_dir}")
        return bin_dir
        
    except Exception as e:
        print(f"❌ Error al configurar FFmpeg: {e}")
        # Clean up on error
        if archive_path.exists():
            archive_path.unlink()
        if bin_dir.exists():
            shutil.rmtree(bin_dir)
        return None


def get_ffmpeg_path() -> Optional[str]:
    """
    Get the path to FFmpeg binary.
    Returns the directory containing ffmpeg and ffprobe.
    """
    if not is_ffmpeg_installed():
        setup_ffmpeg()
    
    if is_ffmpeg_installed():
        return str(get_bin_directory())
    
    return None


if __name__ == "__main__":
    print("=" * 50)
    print("FFmpeg Setup para SpotiDownloader")
    print("=" * 50)
    
    result = setup_ffmpeg()
    
    if result:
        print("\n✓ Configuración completada exitosamente!")
        print(f"FFmpeg ubicado en: {result}")
    else:
        print("\n❌ La configuración falló.")
        sys.exit(1)
