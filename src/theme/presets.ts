import type { ThemeConfig } from './types';

/**
 * The five Glassmorphism presets.
 *
 * A preset is a complete ThemeConfig, never a partial patch, so applying one is
 * atomic: every dependent token changes together and nothing is left over from
 * the previous preset.
 *
 * All five share one material model. They differ in palette and weight, never in
 * construction, which is what keeps the site looking like a single system.
 */

const GLASS_GEOMETRY = {
  blur: '24px',
  saturation: '180%',
  borderOpacity: 0.16,
  shadowOpacity: 0.42,
  highlightOpacity: 0.2,
} as const;

const TYPE = {
  fontFamily:
    "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  headingWeight: 600,
  bodyWeight: 400,
  headingScale: 1,
  bodyScale: 1,
  /* 1.6 reproduces the token sheet's default leading exactly: body 1.6,
     heading = 1.6 - 0.4 = 1.2, display = 1.6 - 0.52 = 1.08. */
  lineHeight: 1.6,
} as const;

const RADIUS = {
  small: '12px',
  medium: '18px',
  large: '24px',
  xl: '32px',
  pill: '999px',
} as const;

const SPACING = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2.25rem',
  '2xl': '3.5rem',
} as const;

const EFFECTS = {
  noise: 0.02,
  hoverScale: 1.012,
  hoverGlow: '0 6px 24px rgba(0, 0, 0, 0.28)',
  transitionDuration: '260ms',
} as const;

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  config: ThemeConfig;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'glass-dark',
    name: 'Glass Dark',
    description: 'Ночное стекло: нейтральное, глубокий фон',
    config: {
      scheme: 'dark',
      colors: {
        background: '#05080f',
        backgroundSecondary: '#070d1c',
        // v2.19.3: neutral achromatic glass — the old moonlight-blue tints
        // (158,190,240…) drifted with the photograph under 180% saturation.
        // Alphas are unchanged, so weight and depth stay identical.
        surface: 'rgba(255, 255, 255, 0.11)',
        surfaceSecondary: 'rgba(255, 255, 255, 0.08)',
        surfaceGlass: 'rgba(255, 255, 255, 0.13)',
        surfaceGlassStrong: 'rgba(255, 255, 255, 0.18)',
        textPrimary: '#ffffff',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8',
        border: 'rgba(255, 255, 255, 0.16)',
        borderStrong: 'rgba(223, 190, 126, 0.55)',
        accent: '#dfbe7e',
        accentSecondary: '#9db8e8',
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171',
        info: '#60a5fa',
      },
      glass: { ...GLASS_GEOMETRY, transparency: 0.13, saturation: '105%' },
      radius: { ...RADIUS },
      spacing: { ...SPACING },
      shadows: {
        small: '0 2px 8px rgba(2, 6, 14, 0.32)',
        medium: '0 10px 28px rgba(2, 6, 14, 0.38)',
        large: '0 24px 60px rgba(2, 6, 14, 0.46)',
        glass: '0 16px 44px rgba(2, 6, 14, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.20)',
      },
      typography: { ...TYPE },
      effects: {
        ...EFFECTS,
        glow: 0.2,
        gradient:
          'radial-gradient(70% 42% at 14% 74%, rgba(84, 128, 214, 0.20) 0%, transparent 68%),' +
          ' radial-gradient(62% 40% at 86% 58%, rgba(196, 154, 74, 0.13) 0%, transparent 66%)',
      },
    },
  },
  {
    id: 'glass-light',
    name: 'Glass Light',
    description: 'Холодное серебристо-голубое стекло поверх дневного неба',
    config: {
      scheme: 'light',
      colors: {
        background: '#f5f7fb',
        backgroundSecondary: '#e8eef8',
        // v2.20.0: cool silver-blue veils (were neutral white). Alphas
        // untouched, so weight stays; dark text keeps full contrast.
        surface: 'rgba(231, 239, 251, 0.62)',
        surfaceSecondary: 'rgba(226, 235, 250, 0.44)',
        surfaceGlass: 'rgba(229, 238, 251, 0.58)',
        surfaceGlassStrong: 'rgba(224, 233, 249, 0.74)',
        textPrimary: '#0b1220',
        textSecondary: '#1e293b',
        textMuted: '#475569',
        border: 'rgba(23, 43, 77, 0.14)',
        borderStrong: 'rgba(154, 107, 18, 0.55)',
        accent: '#9a6b12',
        accentSecondary: '#1d4ed8',
        success: '#15803d',
        warning: '#b45309',
        danger: '#b91c1c',
        info: '#1d4ed8',
      },
      glass: { ...GLASS_GEOMETRY, saturation: '150%', borderOpacity: 0.14, transparency: 0.5 },
      radius: { ...RADIUS },
      spacing: { ...SPACING },
      shadows: {
        // v2.20.0: deeper, cooler shadows — light finally casts depth.
        small: '0 2px 8px rgba(15, 23, 42, 0.08)',
        medium: '0 10px 28px rgba(15, 23, 42, 0.12)',
        large: '0 24px 56px rgba(15, 23, 42, 0.16)',
        glass: '0 16px 40px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
      },
      typography: { ...TYPE },
      effects: {
        ...EFFECTS,
        glow: 0.1,
        gradient:
          'radial-gradient(70% 42% at 14% 74%, rgba(56, 118, 214, 0.12) 0%, transparent 68%),' +
          ' radial-gradient(62% 40% at 86% 58%, rgba(184, 138, 36, 0.10) 0%, transparent 66%)',
      },
    },
  },
  {
    id: 'glass-blue',
    name: 'Glass Blue',
    description: 'Профессиональный синий: спокойный, корпоративный',
    config: {
      scheme: 'dark',
      colors: {
        background: '#04101f',
        backgroundSecondary: '#061a33',
        surface: 'rgba(125, 178, 245, 0.14)',
        surfaceSecondary: 'rgba(110, 165, 235, 0.10)',
        surfaceGlass: 'rgba(140, 190, 250, 0.16)',
        surfaceGlassStrong: 'rgba(150, 200, 255, 0.22)',
        textPrimary: '#f2f8ff',
        textSecondary: '#c3daf5',
        textMuted: '#8fb0d8',
        border: 'rgba(160, 205, 255, 0.20)',
        borderStrong: 'rgba(120, 190, 255, 0.60)',
        accent: '#7cc0ff',
        accentSecondary: '#dfbe7e',
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#fca5a5',
        info: '#7cc0ff',
      },
      glass: { ...GLASS_GEOMETRY, saturation: '200%', transparency: 0.16 },
      radius: { ...RADIUS },
      spacing: { ...SPACING },
      shadows: {
        small: '0 2px 8px rgba(2, 10, 24, 0.34)',
        medium: '0 10px 28px rgba(2, 10, 24, 0.40)',
        large: '0 24px 60px rgba(2, 10, 24, 0.48)',
        glass: '0 16px 44px rgba(2, 10, 24, 0.44), inset 0 1px 0 rgba(190, 225, 255, 0.24)',
      },
      typography: { ...TYPE },
      effects: {
        ...EFFECTS,
        glow: 0.26,
        gradient:
          'radial-gradient(70% 42% at 14% 74%, rgba(60, 130, 235, 0.28) 0%, transparent 68%),' +
          ' radial-gradient(62% 40% at 86% 58%, rgba(124, 192, 255, 0.16) 0%, transparent 66%)',
      },
    },
  },
  {
    id: 'glass-emerald',
    name: 'Glass Emerald',
    description: 'Изумрудный: свежий, спокойный, официальный',
    config: {
      scheme: 'dark',
      colors: {
        background: '#03140f',
        backgroundSecondary: '#052018',
        surface: 'rgba(120, 220, 185, 0.12)',
        surfaceSecondary: 'rgba(105, 200, 170, 0.09)',
        surfaceGlass: 'rgba(135, 230, 195, 0.15)',
        surfaceGlassStrong: 'rgba(150, 240, 205, 0.20)',
        textPrimary: '#f0fff9',
        textSecondary: '#c3e9dc',
        textMuted: '#8fc4b3',
        border: 'rgba(150, 235, 205, 0.20)',
        borderStrong: 'rgba(223, 190, 126, 0.55)',
        accent: '#6ee7b7',
        accentSecondary: '#dfbe7e',
        success: '#6ee7b7',
        warning: '#fbbf24',
        danger: '#fca5a5',
        info: '#93c5fd',
      },
      glass: { ...GLASS_GEOMETRY, saturation: '175%', transparency: 0.15 },
      radius: { ...RADIUS },
      spacing: { ...SPACING },
      shadows: {
        small: '0 2px 8px rgba(1, 20, 14, 0.34)',
        medium: '0 10px 28px rgba(1, 20, 14, 0.40)',
        large: '0 24px 60px rgba(1, 20, 14, 0.48)',
        glass: '0 16px 44px rgba(1, 20, 14, 0.44), inset 0 1px 0 rgba(190, 255, 235, 0.22)',
      },
      typography: { ...TYPE },
      effects: {
        ...EFFECTS,
        glow: 0.24,
        gradient:
          'radial-gradient(70% 42% at 14% 74%, rgba(52, 180, 140, 0.26) 0%, transparent 68%),' +
          ' radial-gradient(62% 40% at 86% 58%, rgba(223, 190, 126, 0.14) 0%, transparent 66%)',
      },
    },
  },
  {
    id: 'glass-royal',
    name: 'Glass Royal',
    description: 'Королевский: глубокий фиолет, максимальная премиальность',
    config: {
      scheme: 'dark',
      colors: {
        background: '#0a0618',
        backgroundSecondary: '#150c2e',
        surface: 'rgba(178, 150, 245, 0.13)',
        surfaceSecondary: 'rgba(160, 130, 235, 0.10)',
        surfaceGlass: 'rgba(195, 170, 255, 0.16)',
        surfaceGlassStrong: 'rgba(210, 185, 255, 0.22)',
        textPrimary: '#faf7ff',
        textSecondary: '#dcd0f5',
        textMuted: '#a996d0',
        border: 'rgba(205, 180, 255, 0.22)',
        borderStrong: 'rgba(223, 190, 126, 0.60)',
        accent: '#dfbe7e',
        accentSecondary: '#c4b5fd',
        success: '#6ee7b7',
        warning: '#fbbf24',
        danger: '#fca5a5',
        info: '#c4b5fd',
      },
      glass: { ...GLASS_GEOMETRY, saturation: '210%', transparency: 0.16 },
      radius: { ...RADIUS, large: '26px', xl: '34px' },
      spacing: { ...SPACING },
      shadows: {
        small: '0 2px 8px rgba(10, 6, 24, 0.36)',
        medium: '0 10px 28px rgba(10, 6, 24, 0.42)',
        large: '0 24px 60px rgba(10, 6, 24, 0.50)',
        glass: '0 18px 48px rgba(10, 6, 24, 0.48), inset 0 1px 0 rgba(225, 210, 255, 0.26)',
      },
      typography: { ...TYPE },
      effects: {
        ...EFFECTS,
        glow: 0.28,
        hoverGlow: '0 8px 30px rgba(160, 120, 255, 0.32)',
        gradient:
          'radial-gradient(70% 42% at 14% 74%, rgba(139, 92, 246, 0.28) 0%, transparent 68%),' +
          ' radial-gradient(62% 40% at 86% 58%, rgba(223, 190, 126, 0.15) 0%, transparent 66%)',
      },
    },
  },
];

export const DEFAULT_PRESET_ID = 'glass-dark';

export const getPreset = (id: string | undefined): ThemePreset =>
  THEME_PRESETS.find((p) => p.id === id) ??
  THEME_PRESETS.find((p) => p.id === DEFAULT_PRESET_ID)!;

/** Deep clone so a consumer mutating a config cannot corrupt the preset. */
export const clonePreset = (id: string | undefined): ThemeConfig =>
  JSON.parse(JSON.stringify(getPreset(id).config)) as ThemeConfig;
