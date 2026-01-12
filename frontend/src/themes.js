import {
    FaBolt,
    FaSun,
    FaCloudSun,
    FaGem,
    FaPaintBrush
} from 'react-icons/fa';

export const themes = {
    'dark-neon': {
        name: 'Dark Neon',
        icon: FaBolt,
        colors: {
            primary: '#00E5FF',
            secondary: '#FF00D4',
            accent: '#7C4DFF',
            background: '#0A0A0F',
            surface: '#15151F',
            textPrimary: '#FFFFFF',
            textSecondary: '#A4A4A6',
        },
        effects: {
            glow: 'drop-shadow(0 0 8px currentColor)',
            cardBg: 'rgba(21, 21, 31, 0.8)',
            border: 'rgba(0, 229, 255, 0.3)',
        }
    },
    'light-minimal': {
        name: 'Light Minimal',
        icon: FaSun,
        colors: {
            primary: '#0066FF',
            secondary: '#4D94FF',
            accent: '#FFB74D',
            background: '#FAFAFA',
            surface: '#FFFFFF',
            textPrimary: '#1C1C1F',
            textSecondary: '#6D6D6F',
        },
        effects: {
            shadow: '0 4px 12px rgba(0,0,0,0.08)',
            cardBg: 'rgba(255, 255, 255, 0.9)',
            border: 'rgba(0, 102, 255, 0.2)',
        }
    },
    'sunset-gradient': {
        name: 'Sunset Gradient',
        icon: FaCloudSun,
        colors: {
            primary: '#FF6F61',
            secondary: '#FF9A76',
            accent: '#C76DFF',
            background: '#2C1A47',
            surface: '#3C275F',
            textPrimary: '#FFFFFF',
            textSecondary: '#E0D0F0',
        },
        effects: {
            gradient: 'linear-gradient(135deg, #FF9A76, #FF6F61, #C76DFF)',
            cardBg: 'rgba(60, 39, 95, 0.8)',
            border: 'rgba(255, 111, 97, 0.3)',
        }
    },
    'crystal-glass': {
        name: 'Crystal Glass',
        icon: FaGem,
        colors: {
            primary: '#4FC3F7',
            secondary: '#81D4FA',
            accent: '#B3E5FC',
            background: '#E6F2FF',
            surface: 'rgba(255,255,255,0.25)',
            textPrimary: '#0D0D0D',
            textSecondary: '#4D4D4D',
        },
        effects: {
            glass: 'blur(12px) saturate(150%)',
            cardBg: 'rgba(255, 255, 255, 0.25)',
            border: 'rgba(255, 255, 255, 0.3)',
        }
    },
    'vibrant-pop': {
        name: 'Vibrant Pop Art',
        icon: FaPaintBrush,
        colors: {
            primary: '#FF1744',
            secondary: '#00E676',
            accent: '#2979FF',
            background: '#F3E5F5',
            surface: '#FFFFFF',
            textPrimary: '#000000',
            textSecondary: '#3A3A3A',
        },
        effects: {
            comic: 'drop-shadow(2px 2px 0 #000)',
            cardBg: 'rgba(255, 255, 255, 0.95)',
            border: 'rgba(0, 0, 0, 0.8)',
        }
    }
};

export const getThemeStyles = (themeKey) => {
    const theme = themes[themeKey];
    return {
        '--color-primary': theme.colors.primary,
        '--color-secondary': theme.colors.secondary,
        '--color-accent': theme.colors.accent,
        '--color-background': theme.colors.background,
        '--color-surface': theme.colors.surface,
        '--color-text-primary': theme.colors.textPrimary,
        '--color-text-secondary': theme.colors.textSecondary,
    };
};
