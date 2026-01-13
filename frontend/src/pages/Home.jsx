import { useState, useEffect, useRef } from "react";
import { convertPlaylist, downloadPlaylist, cancelDownload } from "../api/api";
import SongList from "../components/SongList";
import ProgressTracker from "../components/ProgressTracker";
import Toast from "../components/Toast";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { FaSearch, FaDownload, FaSpotify, FaHeart, FaTimesCircle, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaBook } from "react-icons/fa";
import { HiMusicNote } from "react-icons/hi";
import { getThemeStyles } from "../themes";

export default function Home() {
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [songs, setSongs] = useState([]);
    const [selectedIndexes, setSelectedIndexes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadLink, setDownloadLink] = useState("");
    const [sessionId, setSessionId] = useState("");

    const [totalSongs, setTotalSongs] = useState(0);
    const [completedSongs, setCompletedSongs] = useState(0);
    const [currentSong, setCurrentSong] = useState("");
    const [songProgress, setSongProgress] = useState({});
    const [toast, setToast] = useState(null);
    const pollingIntervalRef = useRef(null);

    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('spotidownloader-theme') || 'light-minimal';
    });

    useEffect(() => {
        const styles = getThemeStyles(currentTheme);
        Object.entries(styles).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
        localStorage.setItem('spotidownloader-theme', currentTheme);
    }, [currentTheme]);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const validateSpotifyUrl = (url) => {
        const spotifyRegex = /^https:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+/;
        return spotifyRegex.test(url);
    };

    const handleConvert = async () => {
        if (!playlistUrl.trim()) {
            showToast("Por favor ingresa una URL de playlist", "warning");
            return;
        }

        if (!validateSpotifyUrl(playlistUrl)) {
            showToast("URL de Spotify inválida. Debe ser una playlist de Spotify.", "error");
            return;
        }

        setSongs([]);
        setSelectedIndexes([]);
        setDownloadLink("");
        setLoading(true);

        try {
            const data = await convertPlaylist(playlistUrl);
            setSongs(data);
            setSelectedIndexes(data.map((_, i) => i));
            showToast(`${data.length} canciones encontradas!`, "success");
        } catch (err) {
            showToast("Error al convertir la playlist. Verifica la URL.", "error");
        } finally {
            setLoading(false);
        }
    };

    const pollProgress = async (sessionId) => {
        try {
            const response = await fetch(`/api/progress/${sessionId}`);
            if (!response.ok) return;

            const data = await response.json();

            setTotalSongs(data.total_songs || 0);
            setCompletedSongs(data.completed_songs || 0);
            setCurrentSong(data.current_song || "");
            setSongProgress(data.song_progress || {});

            if (data.status === 'completed' && data.download_url) {
                setDownloadLink(data.download_url);
                setIsDownloading(false);
                setCurrentSong("");
                showToast(`¡Descarga completada! ${data.completed_songs}/${data.total_songs} canciones`, "success");

                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                }
            }
        } catch (error) {
            console.error('Error polling progress:', error);
        }
    };

    const startPolling = (sessionId) => {
        pollingIntervalRef.current = setInterval(() => {
            pollProgress(sessionId);
        }, 500);
    };

    const handleDownload = async () => {
        if (selectedIndexes.length === 0) {
            showToast("Selecciona al menos una canción", "warning");
            return;
        }

        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
        setDownloadLink("");
        setIsDownloading(true);
        setSongProgress({});
        setTotalSongs(selectedIndexes.length);
        setCompletedSongs(0);

        try {
            // Asegurar que las canciones sigan el orden de la lista original, no el de selección
            const selectedSongs = songs.filter((_, index) => selectedIndexes.includes(index));
            await downloadPlaylist(playlistUrl, selectedSongs, newSessionId);

            startPolling(newSessionId);
            showToast("Descarga iniciada. Observa el progreso abajo.", "info");
        } catch (err) {
            showToast("Error al iniciar la descarga", "error");
            setIsDownloading(false);
        }
    };

    const toggleSelection = (index) => {
        setSelectedIndexes(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const selectAll = () => setSelectedIndexes(songs.map((_, i) => i));
    const deselectAll = () => setSelectedIndexes([]);

    const handleCancelDownload = async () => {
        if (!sessionId || !isDownloading) return;

        // Detener polling inmediatamente
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }

        try {
            await cancelDownload(sessionId);

            // Marcar canciones en progreso como canceladas
            setSongProgress(prev => {
                const newProgress = { ...prev };
                Object.keys(newProgress).forEach(key => {
                    const status = newProgress[key].status;
                    if (status !== 'completed' && status !== 'error') {
                        newProgress[key] = {
                            ...newProgress[key],
                            status: 'cancelled',
                            message: 'Cancelado por el usuario'
                        };
                    }
                });
                return newProgress;
            });

            setIsDownloading(false);
            setCurrentSong("");
            showToast("Descarga cancelada", "warning");
        } catch (err) {
            showToast("Error al cancelar la descarga", "error");
        }
    };

    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    return (
        <div className="min-h-screen p-4 md:p-8 transition-all duration-300 ease-in-out">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <ThemeSwitcher currentTheme={currentTheme} onThemeChange={setCurrentTheme} />

            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-8 md:mb-12 animate-fade-in">
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-4 px-12">
                        <HiMusicNote
                            className="text-4xl md:text-6xl transition-all duration-300"
                            style={{
                                color: 'var(--color-primary)',
                                filter: 'var(--effect-icon-glow)'
                            }}
                        />
                        <h1
                            className="text-3xl md:text-6xl font-bold transition-all duration-300 pb-2 px-1"
                            style={{
                                background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                textShadow: 'var(--effect-text-glow)',
                                lineHeight: '1.2'
                            }}
                        >
                            SpotiDownloader Lite
                        </h1>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', textShadow: 'var(--effect-text-glow)' }} className="text-lg md:text-xl px-4">
                        Convierte tus playlists de Spotify en archivos MP3
                    </p>
                </header>

                <div
                    className="backdrop-blur-lg rounded-2xl p-6 md:p-8 mb-6 transition-all duration-300"
                    style={{
                        background: 'var(--color-surface)',
                        border: 'var(--effect-border)',
                        boxShadow: 'var(--effect-card-shadow)'
                    }}
                >
                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <FaSpotify
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-xl"
                                style={{ color: '#1DB954' }}
                            />
                            <input
                                type="text"
                                value={playlistUrl}
                                onChange={(e) => setPlaylistUrl(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleConvert()}
                                placeholder="https://open.spotify.com/playlist/..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl transition-all focus:outline-none focus:ring-2"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--color-text-primary)',
                                    border: 'var(--effect-border)',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                                }}
                                disabled={loading || isDownloading}
                            />
                        </div>

                        <button
                            onClick={handleConvert}
                            className="w-full font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{
                                background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                                color: '#FFFFFF',
                                border: 'var(--effect-border)',
                                boxShadow: 'var(--effect-button-shadow)'
                            }}
                            disabled={loading || isDownloading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Cargando...
                                </>
                            ) : (
                                <>
                                    <FaSearch />
                                    Buscar Canciones
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {songs.length > 0 && (
                    <div className="mb-6 space-y-4">
                        <div
                            className="backdrop-blur-sm rounded-xl p-4 flex flex-wrap items-center gap-4 transition-all duration-300"
                            style={{
                                background: 'var(--color-surface)',
                                border: 'var(--effect-border)',
                                boxShadow: 'var(--effect-card-shadow)'
                            }}
                        >
                            <button
                                onClick={selectAll}
                                className="font-medium transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ color: 'var(--color-primary)' }}
                                disabled={isDownloading}
                            >
                                Seleccionar Todas
                            </button>
                            <span style={{ color: 'var(--color-text-secondary)' }}>•</span>
                            <button
                                onClick={deselectAll}
                                className="font-medium transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ color: 'var(--color-primary)' }}
                                disabled={isDownloading}
                            >
                                Deseleccionar Todas
                            </button>
                            <span
                                className="ml-auto font-semibold"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                {selectedIndexes.length} seleccionadas
                            </span>
                        </div>

                        <button
                            onClick={handleDownload}
                            className="w-full font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{
                                background: currentTheme === 'vibrant-pop'
                                    ? '#00E676'
                                    : 'linear-gradient(135deg, #10B981, #059669)',
                                color: '#FFFFFF',
                                border: 'var(--effect-border)',
                                boxShadow: 'var(--effect-button-shadow)'
                            }}
                            disabled={isDownloading || selectedIndexes.length === 0}
                        >
                            {isDownloading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Descargando...
                                </>
                            ) : (
                                <>
                                    <FaDownload />
                                    Descargar {selectedIndexes.length} Canción{selectedIndexes.length !== 1 ? 'es' : ''}
                                </>
                            )}
                        </button>
                    </div>
                )}

                {isDownloading && (
                    <ProgressTracker
                        totalSongs={totalSongs}
                        completedSongs={completedSongs}
                        currentSong={currentSong}
                        songProgress={songProgress}
                        currentTheme={currentTheme}
                        onCancel={handleCancelDownload}
                    />
                )}

                {downloadLink && (
                    <div
                        className="backdrop-blur-lg rounded-2xl p-8 text-center mb-6 animate-fade-in shadow-lg"
                        style={{
                            background: currentTheme === 'vibrant-pop'
                                ? '#FFFFFF'
                                : 'rgba(16, 185, 129, 0.1)',
                            border: `2px solid ${currentTheme === 'vibrant-pop' ? '#00E676' : '#10B981'}`
                        }}
                    >
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"
                            style={{
                                background: 'linear-gradient(135deg, #10B981, #059669)'
                            }}
                        >
                            <FaDownload className="text-3xl text-white" />
                        </div>
                        <h3
                            className="text-2xl font-bold mb-2"
                            style={{
                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            ¡Descarga Completada!
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)' }} className="mb-6">
                            Tu archivo ZIP está listo para descargar
                        </p>
                        <a
                            href={downloadLink}
                            download
                            className="inline-flex items-center gap-2 font-semibold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                            style={{
                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                color: '#FFFFFF',
                                border: currentTheme === 'vibrant-pop' ? '3px solid #000' : 'none'
                            }}
                        >
                            <FaDownload />
                            Descargar ZIP
                        </a>
                    </div>
                )}

                {!isDownloading && !downloadLink && completedSongs > 0 && completedSongs === totalSongs && (
                    <div
                        className="backdrop-blur-lg rounded-2xl p-8 text-center mb-6 animate-fade-in shadow-lg"
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '2px solid #EF4444'
                        }}
                    >
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                        >
                            <FaTimesCircle className="text-3xl text-white" />
                        </div>
                        <h3
                            className="text-2xl font-bold mb-2"
                            style={{
                                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            Error en la Descarga
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)' }} className="mb-2">
                            No se pudo descargar ninguna canción
                        </p>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Por favor verifica tu conexión e intenta nuevamente
                        </p>
                    </div>
                )}

                {songs.length > 0 && (
                    <SongList
                        songs={songs}
                        selectedIndexes={selectedIndexes}
                        toggleSelection={toggleSelection}
                        songProgress={songProgress}
                        currentTheme={currentTheme}
                        isDownloading={isDownloading}
                    />
                )}
            </div>

            {/* Instructions Section */}
            <div className="max-w-4xl mx-auto mt-16 mb-8">
                <div
                    className="backdrop-blur-lg rounded-2xl p-6 md:p-8 transition-all duration-300"
                    style={{
                        background: 'var(--color-surface)',
                        border: 'var(--effect-border)',
                        boxShadow: 'var(--effect-card-shadow)'
                    }}
                >
                    <h2
                        className="text-2xl md:text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3 transition-all duration-300"
                        style={{
                            background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: 'var(--effect-text-glow)'
                        }}
                    >
                        <FaBook style={{ color: 'var(--color-primary)' }} />
                        Cómo Usar SpotiDownloader Lite
                    </h2>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div
                                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                                    style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
                                >
                                    1
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                                        Copia el enlace de tu playlist
                                    </h3>
                                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        Abre Spotify, ve a tu playlist y copia el enlace (botón "Compartir" → "Copiar enlace de la playlist")
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div
                                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                                    style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
                                >
                                    2
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                                        Pega el enlace y busca
                                    </h3>
                                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        Pega el enlace en el campo de arriba y haz clic en "Buscar Canciones"
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div
                                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                                    style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
                                >
                                    3
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                                        Selecciona las canciones
                                    </h3>
                                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        Elige las canciones que deseas descargar (por defecto todas están seleccionadas)
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div
                                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                                    style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
                                >
                                    4
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                                        Descarga tu música
                                    </h3>
                                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        Haz clic en "Descargar" y espera a que se complete el proceso. Recibirás un archivo ZIP con todas tus canciones en MP3
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="rounded-xl p-4 mt-6"
                            style={{
                                background: currentTheme === 'vibrant-pop'
                                    ? 'rgba(255, 193, 7, 0.1)'
                                    : 'rgba(255, 152, 0, 0.1)',
                                border: `2px solid ${currentTheme === 'vibrant-pop' ? '#FFC107' : '#FF9800'}`
                            }}
                        >
                            <div className="flex gap-3">
                                <FaExclamationTriangle className="text-2xl flex-shrink-0" style={{ color: currentTheme === 'vibrant-pop' ? '#000' : '#FF9800' }} />
                                <div>
                                    <h4 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                        Limitaciones Actuales
                                    </h4>
                                    <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                                        <li className="flex gap-2 items-start">
                                            <FaCheckCircle className="mt-1 flex-shrink-0 text-green-500" />
                                            <span><strong>Playlists de usuarios:</strong> Puedes usar playlists creadas por ti o por otros usuarios</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <FaTimesCircle className="mt-1 flex-shrink-0 text-red-500" />
                                            <span><strong>Playlists generadas por Spotify:</strong> Por el momento, no se pueden descargar playlists automáticas de Spotify (como "Descubrimiento Semanal", "Daily Mix", etc.)</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <FaLightbulb className="mt-1 flex-shrink-0 text-yellow-500" />
                                            <span><strong>Tip:</strong> Si quieres descargar canciones de una playlist generada por Spotify, crea tu propia playlist y agrega las canciones manualmente</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer
                className="text-center mt-12 pt-8"
                style={{ borderTop: `1px solid ${currentTheme === 'vibrant-pop' ? '#000' : 'rgba(255,255,255,0.1)'}` }}
            >
                <p
                    className="flex items-center justify-center gap-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    Creado con <FaHeart className="text-red-500" /> por Miguel Angel Sairitupa Paucar
                </p>
            </footer>
        </div>
    );
}
