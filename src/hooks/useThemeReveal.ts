import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

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

const POLYGON: Record<
  string,
  { darkFrom: string; darkTo: string; lightFrom: string; lightTo: string }
> = {
  'top-left': {
    darkFrom: 'polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%)',
    darkTo: 'polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%)',
    lightFrom: 'polygon(171% 50%, 50% 171%, 50% 171%, 171% 50%)',
    lightTo: 'polygon(171% 50%, 50% 171%, -50% 71%, 50% -71%)',
  },
};

/** Corners are circles for the circle variant, rectangles otherwise. */
const resolveClip = (variant: RevealVariant, start: RevealStart) => {
  if (variant === 'circle') {
    const corner = CLIP[`${start}-c`];
    if (corner) return corner;
  }
  return CLIP[start] ?? CLIP.center;
};

/** Builds the CSS for one transition. Pure, no DOM access. */
export const createThemeReveal = (
  variant: RevealVariant = 'circle',
  start: RevealStart = 'center',
  blur = true
): Reveal => {
  const name = `${variant}-${start}${blur ? '-blur' : ''}`;
  const blurFrom = blur ? 'filter: blur(8px);' : '';
  const blurMid = blur ? '50%{filter: blur(4px);}' : '';
  const blurTo = blur ? 'filter: blur(0px);' : '';
  const blurRest = blur ? 'filter: blur(2px);' : '';
  const p = MARKER;

  if (variant === 'polygon') {
    const poly = POLYGON[start] ?? POLYGON['top-left'];
    return {
      name,
      css: `
html.${p}::view-transition-group(root){animation-duration:${DURATION_MS}ms;animation-timing-function:cubic-bezier(.16,1,.3,1)}
html.${p}::view-transition-old(root){animation:none;z-index:-1}
html.${p}::view-transition-new(root){animation-name:reveal-light-${name};${blurRest}}
html.dark.${p}::view-transition-old(root){animation:none;z-index:-1}
html.dark.${p}::view-transition-new(root){animation-name:reveal-dark-${name};${blurRest}}
@keyframes reveal-dark-${name}{from{clip-path:${poly.darkFrom};${blurFrom}}${blurMid}to{clip-path:${poly.darkTo};${blurTo}}}
@keyframes reveal-light-${name}{from{clip-path:${poly.lightFrom};${blurFrom}}${blurMid}to{clip-path:${poly.lightTo};${blurTo}}}`,
    };
  }

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

/**
 * Applies a reveal transition around a theme change.
 *
 * Falls back to an instant switch when the browser has no View Transitions or
 * the visitor asked for reduced motion - a wipe is exactly the kind of motion
 * that setting exists to suppress.
 */
export const useThemeReveal = (
  variant: RevealVariant = 'circle',
  start: RevealStart = 'center',
  blur = true
) => {
  const { isDark, setTheme } = useTheme();
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reduced, setReduced] = useState(false);

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

  const revealToggle = useCallback(() => {
    if (typeof document === 'undefined') {
      toggleTheme();
      return;
    }
    const startTransition = (document as Document & {
      startViewTransition?: (cb: () => void) => unknown;
    }).startViewTransition;

    if (reduced || typeof startTransition !== 'function') {
      applyTheme();
      return;
    }

    inject(createThemeReveal(variant, start, blur).css);
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
    if (transition && typeof (transition as { finished?: Promise<void> }).finished?.then === 'function') {
      (transition as { finished: Promise<void> }).finished.then(clear, clear);
    }
    timerRef.current = setTimeout(clear, DURATION_MS + 250);
  }, [applyTheme, blur, inject, reduced, start, variant]);

  return { isDark, toggleTheme, revealToggle, reduced };
};

export default useThemeReveal;
