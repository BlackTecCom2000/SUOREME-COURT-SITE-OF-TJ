/**
 * The one Theme Configuration shape for the whole platform.
 *
 * This is the single source of truth. Site Builder edits it, the runtime
 * provider holds it, the CSS variable generator projects it onto the document,
 * and every component consumes the generated variables. Nothing keeps a private
 * copy, and nothing reads a raw database key directly.
 */

/** Visual tokens that are not theme-specific but belong in the same object so
 *  the whole visual configuration travels together and resets atomically. */
export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  surfaceGlass: string;
  surfaceGlassStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentSecondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export interface ThemeGlass {
  /** backdrop-filter blur radius, e.g. "24px" */
  blur: string;
  /** 0..1 - how opaque the glass tint is */
  transparency: number;
  /** saturate() percentage applied with the blur */
  saturation: string;
  /** 0..1 - specular rim / border opacity */
  borderOpacity: number;
  /** 0..1 - drop shadow strength */
  shadowOpacity: number;
  /** 0..1 - inner top highlight strength */
  highlightOpacity: number;
}

export interface ThemeRadius {
  small: string;
  medium: string;
  large: string;
  xl: string;
  pill: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ThemeShadows {
  small: string;
  medium: string;
  large: string;
  /** the signature glass shadow */
  glass: string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingWeight: number;
  bodyWeight: number;
  /** multiplier applied to the display scale */
  headingScale: number;
  /** multiplier applied to the body scale */
  bodyScale: number;
  lineHeight: number;
}

export interface ThemeEffects {
  /** background gradient definition for the page field */
  gradient: string;
  /** ambient light bloom, 0..1 */
  glow: number;
  /** 0..1 - grain/noise overlay strength */
  noise: number;
  /** scale applied on hover, e.g. 1.02 */
  hoverScale: number;
  /** px of glow on hover */
  hoverGlow: string;
  /** base transition duration, e.g. "260ms" */
  transitionDuration: string;
}

export interface ThemeConfig {
  /** Light or dark. The provider resolves both into one token set. */
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  glass: ThemeGlass;
  radius: ThemeRadius;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  typography: ThemeTypography;
  effects: ThemeEffects;
}

/** Deep-partial updates, used by every editor control. */
export type ThemePatch = {
  [K in keyof ThemeConfig]?: ThemeConfig[K] extends object
    ? Partial<ThemeConfig[K]>
    : ThemeConfig[K];
};

/** A ThemeConfig whose every value is optional, as read from storage. */
export type ThemeConfigInput = {
  [K in keyof ThemeConfig]?: ThemeConfig[K] extends object
    ? Partial<ThemeConfig[K]>
    : ThemeConfig[K];
};
