import SongItem from "./SongItem";
import { HiMusicNote } from "react-icons/hi";

export default function SongList({ songs, selectedIndexes, toggleSelection, songProgress = {}, currentTheme }) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-2xl md:text-3xl font-bold flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          <HiMusicNote style={{ color: 'var(--color-primary)' }} />
          Canciones Encontradas
        </h2>
        <span
          className="backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold"
          style={{
            background: 'var(--color-surface)',
            border: `1px solid ${currentTheme === 'vibrant-pop' ? '#000' : 'rgba(255,255,255,0.2)'}`,
            color: 'var(--color-text-primary)'
          }}
        >
          {songs.length} canciones
        </span>
      </div>

      <div className="space-y-3">
        {songs.map((song, index) => (
          <SongItem
            key={index}
            song={song}
            index={index}
            isSelected={selectedIndexes.includes(index)}
            toggleSelection={toggleSelection}
            progress={songProgress[`song_${index}`]}
            currentTheme={currentTheme}
          />
        ))}
      </div>
    </div>
  );
}
