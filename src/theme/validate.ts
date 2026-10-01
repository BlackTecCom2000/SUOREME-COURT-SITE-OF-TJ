import type { ThemeConfig, ThemeConfigInput } from './types';
import { clonePreset, DEFAULT_PRESET_ID } from './presets';

/**
 * Validation, normalisation and storage encoding for the Theme Configuration.
 *
 * Everything crossing the persistence boundary goes through here. A hand-edited
 * database row or a stale client payload must never be able to inject CSS, so
 * colours are pattern-checked, numbers are clamped into range, and any unknown
 * or malformed key falls back to the preset default rather than propagating.
 */

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB =
  /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/i;
const LENGTH = /^-?\d+(?:\.\d+)?(?:px|rem|em|%|s|ms|deg|fr|ch|vh|vw)$/;
const FONT_STACK = /^[\w\s,'"\-()/.]+$/;
const GRADIENT = /^[\w\s,()#%.]+$/;

/** Anything that ends up inside a CSS value must match one of these. */
const isSafeCss = (value: string) =>
  HEX.test(value) || RGB.test(value) || LENGTH.test(value) || GRADIENT.test(value) || FONT_STACK.test(value);

const safeString = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 400 || !isSafeCss(trimmed)) return fallback;
  return trimmed;
};

const safeNumber = (value: unknown, fallback: number, min: number, max: number): number => {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

/** Deep-merges a partial over a base, validating each leaf. */
const mergeValidated = (base: ThemeConfig, input: ThemeConfigInput): ThemeConfig => {
  const colors = { ...base.colors };
  const glass = { ...base.glass };
  const radius = { ...base.radius };
  const spacing = { ...base.spacing };
  const shadows = { ...base.shadows };
  const typography = { ...base.typography };
  const effects = { ...base.effects };

  const ci = input.colors ?? {};
  for (const key of Object.keys(base.colors) as Array<keyof typeof colors>) {
    colors[key] = safeString((ci as Record<string, unknown>)[key], base.colors[key]);
  }

  const gi = input.glass ?? {};
  glass.blur = safeString(gi.blur, base.glass.blur);
  glass.saturation = safeString(gi.saturation, base.glass.saturation);
  glass.transparency = safeNumber(gi.transparency, base.glass.transparency, 0, 1);
  glass.borderOpacity = safeNumber(gi.borderOpacity, base.glass.borderOpacity, 0, 1);
  glass.shadowOpacity = safeNumber(gi.shadowOpacity, base.glass.shadowOpacity, 0, 1);
  glass.highlightOpacity = safeNumber(gi.highlightOpacity, base.glass.highlightOpacity, 0, 1);

  for (const group of [
    [radius, input.radius, base.radius],
    [spacing, input.spacing, base.spacing],
    [shadows, input.shadows, base.shadows],
  ] as const) {
    const target = group[0] as Record<string, string>;
    const source = (group[1] ?? {}) as Record<string, unknown>;
    const fallbackGroup = group[2] as unknown as Record<string, string>;
    for (const key of Object.keys(target)) {
      target[key] = safeString(source[key], fallbackGroup[key]);
    }
  }

  const ti = input.typography ?? {};
  typography.fontFamily = safeString(ti.fontFamily, base.typography.fontFamily);
  typography.headingWeight = safeNumber(ti.headingWeight, base.typography.headingWeight, 300, 800);
  typography.bodyWeight = safeNumber(ti.bodyWeight, base.typography.bodyWeight, 300, 700);
  typography.headingScale = safeNumber(ti.headingScale, base.typography.headingScale, 0.7, 1.6);
  typography.bodyScale = safeNumber(ti.bodyScale, base.typography.bodyScale, 0.8, 1.4);
  typography.lineHeight = safeNumber(ti.lineHeight, base.typography.lineHeight, 1.1, 2.2);

  const ei = input.effects ?? {};
  effects.gradient = safeString(ei.gradient, base.effects.gradient);
  effects.noise = safeNumber(ei.noise, base.effects.noise, 0, 0.2);
  effects.glow = safeNumber(ei.glow, base.effects.glow, 0, 1);
  effects.hoverScale = safeNumber(ei.hoverScale, base.effects.hoverScale, 1, 1.08);
  effects.hoverGlow = safeString(ei.hoverGlow, base.effects.hoverGlow);
  effects.transitionDuration = safeString(ei.transitionDuration, base.effects.transitionDuration);

  const scheme = input.scheme === 'light' || input.scheme === 'dark' ? input.scheme : base.scheme;

  return { scheme, colors, glass, radius, spacing, shadows, typography, effects };
};

/** Validates and completes a partial configuration against a preset. */
export const validateTheme = (input: unknown, presetId?: string): ThemeConfig => {
  const base = clonePreset(presetId ?? DEFAULT_PRESET_ID);
  if (!input || typeof input !== 'object') return base;
  return mergeValidated(base, input as ThemeConfigInput);
};

/* ── Storage encoding ────────────────────────────────────────────────────
   The whole configuration lives under ONE row so it round-trips atomically and
   the publish gate stays meaningful. Storing it as ~60 loose columns is what
   allowed the draft/published drift that broke the old control flow. */

export const THEME_STORAGE_KEY = 'theme_config_v1';
export const THEME_PRESET_KEY = 'theme_preset';

export const encodeTheme = (config: ThemeConfig): string => JSON.stringify(config);

export const decodeTheme = (raw: unknown, presetId?: string): ThemeConfig | null => {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    return validateTheme(JSON.parse(raw), presetId);
  } catch {
    return null;
  }
};
