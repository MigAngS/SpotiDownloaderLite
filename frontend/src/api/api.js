const API_BASE = "/api";

export async function convertPlaylist(playlistUrl) {
  const response = await fetch(`${API_BASE}/convert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ playlist_url: playlistUrl }),
  });

  if (!response.ok) {
    throw new Error("No se pudo convertir la playlist");
  }

  return response.json();
}

// Inicia la descarga y devuelve la URL del archivo
export async function downloadPlaylist(playlistUrl, selected_songs, session_id) {
  const response = await fetch(`${API_BASE}/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playlist_url: playlistUrl,
      selected_songs: selected_songs,
      session_id: session_id,
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo iniciar la descarga.");
  }

  return response.json(); // { status: "started", session_id: "..." }
}

