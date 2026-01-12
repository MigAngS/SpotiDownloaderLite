from pydantic import BaseModel

class Song(BaseModel):
    title: str       # Ejemplo: "Shape of You"
    artist: str      # Ejemplo: "Ed Sheeran"
    query: str       # Ejemplo: "Shape of You - Ed Sheeran"
    youtube_url: str | None = None  # Se completará después
