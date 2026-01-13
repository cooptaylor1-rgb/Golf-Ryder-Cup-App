import type { Config } from 'tailwindcss';

/**
 * Golf Ryder Cup App - Tailwind Configuration
 *
 * THE MASTERS / AUGUSTA NATIONAL INSPIRED DESIGN SYSTEM
 *
 * Design Philosophy:
 * - Understated luxury over flashy effects
 * - Warm, inviting dark tones (not cold/sterile)
 * - Championship gold as the premium accent
 * - Serif typography for elegance
 * - Refined spacing and generous whitespace
 */
const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            // ============================================
            // COLORS - Official Masters / Augusta Palette
            // ============================================
            colors: {
                // THE MASTERS PRIMARY COLORS
                masters: {
                    green: '#006747',      // Official Masters green
                    'green-light': '#1B8F6A',
                    'green-dark': '#004D35',
                    gold: '#C4A747',        // Championship gold (muted, elegant)
                    'gold-light': '#D4BC6A',
                    'gold-dark': '#A38B2D',
                },

                // Augusta National Course Colors
                augusta: {
                    green: '#006747',
                    light: '#1B8F6A',
                    dark: '#004D35',
                },

                // Signature Augusta Elements
                magnolia: '#F5F1E8',        // Warm cream (Magnolia Lane)
                azalea: '#D84C6F',          // Azalea pink (subtle accent)
                'amen-corner': '#E8DCC8',   // Sand/bunker tones
                'rae-creek': '#5B8FA8',     // Water hazard blue
                dogwood: '#FEFEFE',         // Pure white (dogwood flowers)

                // Legacy aliases
                patrons: '#1B8F6A',
                'sunday-red': '#C62828',

                // Brand Colors (Masters-aligned)
                primary: {
                    DEFAULT: '#006747',
                    light: '#1B8F6A',
                    dark: '#004D35',
                },
                secondary: {
                    DEFAULT: '#C4A747',
                    light: '#D4BC6A',
                    dark: '#A38B2D',
                },
                gold: {
                    DEFAULT: '#C4A747',
                    light: '#D4BC6A',
                    dark: '#A38B2D',
                },

                // Award Colors
                platinum: '#E5E4E2',
                bronze: '#CD7F32',
                silver: '#C0C0C0',

                // Team Colors (Ryder Cup)
                'team-usa': {
                    DEFAULT: '#002868',     // Darker, more refined blue
                    light: '#3C5A99',
                    dark: '#001A4D',
                },
                'team-europe': {
                    DEFAULT: '#003399',     // EU blue
                    light: '#4169E1',
                    dark: '#002266',
                },

                // Semantic Colors (Muted for elegance)
                success: {
                    DEFAULT: '#4A9B6D',
                    light: '#6DB88D',
                    dark: '#357A52',
                },
                warning: {
                    DEFAULT: '#D4A84B',
                    light: '#E5C06E',
                    dark: '#B8923A',
                },
                error: {
                    DEFAULT: '#C45B5B',
                    light: '#D88080',
                    dark: '#A33D3D',
                },
                info: {
                    DEFAULT: '#5B8FA8',
                    light: '#7FAFC5',
                    dark: '#466F85',
                },

                // Golf Course Elements
                fairway: '#4A9B6D',
                bunker: '#E8DCC8',
                water: '#5B8FA8',
                rough: '#6B8E5B',
                'putting-green': '#1B8F6A',

                // SURFACE COLORS - Warm Dark Theme
                // Not pure black - warm undertones for luxury feel
                surface: {
                    DEFAULT: '#1A1814',     // Warm charcoal
                    base: '#0F0D0A',        // Rich dark (warm black)
                    background: '#0F0D0A',
                    raised: '#1A1814',
                    card: '#211F1A',        // Elevated card surface
                    elevated: '#2A2620',    // Higher elevation
                    overlay: '#1E1C18',
                    highlight: '#3A3530',
                    muted: '#2A2620',
                    border: '#3A3530',
                },

                // TEXT COLORS - Warm cream hierarchy
                text: {
                    primary: '#F5F1E8',     // Magnolia cream (not pure white)
                    secondary: '#B8B0A0',   // Muted warm gray
                    tertiary: '#807868',    // Subtle text
                    disabled: '#605850',
                    inverse: '#0F0D0A',
                    gold: '#C4A747',        // For premium accents
                },

                // Legacy aliases
                'text-primary': '#F5F1E8',
                'text-secondary': '#B8B0A0',
                'text-tertiary': '#807868',
                'text-on-primary': '#FFFFFF',
                'text-on-secondary': '#0F0D0A',
            },

            // ============================================
            // TYPOGRAPHY - Elegant serif + clean sans
            // ============================================
            fontFamily: {
                // Serif for headlines - timeless elegance
                serif: [
                    'Georgia',
                    'Cambria',
                    '"Times New Roman"',
                    'Times',
                    'serif',
                ],
                // Sans for body - clean readability
                sans: [
                    'Inter',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'Roboto',
                    'sans-serif',
                ],
                // Mono for scores - precise alignment
                mono: [
                    '"SF Mono"',
                    'ui-monospace',
                    'Monaco',
                    'Consolas',
                    'monospace',
                ],
                // Display font for special moments
                display: [
                    'Georgia',
                    'Cambria',
                    'serif',
                ],
            },

            fontSize: {
                // Score Typography
                'score-hero': ['72px', { lineHeight: '1', fontWeight: '700' }],
                'score-large': ['48px', { lineHeight: '1', fontWeight: '700' }],
                'score-medium': ['32px', { lineHeight: '1', fontWeight: '600' }],
                'score-small': ['24px', { lineHeight: '1', fontWeight: '500' }],

                // Display Typography (Serif)
                'display-xl': ['48px', { lineHeight: '1.1', fontWeight: '400', letterSpacing: '-0.02em' }],
                'display-lg': ['36px', { lineHeight: '1.15', fontWeight: '400', letterSpacing: '-0.01em' }],
                'display-md': ['28px', { lineHeight: '1.2', fontWeight: '400' }],
                'display-sm': ['22px', { lineHeight: '1.25', fontWeight: '400' }],

                // Standard typography
                'title-large': ['34px', { lineHeight: '41px', fontWeight: '600' }],
                'title': ['28px', { lineHeight: '34px', fontWeight: '600' }],
                'title-2': ['22px', { lineHeight: '28px', fontWeight: '600' }],
                'title-3': ['20px', { lineHeight: '25px', fontWeight: '500' }],
                'headline': ['17px', { lineHeight: '22px', fontWeight: '600' }],
                'body': ['17px', { lineHeight: '24px', fontWeight: '400' }],
                'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
                'callout': ['16px', { lineHeight: '21px', fontWeight: '400' }],
                'subheadline': ['15px', { lineHeight: '20px', fontWeight: '400' }],
                'footnote': ['13px', { lineHeight: '18px', fontWeight: '400' }],
                'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
                'caption-2': ['11px', { lineHeight: '13px', fontWeight: '400' }],
                'overline': ['11px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.1em' }],
            },

            // ============================================
            // SPACING - Generous for luxury feel
            // ============================================
            spacing: {
                xxs: '2px',
                xs: '4px',
                sm: '8px',
                md: '12px',
                lg: '16px',
                xl: '24px',
                '2xl': '32px',
                '3xl': '48px',
                '4xl': '64px',
                '5xl': '80px',
                '6xl': '96px',
                // Legacy
                xxl: '32px',
                xxxl: '48px',
                hero: '64px',
                massive: '96px',
            },

            // ============================================
            // BORDER RADIUS - Refined, not too rounded
            // ============================================
            borderRadius: {
                xs: '4px',
                sm: '6px',
                md: '8px',
                lg: '12px',
                xl: '16px',
                '2xl': '20px',
                '3xl': '24px',
                full: '9999px',
                // Legacy
                xxl: '24px',
            },

            // ============================================
            // SHADOWS - Warm, luxurious depth
            // ============================================
            boxShadow: {
                // Card shadows with warm tint
                'card-sm': '0 1px 3px rgba(15, 13, 10, 0.3), 0 1px 2px rgba(15, 13, 10, 0.2)',
                'card': '0 2px 8px rgba(15, 13, 10, 0.4), 0 0 1px rgba(196, 167, 71, 0.05)',
                'card-md': '0 4px 12px rgba(15, 13, 10, 0.4), 0 0 1px rgba(196, 167, 71, 0.08)',
                'card-lg': '0 8px 24px rgba(15, 13, 10, 0.5), 0 0 1px rgba(196, 167, 71, 0.1)',
                'card-xl': '0 12px 40px rgba(15, 13, 10, 0.6), 0 0 1px rgba(196, 167, 71, 0.12)',

                // Legacy aliases
                'card-default': '0 2px 8px rgba(15, 13, 10, 0.4), 0 0 1px rgba(196, 167, 71, 0.05)',
                'card-hover': '0 4px 16px rgba(15, 13, 10, 0.5), 0 0 1px rgba(196, 167, 71, 0.08)',
                'card-elevated': '0 8px 24px rgba(15, 13, 10, 0.5), 0 0 1px rgba(196, 167, 71, 0.1)',
                'elevated': '0 8px 24px rgba(15, 13, 10, 0.5)',

                // Glow effects (subtle, elegant)
                'glow-gold': '0 0 30px rgba(196, 167, 71, 0.25)',
                'glow-green': '0 0 30px rgba(0, 103, 71, 0.3)',
                'glow-subtle': '0 0 20px rgba(196, 167, 71, 0.15)',

                // Inner highlights
                'inner-gold': 'inset 0 1px 0 rgba(196, 167, 71, 0.1)',
                'inner-light': 'inset 0 1px 0 rgba(245, 241, 232, 0.05)',
            },

            // ============================================
            // ANIMATION - Smooth, understated
            // ============================================
            transitionDuration: {
                instant: '100ms',
                fast: '150ms',
                normal: '250ms',
                slow: '400ms',
                slower: '600ms',
            },

            transitionTimingFunction: {
                'masters': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'masters-in': 'cubic-bezier(0.4, 0, 1, 1)',
                'masters-out': 'cubic-bezier(0, 0, 0.2, 1)',
                'bounce-subtle': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },

            animation: {
                'fade-in': 'fadeIn 250ms ease-out',
                'fade-in-up': 'fadeInUp 300ms ease-out',
                'fade-in-down': 'fadeInDown 300ms ease-out',
                'scale-in': 'scaleIn 200ms ease-out',
                'slide-up': 'slideUp 300ms ease-out',
                'slide-down': 'slideDown 300ms ease-out',
                'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
                'pulse-gold': 'pulseGold 2.5s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'score-pop': 'scorePop 400ms ease-out',
                'glow': 'glow 2s ease-in-out infinite',
            },

            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.96)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseSubtle: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                pulseGold: {
                    '0%, 100%': {
                        boxShadow: '0 0 20px rgba(196, 167, 71, 0.2)',
                        borderColor: 'rgba(196, 167, 71, 0.3)',
                    },
                    '50%': {
                        boxShadow: '0 0 30px rgba(196, 167, 71, 0.35)',
                        borderColor: 'rgba(196, 167, 71, 0.5)',
                    },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                scorePop: {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)' },
                },
                glow: {
                    '0%, 100%': { opacity: '0.6' },
                    '50%': { opacity: '1' },
                },
            },

            // ============================================
            // GRADIENTS
            // ============================================
            backgroundImage: {
                // Premium gradients
                'gradient-gold': 'linear-gradient(135deg, #C4A747 0%, #A38B2D 100%)',
                'gradient-gold-subtle': 'linear-gradient(135deg, rgba(196, 167, 71, 0.1) 0%, rgba(163, 139, 45, 0.05) 100%)',
                'gradient-green': 'linear-gradient(135deg, #006747 0%, #004D35 100%)',
                'gradient-green-subtle': 'linear-gradient(135deg, rgba(0, 103, 71, 0.1) 0%, rgba(0, 77, 53, 0.05) 100%)',

                // Surface gradients
                'gradient-surface': 'linear-gradient(180deg, #1A1814 0%, #0F0D0A 100%)',
                'gradient-card': 'linear-gradient(180deg, #211F1A 0%, #1A1814 100%)',
                'gradient-hero': 'linear-gradient(180deg, rgba(0, 103, 71, 0.1) 0%, transparent 50%)',

                // Shimmer
                'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(196, 167, 71, 0.08) 50%, transparent 100%)',

                // Team gradients
                'gradient-usa': 'linear-gradient(135deg, #002868 0%, #001A4D 100%)',
                'gradient-europe': 'linear-gradient(135deg, #003399 0%, #002266 100%)',
            },

            // ============================================
            // BUTTON & TOUCH TARGET SIZES
            // ============================================
            minHeight: {
                'btn-sm': '40px',
                'btn-md': '48px',
                'btn-lg': '56px',
                'btn-xl': '64px',
                'touch': '44px',
            },

            minWidth: {
                'btn-sm': '40px',
                'btn-md': '48px',
                'btn-lg': '56px',
                'btn-xl': '64px',
                'touch': '44px',
            },
        },
    },
    plugins: [],
};

export default config;
