import type { ThemeConfig } from './types';

/**
 * Re-applies an alpha channel to an authored colour so the transparency
 * slider genuinely drives the rendered material. Presets author their tints
 * with an alpha already; the slider must not become a no-op.
 */
const withAlpha = (color: string, alpha: number): string => {
  const a = Math.min(1, Math.max(0, alpha));
  const rgba = color.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(?:0|1|0?\.\d+|\.?\d+))?\s*\)$/i
  );
  if (rgba) return `rgba(${rgba[1]}, ${rgba[2]}, ${rgba[3]}, ${a.toFixed(3)})`;
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split('').map((ch) => ch + ch).join('');
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a.toFixed(3)})`;
  }
  return color;
};

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

/**
 * Projects a ThemeConfig onto CSS custom properties.
 *
 * This is the single bridge between the configuration and the stylesheets. It
 * writes BOTH token families on purpose:
 *
 *   --theme-*  the canonical names the task specifies
 *   --glass-*  the legacy family that most component rules already read
 *   --lg-*     the family the primary `.glass` material actually reads
 *
 * Writing all three is what closes the gap the audit found: Site Builder wrote
 * `--glass-opacity` and `--glass-border-opacity`, whose only consumers were
 * themselves overridden by a later rule, while nothing ever wrote `--lg-*` that
 * the real material depends on. One generator, no shadowed tokens, and every
 * existing surface becomes driven by the same configuration.
 */
export const buildCssVariables = (theme: ThemeConfig): Record<string, string> => {
  const c = theme.colors;
  const g = theme.glass;
  const r = theme.radius;
  const s = theme.shadows;
  const t = theme.typography;
  const e = theme.effects;

  const glassSurface = c.surfaceGlass;
  const glassStrong = c.surfaceGlassStrong;
  const glassRim = `rgba(255, 255, 255, ${g.borderOpacity})`;
  const glassHighlight = `inset 0 1px 0 rgba(255, 255, 255, ${g.highlightOpacity})`;

  return {
    /* ── canonical --theme-* ─────────────────────────────────────────── */
    '--theme-background': c.background,
    '--theme-background-secondary': c.backgroundSecondary,
    '--theme-surface': c.surface,
    '--theme-surface-secondary': c.surfaceSecondary,
    '--theme-surface-glass': c.surfaceGlass,
    '--theme-surface-glass-strong': c.surfaceGlassStrong,
    '--theme-text-primary': c.textPrimary,
    '--theme-text-secondary': c.textSecondary,
    '--theme-text-muted': c.textMuted,
    '--theme-border': c.border,
    '--theme-border-strong': c.borderStrong,
    '--theme-accent': c.accent,
    '--theme-accent-secondary': c.accentSecondary,
    '--theme-success': c.success,
    '--theme-warning': c.warning,
    '--theme-danger': c.danger,
    '--theme-info': c.info,

    '--theme-glass-blur': g.blur,
    '--theme-glass-saturation': g.saturation,
    '--theme-glass-transparency': String(g.transparency),
    '--theme-glass-border-opacity': String(g.borderOpacity),
    '--theme-glass-shadow-opacity': String(g.shadowOpacity),
    '--theme-glass-highlight-opacity': String(g.highlightOpacity),

    '--theme-radius-sm': r.small,
    '--theme-radius-md': r.medium,
    '--theme-radius-lg': r.large,
    '--theme-radius-xl': r.xl,
    '--theme-radius-pill': r.pill,

    '--theme-space-xs': theme.spacing.xs,
    '--theme-space-sm': theme.spacing.sm,
    '--theme-space-md': theme.spacing.md,
    '--theme-space-lg': theme.spacing.lg,
    '--theme-space-xl': theme.spacing.xl,
    '--theme-space-2xl': theme.spacing['2xl'],

    '--theme-shadow-sm': s.small,
    '--theme-shadow-md': s.medium,
    '--theme-shadow-lg': s.large,
    '--theme-shadow-glass': s.glass,

    '--theme-font-family': t.fontFamily,
    '--theme-heading-weight': String(t.headingWeight),
    '--theme-body-weight': String(t.bodyWeight),
    '--theme-heading-scale': String(t.headingScale),
    '--theme-body-scale': String(t.bodyScale),
    '--theme-line-height': String(t.lineHeight),

    '--theme-gradient': e.gradient,
    '--theme-noise': String(e.noise),
    '--theme-glow': String(e.glow),
    '--theme-hover-scale': String(e.hoverScale),
    '--theme-hover-glow': e.hoverGlow,
    '--theme-transition-duration': e.transitionDuration,

    /* ── legacy --glass-* family, still read by many rules ───────────── */
    '--glass-opacity': String(g.transparency),
    '--glass-opacity-hover': String(clamp01(g.transparency + 0.05)),
    '--glass-opacity-active': String(clamp01(g.transparency - 0.04)),
    '--glass-opacity-strong': String(clamp01(g.transparency + 0.05)),
    '--glass-surface': withAlpha(glassSurface, g.transparency),
    '--glass-surface-hover': withAlpha(c.surfaceSecondary, clamp01(g.transparency + 0.06)),
    '--glass-surface-active': withAlpha(c.surfaceSecondary, clamp01(g.transparency - 0.04)),
    '--glass-surface-strong': withAlpha(glassStrong, clamp01(g.transparency + 0.08)),
    '--glass-surface-dark': c.background,
    '--glass-surface-subtle': c.surfaceSecondary,
    '--glass-surface-tint': c.accentSecondary,
    '--glass-surface-scene': withAlpha(glassSurface, g.transparency),
    '--glass-border': c.border,
    '--glass-border-subtle': c.border,
    '--glass-border-opacity': String(g.borderOpacity),
    '--glass-border-hover': c.borderStrong,
    '--glass-blur': g.blur,
    '--glass-saturation': g.saturation,
    '--glass-shadow': s.glass,
    '--glass-shadow-hover': `${e.hoverGlow}, ${s.large}, ${glassHighlight}`,
    '--glass-shadow-active': s.medium,
    '--glass-highlight': glassHighlight,
    '--glass-highlight-inner': `inset 0 0 0 1px ${glassRim}`,
    '--glass-highlight-edge': `inset 0 1px 0 rgba(255, 255, 255, ${g.highlightOpacity + 0.12})`,
    '--glass-radius': r.medium,
    '--glass-radius-xs': r.small,
    '--glass-radius-sm': r.small,
    '--glass-radius-small': r.small,
    '--glass-radius-card': r.large,
    '--glass-radius-panel': r.xl,
    '--glass-radius-large': r.xl,
    '--glass-radius-xl': r.xl,

    /* ── --lg-* family: the material that actually renders ───────────── */
    '--lg-tint': withAlpha(glassSurface, g.transparency),
    '--lg-tint-hover': withAlpha(c.surfaceSecondary, clamp01(g.transparency + 0.06)),
    '--lg-tint-press': withAlpha(c.surfaceSecondary, clamp01(g.transparency - 0.04)),
    '--lg-blur': g.blur,
    '--lg-saturate': g.saturation,
    '--lg-brightness': theme.scheme === 'dark' ? '108%' : '102%',
    '--lg-highlight': glassHighlight,
    '--lg-highlight-edge': `inset 0 1px 0 rgba(255, 255, 255, ${g.highlightOpacity + 0.12})`,
    '--lg-rim-width': '1px',
    '--lg-rim-strength': String(g.borderOpacity + 0.5),
    '--lg-rim-top': glassRim,
    '--lg-rim-side': `rgba(255, 255, 255, ${g.borderOpacity * 0.28})`,
    '--lg-rim-bottom': `rgba(255, 255, 255, ${g.borderOpacity * 0.12})`,
    '--lg-shadow': s.glass,
    '--lg-shadow-hover': `${e.hoverGlow}, ${s.large}, ${glassHighlight}`,
    '--lg-shadow-pressed': s.medium,
    '--lg-radius-chip': r.small,
    '--lg-radius-button': r.medium,
    '--lg-radius-card': r.large,
    '--lg-radius-panel': r.xl,
    '--lg-press-scale': String(1 - (e.hoverScale - 1) * 6),
    '--lg-press-lift': '1px',
    '--lg-press-blur-delta': '-6px',
    '--lg-dur-press': e.transitionDuration,
    '--lg-dur-release': e.transitionDuration,
    '--lg-dur-hover': e.transitionDuration,
    '--lg-ease-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
    '--lg-ease-spring': 'cubic-bezier(0.34, 1.4, 0.64, 1)',

    /* ── existing aliases the codebase already reads ─────────────────── */
    '--court-gold': c.accent,
    '--accent-gold': c.accent,
    '--bg-primary': c.background,
    '--bg-secondary': c.backgroundSecondary,
    '--surface-card': c.surface,
    '--surface-card-hover': c.surfaceSecondary,
    '--text-primary': c.textPrimary,
    '--text-secondary': c.textSecondary,
    '--text-muted': c.textMuted,
    '--border-primary': c.border,
    '--border-hover': c.borderStrong,
    '--card-shadow': s.medium,

    /* ── typography: aliases the token sheet and components actually read ── */
    '--font-sans': t.fontFamily,
    '--weight-regular': String(t.bodyWeight),
    '--weight-medium': String(Math.min(800, t.bodyWeight + 100)),
    '--weight-semibold': String(Math.min(800, Math.max(t.bodyWeight + 100, t.headingWeight))),
    '--weight-bold': String(Math.min(800, t.headingWeight + 100)),
    '--leading-body': String(t.lineHeight),
    '--leading-heading': String(Math.max(1.05, t.lineHeight - 0.4)),
    '--leading-display': String(Math.max(1, t.lineHeight - 0.52)),
    '--type-body-scale': String(t.bodyScale),
    '--type-heading-scale': String(t.headingScale),

    /* ── the ambient field, driven by the configuration ──────────────── */
    '--theme-field-gradient': e.gradient,
    '--theme-field-glow': String(e.glow),
    '--theme-field-noise': String(e.noise),
  };
};

/**
 * Site-wide background/atmosphere settings (the keys the Site Builder's
 * "Фон" section edits). Separate from ThemeConfig because the CMS stores
 * them as independent design-settings rows, but written through the same
 * single CSS bridge so the sliders can never be dead again.
 */
export const buildSettingsVariables = (
  settings: Record<string, string>
): Record<string, string> => {
  const raw = (key: string, fallback: string): string => {
    const v = settings[key];
    return v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : fallback;
  };
  const num = (key: string, fallback: string): string => {
    const v = parseFloat(raw(key, fallback));
    return Number.isFinite(v) ? String(v) : fallback;
  };
  const safeCss = (value: string, fallback: string): string =>
    /^[\w\s%.,/-]+$/.test(value) && value.length <= 40 ? value : fallback;

  const blur = num('bg_blur', '0');
  const sat = num('bg_saturation', '100');
  const bri = num('bg_brightness', '100');
  const con = num('bg_contrast', '100');

  return {
    '--bg-overlay-opacity': String(
      Math.min(1, Math.max(0, parseFloat(raw('bg_overlay_opacity', '0.12')) || 0))
    ),
    '--bg-blur': `${blur}px`,
    '--bg-saturation': `${sat}%`,
    '--bg-brightness': `${bri}%`,
    '--bg-contrast': `${con}%`,
    '--bg-image-position': safeCss(raw('background_position', 'center'), 'center'),
    '--bg-image-fit': raw('background_size', 'cover') === 'contain' ? 'contain' : 'cover',
    '--theme-transition-enabled': raw('theme_transition_enabled', '1') === '0' ? '0' : '1',
    '--theme-transition-variant': safeCss(
      raw('theme_transition_variant', 'reveal'),
      'reveal'
    ),
    '--theme-transition-start': safeCss(raw('theme_transition_start', 'top'), 'top'),
    '--theme-transition-blur': raw('theme_transition_blur', '1') === '0' ? '0' : '1',
  };
};

/** Writes the settings variables onto an element (normally the root). */
export const applySettingsVariables = (
  settings: Record<string, string>,
  element: HTMLElement | null = typeof document !== 'undefined' ? document.documentElement : null
): void => {
  if (!element) return;
  for (const [name, value] of Object.entries(buildSettingsVariables(settings))) {
    element.style.setProperty(name, value);
  }
};

/** Writes the variables onto an element (normally document.documentElement). */
export const applyThemeVariables = (
  theme: ThemeConfig,
  element: HTMLElement | null = typeof document !== 'undefined' ? document.documentElement : null
): void => {
  if (!element) return;
  const vars = buildCssVariables(theme);
  for (const [name, value] of Object.entries(vars)) {
    element.style.setProperty(name, value);
  }
  element.dataset.theme = theme.scheme;
  element.classList.toggle('dark', theme.scheme === 'dark');
};
