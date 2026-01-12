import { useState, useEffect, useRef } from 'react';
import { themes } from '../themes';
import { FaPalette, FaTimes } from 'react-icons/fa';

export default function ThemeSwitcher({ currentTheme, onThemeChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="fixed top-4 right-4 z-50" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 md:p-3 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
                style={{
                    background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                    color: 'white'
                }}
                aria-label="Cambiar tema"
            >
                <FaPalette className="text-lg md:text-xl" />
            </button>

            {isOpen && (
                <div
                    className="absolute top-14 right-0 rounded-xl md:rounded-2xl shadow-2xl p-3 md:p-4 w-[200px] md:w-[280px] animate-fade-in"
                    style={{
                        background: `var(--color-surface)`,
                        border: `1px solid var(--color-primary)`,
                        backdropFilter: 'blur(12px)'
                    }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3
                            className="text-sm md:text-base font-bold"
                            style={{ color: `var(--color-text-primary)` }}
                        >
                            Temas
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-lg hover:bg-black/10 transition-colors"
                            aria-label="Cerrar"
                        >
                            <FaTimes style={{ color: 'var(--color-text-secondary)' }} />
                        </button>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                        {Object.entries(themes).map(([key, theme]) => {
                            const IconComponent = theme.icon;
                            const isActive = currentTheme === key;

                            return (
                                <button
                                    key={key}
                                    onClick={() => {
                                        onThemeChange(key);
                                        setIsOpen(false);
                                    }}
                                    className={`
                    w-full p-2 md:p-2.5 rounded-lg transition-all flex items-center gap-2 md:gap-3
                    hover:scale-[1.02] active:scale-[0.98]
                    ${isActive ? 'ring-2' : ''}
                  `}
                                    style={{
                                        background: isActive
                                            ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                                            : 'rgba(128, 128, 128, 0.15)',
                                        color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                                        ringColor: theme.colors.primary,
                                    }}
                                >
                                    <div
                                        className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center"
                                        style={{
                                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                                        }}
                                    >
                                        <IconComponent
                                            className="text-sm md:text-base"
                                            style={{ color: '#FFFFFF' }}
                                        />
                                    </div>
                                    <span className="font-semibold text-xs md:text-sm flex-1 text-left">
                                        {theme.name}
                                    </span>
                                    {isActive && (
                                        <span className="text-xs md:text-sm">✓</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
