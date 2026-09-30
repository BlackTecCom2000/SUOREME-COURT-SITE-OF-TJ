import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDesignSettings } from './useDesignSettings';

/**
 * Theme reveal transition.
 *
 * Ported from Skiper 26 (Theme_buttons_002, by @gurvinder-singh02,
 * https://gxuri.me) - an independent rebuild for this codebase.
 *
 * Upstream is a Next.js component built on `framer-motion` and `next-themes`.
 * This project is Vite + React with its own ThemeContext, so the port keeps
 * the idea - a directional clip-path wipe driven by the View Transitions API -
 * and drops the framework-specific parts. There is no `motion` animation here
 * on purpose: the View Transitions API snapshots the whole document, which is
 * what makes a full-page wipe possible, and a component-level animation could
 * not produce that.
 *
 * `createThemeReveal` is pure: it returns a name and a block of CSS, so it can
 * be unit-tested or reused without touching the DOM.
 */

export type RevealVariant = 'circle' | 'rectangle' | 'polygon' | 'circle-blur';
export type RevealStart =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'
  | 'top-center'
  | 'bottom-center'
  | 'bottom-up'
  | 'top-down'
  | 'left-right'
  | 'right-left';

interface Reveal {
  name: string;
  css: string;
}

/** Scopes the reveal so it cannot lose to the app's own cross-fade rules. */
const MARKER = 'theme-reveal';
const STYLE_ID = 'sud-theme-reveal';
const DURATION_MS = 700;

const CLIP: Record<string, { from: string; to: string }> = {
  'bottom-up': {
    from: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
    to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  'top-down': {
    from: 'polygon(0% 0%, 100% 0%, 0% 0%, 0% 0%)',
    to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  'left-right': {
    from: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
    to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  'right-left': {
    from: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
    to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  'top-left': {
    from: 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)',
    to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  'top-right': {
    from: 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)',
    to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  'bottom-left': {
    from: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)',
    to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  'bottom-right': {
    from: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)',
    to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  center: { from: 'circle(0% at 50% 50%)', to: 'circle(150% at 50% 50%)' },
  'top-center': { from: 'circle(0% at 50% 0%)', to: 'circle(150% at 50% 0%)' },
  'bottom-center': { from: 'circle(0% at 50% 100%)', to: 'circle(150% at 50% 100%)' },
  'top-left-c': { from: 'circle(0% at 0% 0%)', to: 'circle(150% at 0% 0%)' },
  'top-right-c': { from: 'circle(0% at 100% 0%)', to: 'circle(150% at 100% 0%)' },
  'bottom-left-c': { from: 'circle(0% at 0% 100%)', to: 'circle(150% at 0% 100%)' },
  'bottom-right-c': { from: 'circle(0% at 100% 100%)', to: 'circle(150% at 100% 100%)' },
};

/**
 * Diagonal wipes, one per corner.
 *
 * Upstream ships a single polygon and ignores the direction entirely, which was
 * fine for a fixed demo but would have made the CMS direction setting a no-op
 * for seven of its eleven options. Each corner gets a real anchor instead, so
 * every combination a visitor can pick produces a visible change. Directions
 * with no diagonal equivalent (an edge or the centre) fall through to the axis
 * clip, which is a predictable result rather than a silent no-op.
 */
const DIAGONAL: Record<string, { from: string; to: string }> = {
  'top-left': {
    from: 'polygon(0 0, 0 0, 0 0)',
    to: 'polygon(0 0, 100% 0, 0 100%)',
  },
  'top-right': {
    from: 'polygon(100% 0, 100% 0, 100% 0)',
    to: 'polygon(0 0, 100% 0, 100% 100%)',
  },
  'bottom-left': {
    from: 'polygon(0 100%, 0 100%, 0 100%)',
    to: 'polygon(0 0, 0 100%, 100% 100%)',
  },
  'bottom-right': {
    from: 'polygon(100% 100%, 100% 100%, 100% 100%)',
    to: 'polygon(0 0, 100% 0, 100% 100%)',
  },
};

/**
 * Axis-aligned wipes for the rectangle variant, one per direction.
 *
 * The shared CLIP table uses diagonal polygons for its corner entries, which
 * looked fine for a single fixed transition but would have made "Прямоугольная
 * шторка" show a diagonal whenever an editor picked a corner. inset() keeps the
 * rectangle variant honest for all eleven directions; the diagonals are left to
 * the polygon variant.
 */
const RECT: Record<string, { from: string; to: string }> = {
  center: { from: 'inset(50% 50% 50% 50%)', to: 'inset(0%)' },
  'top-left': { from: 'inset(0% 100% 100% 0%)', to: 'inset(0%)' },
  'top-right': { from: 'inset(0% 0% 100% 100%)', to: 'inset(0%)' },
  'bottom-left': { from: 'inset(100% 100% 0% 0%)', to: 'inset(0%)' },
  'bottom-right': { from: 'inset(100% 0% 0% 100%)', to: 'inset(0%)' },
  'top-center': { from: 'inset(0% 50% 100% 50%)', to: 'inset(0%)' },
  'bottom-center': { from: 'inset(100% 50% 0% 50%)', to: 'inset(0%)' },
  'top-down': { from: 'inset(0% 0% 100% 0%)', to: 'inset(0%)' },
  'bottom-up': { from: 'inset(100% 0% 0% 0%)', to: 'inset(0%)' },
  'left-right': { from: 'inset(0% 100% 0% 0%)', to: 'inset(0%)' },
  'right-left': { from: 'inset(0% 0% 0% 100%)', to: 'inset(0%)' },
};

/**
 * Corners are circles for the circle variants and rectangles otherwise.
 * `circle-blur` shares the circular geometry with `circle`; it differs only in
 * forcing the blur, which is handled in createThemeReveal.
 */
const resolveClip = (variant: RevealVariant, start: RevealStart) => {
  if (variant === 'polygon') {
    return DIAGONAL[start] ?? CLIP[start] ?? CLIP.center;
  }
  if (variant === 'rectangle') {
    return RECT[start] ?? CLIP[start] ?? CLIP.center;
  }
  if (variant === 'circle' || variant === 'circle-blur') {
    const corner = CLIP[`${start}-c`];
    if (corner) return corner;
    return CLIP[start] ?? CLIP.center;
  }
  return CLIP[start] ?? CLIP.center;
};

/** Builds the CSS for one transition. Pure, no DOM access. */
export const createThemeReveal = (
  variant: RevealVariant = 'circle',
  start: RevealStart = 'center',
  blur = true
): Reveal => {
  // circle-blur is circle with the blur locked on, so the blur checkbox cannot
  // silently turn it into a plain circle.
  const wantsBlur = variant === 'circle-blur' ? true : blur;
  const name = `${variant}-${start}${wantsBlur ? '-blur' : ''}`;
  const blurFrom = wantsBlur ? 'filter: blur(8px);' : '';
  const blurMid = wantsBlur ? '50%{filter: blur(4px);}' : '';
  const blurTo = wantsBlur ? 'filter: blur(0px);' : '';
  const blurRest = wantsBlur ? 'filter: blur(2px);' : '';
  const p = MARKER;
  const clip = resolveClip(variant, start);

  return {
    name,
    css: `
html.${p}::view-transition-group(root){animation-duration:${DURATION_MS}ms;animation-timing-function:cubic-bezier(.16,1,.3,1)}
html.${p}::view-transition-old(root){animation:none;z-index:-1}
html.${p}::view-transition-new(root){animation-name:reveal-light-${name};${blurRest}}
html.dark.${p}::view-transition-old(root){animation:none;z-index:-1}
html.dark.${p}::view-transition-new(root){animation-name:reveal-dark-${name};${blurRest}}
@keyframes reveal-dark-${name}{from{clip-path:${clip.from};${blurFrom}}${blurMid}to{clip-path:${clip.to};${blurTo}}}
@keyframes reveal-light-${name}{from{clip-path:${clip.from};${blurFrom}}${blurMid}to{clip-path:${clip.to};${blurTo}}}`,
  };
};

export interface RevealConfig {
  variant: RevealVariant;
  start: RevealStart;
  blur: boolean;
  enabled: boolean;
}

/** Human-readable options for the admin, kept next to the values they map to. */
export const REVEAL_VARIANTS: Array<{ value: RevealVariant; label: string }> = [
  { value: 'circle', label: 'Круг (circle)' },
  { value: 'rectangle', label: 'Прямоугольная шторка' },
  { value: 'polygon', label: 'Диагональный срез' },
  { value: 'circle-blur', label: 'Круг с размытием' },
];

export const REVEAL_STARTS: Array<{ value: RevealStart; label: string }> = [
  { value: 'center', label: 'Из центра' },
  { value: 'top-left', label: 'Из левого верхнего угла' },
  { value: 'top-right', label: 'Из правого верхнего угла' },
  { value: 'bottom-left', label: 'Из левого нижнего угла' },
  { value: 'bottom-right', label: 'Из правого нижнего угла' },
  { value: 'top-center', label: 'Сверху по центру' },
  { value: 'bottom-center', label: 'Снизу по центру' },
  { value: 'top-down', label: 'Сверху вниз' },
  { value: 'bottom-up', label: 'Снизу вверх' },
  { value: 'left-right', label: 'Слева направо' },
  { value: 'right-left', label: 'Справа налево' },
];

export const DEFAULT_REVEAL: RevealConfig = {
  variant: 'circle',
  start: 'top-right',
  blur: true,
  enabled: true,
};

const SETTING_ENABLED = 'theme_transition_enabled';
const SETTING_VARIANT = 'theme_transition_variant';
const SETTING_START = 'theme_transition_start';
const SETTING_BLUR = 'theme_transition_blur';

const asBool = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  const v = value.trim().toLowerCase();
  if (v === '1' || v === 'true' || v === 'on' || v === 'yes') return true;
  if (v === '0' || v === 'false' || v === 'off' || v === 'no') return false;
  return fallback;
};

/**
 * Reads the CMS values, validating each against the allowlists above.
 *
 * The settings table accepts any string for any key, and its values end up
 * inside generated CSS, so an unrecognised or hand-edited value must never be
 * interpolated. Anything unknown falls back to the caller's default.
 */
export const resolveRevealConfig = (
  settings: Record<string, string>,
  fallback: RevealConfig = DEFAULT_REVEAL
): RevealConfig => {
  const variantValue = settings[SETTING_VARIANT]?.trim();
  const startValue = settings[SETTING_START]?.trim();
  const variant = REVEAL_VARIANTS.some((o) => o.value === variantValue)
    ? (variantValue as RevealVariant)
    : fallback.variant;
  const start = REVEAL_STARTS.some((o) => o.value === startValue)
    ? (startValue as RevealStart)
    : fallback.start;
  return {
    variant,
    start,
    blur: asBool(settings[SETTING_BLUR], fallback.blur),
    enabled: asBool(settings[SETTING_ENABLED], fallback.enabled),
  };
};

/**
 * Applies a reveal transition around a theme change.
 *
 * Falls back to an instant switch when the browser has no View Transitions or
 * the visitor asked for reduced motion - a wipe is exactly the kind of motion
 * that setting exists to suppress.
 *
 * The variant, direction and blur come from the CMS (`useDesignSettings`) so an
 * editor can change them in the visual site builder. The positional arguments
 * are only defaults for the case where no setting has arrived yet; pass
 * `undefined` to let the settings decide.
 *
 * `revealToggle` accepts an override so the admin can try an unsaved
 * combination before publishing it.
 */
export const useThemeReveal = (
  variant: RevealVariant = DEFAULT_REVEAL.variant,
  start: RevealStart = DEFAULT_REVEAL.start,
  blur = DEFAULT_REVEAL.blur
) => {
  const { isDark, setTheme } = useTheme();
  const settings = useDesignSettings();
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reduced, setReduced] = useState(false);

  // Defaults are the fallback; a published setting wins over them.
  const configured = useMemo(
    () =>
      resolveRevealConfig(settings, {
        variant,
        start,
        blur,
        enabled: DEFAULT_REVEAL.enabled,
      }),
    [blur, settings, start, variant]
  );

  // Kept in a ref so the callback never closes over a stale theme and the
  // button cannot end up toggling twice against an outdated value.
  const isDarkRef = useRef(isDark);
  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  const applyTheme = useCallback(() => {
    setTheme(isDarkRef.current ? 'light' : 'dark', { transition: false });
  }, [setTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(isDarkRef.current ? 'light' : 'dark');
  }, [setTheme]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    if (mq.addEventListener) mq.addEventListener('change', sync);
    else if (mq.addListener) mq.addListener(sync);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', sync);
      else if (mq.removeListener) mq.removeListener(sync);
    };
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const inject = useCallback((css: string) => {
    if (typeof document === 'undefined' || !css) return;
    let el = styleRef.current;
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
      styleRef.current = el;
    }
    el.textContent = css;
  }, []);

  const revealToggle = useCallback(
    (override?: Partial<RevealConfig>) => {
      if (typeof document === 'undefined') {
        toggleTheme();
        return;
      }
      const startTransition = (document as Document & {
        startViewTransition?: (cb: () => void) => unknown;
      }).startViewTransition;

      const config: RevealConfig = override
        ? {
            ...configured,
            variant: override.variant ?? configured.variant,
            start: override.start ?? configured.start,
            blur: override.blur ?? configured.blur,
          }
        : configured;

      // Disabled in the CMS, or no support: switch the theme, skip the motion.
      if (!config.enabled || reduced || typeof startTransition !== 'function') {
        applyTheme();
        return;
      }

      inject(createThemeReveal(config.variant, config.start, config.blur).css);
      document.documentElement.classList.add(MARKER);
      if (timerRef.current) clearTimeout(timerRef.current);

      const transition = startTransition.call(document, applyTheme);

      const clear = () => {
        document.documentElement.classList.remove(MARKER);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = null;
      };

      // `finished` rejects if the transition is skipped, so the timeout is the
      // real safety net: without it a skipped transition would leave the marker
      // class on <html> and block the app's own cross-fade forever.
      if (
        transition &&
        typeof (transition as { finished?: Promise<void> }).finished?.then === 'function'
      ) {
        (transition as { finished: Promise<void> }).finished.then(clear, clear);
      }
      timerRef.current = setTimeout(clear, DURATION_MS + 250);
    },
    [applyTheme, configured, inject, reduced]
  );

  return { isDark, toggleTheme, revealToggle, reduced, config: configured };
};

export default useThemeReveal;
