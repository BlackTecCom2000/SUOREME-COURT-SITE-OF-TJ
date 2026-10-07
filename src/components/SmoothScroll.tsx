import React, { useEffect } from 'react';

/**
 * Inertial (wheel) scrolling for the whole platform.
 *
 * Native wheel scrolling is a hard step per notch, which feels abrupt next to
 * the site's soft glass motion language. This component keeps the browser's
 * real scroll position as the single source of truth (no transform hijack —
 * `position: sticky`, IntersectionObservers, scroll-linked sections and the
 * 30s runtime machinery all keep working) and only smooths out HOW the wheel
 * delta reaches it: every wheel event moves a target position, and a rAF loop
 * eases the document towards it.
 *
 * Rules that keep it out of the way:
 *   - `prefers-reduced-motion: reduce` disables it entirely;
 *   - Ctrl/Cmd+wheel (pinch zoom, viewer zoom) stays native;
 *   - a wheel event over any inner scrollable container is left to that
 *     container (admin panels, library, modals, chat);
 *   - any scroll we did not cause (keyboard, scrollbar, anchor jump,
 *     `scrollIntoView`) synchronises the target immediately, so a native
 *     smooth scroll and ours can never fight over the position;
 *   - `behavior: 'instant'` on every write, because `html` carries
 *     `scroll-behavior: smooth` and each eased frame must land instantly.
 */
export const SmoothScroll: React.FC = () => {
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    /** Easing per 16.7ms frame; frame-rate independent (144Hz feels identical). */
    const EASE = 0.15;
    /** Two pixels of slack absorb sub-pixel rounding in the scroll event. */
    const TOLERANCE = 2;

    let target = window.scrollY;
    let lastSet = window.scrollY;
    let raf = 0;
    let lastTime = 0;

    const maxScroll = () =>
      Math.max(
        0,
        Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) -
          window.innerHeight
      );

    const write = (y: number) => {
      const clamped = Math.max(0, Math.min(maxScroll(), y));
      lastSet = clamped;
      window.scrollTo({ top: clamped, behavior: 'instant' as ScrollBehavior });
    };

    const step = (time: number) => {
      const dt = lastTime ? Math.min(64, time - lastTime) : 16;
      lastTime = time;
      const current = window.scrollY;
      const diff = target - current;
      if (Math.abs(diff) < 0.5) {
        raf = 0;
        lastTime = 0;
        return;
      }
      const ease = 1 - Math.pow(1 - EASE, dt / 16.67);
      write(current + diff * ease);
      raf = requestAnimationFrame(step);
    };

    /** True while the pointer sits over content that scrolls on its own. */
    const overInnerScroller = (node: EventTarget | null) => {
      let el = node instanceof Element ? node : null;
      const root = document.scrollingElement;
      while (el && el !== root && el !== document.body && el !== document.documentElement) {
        const style = getComputedStyle(el);
        if (
          /(auto|scroll|overlay)/.test(style.overflowY) &&
          el.scrollHeight > el.clientHeight + 1
        ) {
          return true;
        }
        el = el.parentElement;
      }
      return false;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey) return;
      if (motionQuery.matches) return;
      if (event.deltaY === 0) return; // horizontal trackpad swipe
      if (overInnerScroller(event.target)) return;
      const limit = maxScroll();
      if (limit <= 0) return;

      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      target = Math.max(0, Math.min(limit, target + event.deltaY * unit));
      if (!raf) {
        lastTime = 0;
        raf = requestAnimationFrame(step);
      }
    };

    /** Any scroll we did not just wrote ourselves wins: adopt its position so
     *  anchor jumps, keyboard paging and scrollbar drags keep their native
     *  (possibly CSS-smooth) animation instead of being pulled back. */
    const onScroll = () => {
      if (Math.abs(window.scrollY - lastSet) > TOLERANCE) {
        target = window.scrollY;
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          lastTime = 0;
        }
      }
    };

    const onResize = () => {
      target = Math.max(0, Math.min(maxScroll(), target));
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
};

export default SmoothScroll;
