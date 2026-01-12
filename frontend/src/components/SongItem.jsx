import { HiMusicNote } from "react-icons/hi";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { MdDownloading } from "react-icons/md";

export default function SongItem({ song, index, isSelected, toggleSelection, progress, currentTheme }) {
  const hasProgress = progress && progress.status;

  const getStatusIcon = () => {
    if (!hasProgress) return null;

    switch (progress.status) {
      case 'completed':
        return <FaCheckCircle className="text-green-600" />;
      case 'error':
        return <FaTimesCircle className="text-red-600" />;
      case 'downloading':
        return <MdDownloading className="text-blue-600 animate-pulse" />;
      case 'converting':
        return <FaSpinner className="text-yellow-600 animate-spin" />;
      case 'started':
        return <FaSpinner className="text-gray-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (!hasProgress) return null;

    switch (progress.status) {
      case 'completed':
        return 'Completado';
      case 'error':
        return 'Error';
      case 'downloading':
        return 'Descargando...';
      case 'converting':
        return 'Convirtiendo...';
      case 'started':
        return 'Iniciando...';
      default:
        return progress.status;
    }
  };

  const getStatusColor = () => {
    if (!hasProgress) return '';

    switch (progress.status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'downloading':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'converting':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'started':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div
      onClick={() => toggleSelection(index)}
      className={`
        backdrop-blur-sm rounded-xl p-4 transition-all cursor-pointer shadow-sm
        hover:scale-[1.01] hover:shadow-md active:scale-[0.99]
        ${isSelected ? 'ring-2' : ''}
      `}
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${currentTheme === 'vibrant-pop' ? '#FF1744' : 'var(--color-primary)'}, var(--color-secondary))20`
          : 'var(--color-surface)',
        border: `1px solid ${isSelected ? 'var(--color-primary)' : (currentTheme === 'vibrant-pop' ? '#000' : 'rgba(255,255,255,0.2)')}`,
        ringColor: 'var(--color-primary)'
      }}
    >
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelection(index)}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 rounded cursor-pointer transition-all accent-purple-600"
          style={{
            accentColor: 'var(--color-primary)'
          }}
        />

        <div
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`
          }}
        >
          <HiMusicNote className="text-2xl text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {song.title}
          </h3>
          <p
            className="text-sm truncate"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {song.artist}
          </p>

          {hasProgress && (
            <div className="mt-2 space-y-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
                {getStatusIcon()}
                {getStatusText()}
              </div>

              {progress.percentage > 0 && progress.status !== 'completed' && (
                <div
                  className="w-full rounded-full h-1.5 overflow-hidden"
                  style={{ background: 'rgba(0,0,0,0.1)' }}
                >
                  <div
                    className="h-full transition-all duration-300 ease-out"
                    style={{
                      width: `${progress.percentage}%`,
                      background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
