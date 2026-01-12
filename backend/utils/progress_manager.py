"""
Progress tracking manager using in-memory storage
Replaces WebSocket with HTTP polling
"""
from typing import Dict, Any
from datetime import datetime

class ProgressManager:
    def __init__(self):
        # Store progress data by session_id
        self.sessions: Dict[str, Dict[str, Any]] = {}
    
    def create_session(self, session_id: str, total_songs: int):
        """Initialize a new download session"""
        self.sessions[session_id] = {
            "total_songs": total_songs,
            "completed_songs": 0,
            "current_song": "",
            "song_progress": {},
            "status": "in_progress",
            "download_url": None,
            "created_at": datetime.now().isoformat()
        }
    
    def update_song_progress(self, session_id: str, song_id: str, status: str, percentage: int = 0, message: str = ""):
        """Update progress for a specific song"""
        if session_id in self.sessions:
            self.sessions[session_id]["song_progress"][song_id] = {
                "status": status,
                "percentage": percentage,
                "message": message
            }
    
    def update_session_progress(self, session_id: str, completed_songs: int, current_song: str = ""):
        """Update overall session progress"""
        if session_id in self.sessions:
            self.sessions[session_id]["completed_songs"] = completed_songs
            self.sessions[session_id]["current_song"] = current_song
    
    def complete_session(self, session_id: str, download_url: str):
        """Mark session as complete"""
        if session_id in self.sessions:
            self.sessions[session_id]["status"] = "completed"
            self.sessions[session_id]["download_url"] = download_url
            self.sessions[session_id]["current_song"] = ""
    
    def get_progress(self, session_id: str) -> Dict[str, Any]:
        """Get current progress for a session"""
        return self.sessions.get(session_id, {})
    
    def cleanup_session(self, session_id: str):
        """Remove session data (call after download is retrieved)"""
        if session_id in self.sessions:
            del self.sessions[session_id]

# Global progress manager instance
progress_manager = ProgressManager()
