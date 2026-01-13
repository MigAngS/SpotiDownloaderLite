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
            surface: '#12121A',
            textPrimary: '#FFFFFF',
            textSecondary: '#A4A4A6',
        },
        effects: {
            glow: '0 0 12px rgba(0, 229, 255, 0.3)',
            textGlow: '0 0 4px rgba(0, 229, 255, 0.5), 0 0 8px rgba(0, 229, 255, 0.2)',
            border: '2px solid rgba(0, 229, 255, 0.5)',
            cardShadow: '0 8px 32px rgba(0,0,0,0.8), inset 0 0 10px rgba(0, 229, 255, 0.03)',
            buttonShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
            buttonHoverShadow: '0 0 25px rgba(0, 229, 255, 0.6)',
            iconGlow: 'drop-shadow(0 0 4px #00E5FF)'
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
            glow: 'none',
            textGlow: 'none',
            border: '1px solid rgba(0, 102, 255, 0.1)',
            cardShadow: '0 10px 30px rgba(0,0,0,0.05)',
            buttonShadow: '0 4px 12px rgba(0, 102, 255, 0.2)',
            buttonHoverShadow: '0 6px 16px rgba(0, 102, 255, 0.3)',
            iconGlow: 'none'
        }
    },
    'sunset-gradient': {
        name: 'Sunset Gradient',
        icon: FaCloudSun,
        colors: {
            primary: '#FF6F61',
            secondary: '#FF9A76',
            accent: '#C76DFF',
            background: '#1A0B2E',
            surface: '#25163D',
            textPrimary: '#FFFFFF',
            textSecondary: '#E0D0F0',
        },
        effects: {
            glow: 'none',
            textGlow: 'none',
            border: '1px solid rgba(255, 111, 97, 0.2)',
            cardShadow: '0 10px 40px rgba(0,0,0,0.3)',
            buttonShadow: '0 4px 15px rgba(255, 111, 97, 0.2)',
            buttonHoverShadow: '0 6px 20px rgba(255, 111, 97, 0.4)',
            iconGlow: 'none'
        }
    },
    'crystal-glass': {
        name: 'Crystal Glass',
        icon: FaGem,
        colors: {
            primary: '#4FC3F7',
            secondary: '#81D4FA',
            accent: '#B3E5FC',
            background: '#E1F5FE',
            surface: 'rgba(255,255,255,0.4)',
            textPrimary: '#000000ff',
            textSecondary: '#01579B',
        },
        backgroundImg: '/crystal-bg.png',
        effects: {
            glow: 'none',
            textGlow: 'none',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            cardShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            buttonShadow: '0 4px 15px rgba(79, 195, 247, 0.2)',
            buttonHoverShadow: '0 6px 20px rgba(79, 195, 247, 0.4)',
            iconGlow: 'none'
        }
    },
    'vibrant-pop': {
        name: 'Vibrant Pop Art',
        icon: FaPaintBrush,
        colors: {
            primary: '#FF1744',
            secondary: '#00E676',
            accent: '#2979FF',
            background: '#F8F9FA',
            surface: '#FFFFFF',
            textPrimary: '#000000',
            textSecondary: '#3A3A3A',
        },
        effects: {
            glow: 'none',
            textGlow: 'none',
            border: '3px solid #000000',
            cardShadow: '8px 8px 0 #000000',
            buttonShadow: '4px 4px 0 #000000',
            buttonHoverShadow: '0 0 0 #000000',
            iconGlow: 'none'
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
        '--color-bg-image': theme.backgroundImg ? `url('${theme.backgroundImg}')` : 'none',
        '--effect-glow': theme.effects.glow,
        '--effect-text-glow': theme.effects.textGlow,
        '--effect-border': theme.effects.border,
        '--effect-card-shadow': theme.effects.cardShadow,
        '--effect-button-shadow': theme.effects.buttonShadow,
        '--effect-button-hover-shadow': theme.effects.buttonHoverShadow,
        '--effect-icon-glow': theme.effects.iconGlow,
    };
};
