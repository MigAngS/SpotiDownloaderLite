import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { MdDownloading } from "react-icons/md";
import { HiMusicNote } from "react-icons/hi";

export default function ProgressTracker({
    totalSongs,
    completedSongs,
    currentSong,
    songProgress = {},
    currentTheme
}) {
    const overallPercentage = totalSongs > 0 ? (completedSongs / totalSongs) * 100 : 0;

    return (
        <div
            className="backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl mb-6 animate-fade-in"
            style={{
                background: 'var(--color-surface)',
                border: `1px solid ${currentTheme === 'vibrant-pop' ? '#000' : 'rgba(255,255,255,0.2)'}`
            }}
        >
            <div className="flex items-center justify-between mb-6">
                <h3
                    className="text-2xl font-bold"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}
                >
                    Progreso de Descarga
                </h3>
                <span
                    className="text-lg font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    {completedSongs} / {totalSongs}
                </span>
            </div>

            <div className="mb-6">
                <div
                    className="flex justify-between text-sm mb-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    <span>Progreso General</span>
                    <span
                        className="font-semibold"
                        style={{ color: 'var(--color-primary)' }}
                    >
                        {Math.round(overallPercentage)}%
                    </span>
                </div>
                <div
                    className="w-full rounded-full h-3 overflow-hidden"
                    style={{ background: 'rgba(0,0,0,0.1)' }}
                >
                    <div
                        className="h-full transition-all duration-500 ease-out relative overflow-hidden"
                        style={{
                            width: `${overallPercentage}%`,
                            background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                </div>
            </div>

            {currentSong && (
                <div
                    className="rounded-xl p-4 mb-6"
                    style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))20`,
                        border: `1px solid var(--color-primary)`
                    }}
                >
                    <div
                        className="text-xs uppercase tracking-wider mb-2"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Descargando ahora:
                    </div>
                    <div
                        className="font-semibold flex items-center gap-2"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        <HiMusicNote style={{ color: 'var(--color-primary)' }} />
                        {currentSong}
                    </div>
                    <div className="flex gap-1 mt-3">
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-primary)' }}></div>
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-secondary)', animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-accent)', animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            )}

            {Object.keys(songProgress).length > 0 && (
                <div>
                    <div
                        className="text-sm font-semibold uppercase tracking-wider mb-4"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Detalles por Canción
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                        {Object.entries(songProgress).map(([songId, progress]) => (
                            <div
                                key={songId}
                                className="rounded-lg p-3"
                                style={{
                                    background: 'rgba(0,0,0,0.05)',
                                    border: `1px solid ${currentTheme === 'vibrant-pop' ? '#000' : 'rgba(255,255,255,0.1)'}`
                                }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex-shrink-0">
                                        {progress.status === 'completed' && <FaCheckCircle className="text-green-600" />}
                                        {progress.status === 'error' && <FaTimesCircle className="text-red-600" />}
                                        {progress.status === 'downloading' && <MdDownloading className="text-blue-600 animate-pulse" />}
                                        {progress.status === 'converting' && <FaSpinner className="text-yellow-600 animate-spin" />}
                                        {progress.status === 'started' && <FaSpinner className="text-gray-600 animate-spin" />}
                                    </div>
                                    <span
                                        className="text-sm flex-1"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        {progress.message || progress.status}
                                    </span>
                                </div>
                                {progress.percentage > 0 && progress.status !== 'completed' && (
                                    <div
                                        className="w-full rounded-full h-1 overflow-hidden"
                                        style={{ background: 'rgba(0,0,0,0.1)' }}
                                    >
                                        <div
                                            className="h-full transition-all duration-300"
                                            style={{
                                                width: `${progress.percentage}%`,
                                                background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
