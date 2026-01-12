from zipfile import ZipFile
from pathlib import Path

def zip_files(input_dir: Path, output_zip: Path) -> Path:
    """Comprime todos los archivos de input_dir en un ZIP."""
    try:
        with ZipFile(output_zip, 'w') as zipf:
            for file in input_dir.glob("*.mp3"):
                zipf.write(file, arcname=file.name)
        return output_zip
    except Exception as e:
        raise RuntimeError(f"Error al crear ZIP: {str(e)}")
