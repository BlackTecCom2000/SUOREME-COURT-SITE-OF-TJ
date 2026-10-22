import { useEffect } from 'react';

/**
 * Inertial wheel scrolling for fine pointers.
 *
 * Native wheel scrolling jumps by one notch per event, which reads as a series
 * of steps rather than motion. This hook accumulates the wheel input into a
 * target position and eases the real scroll position toward it with a
 * critically damped spring, so the page accelerates out of the gesture, glides
 * and settles without ever overshooting (the "flexible" part: no hard start,
 * no rubber-band at the end).
 *
 * Scope and safety:
 * - only `pointer: fine` devices (mouse/trackpad); touch keeps native momentum;
 * - never on reduced motion, a11y mode, low-end tier, or while a modal locks
 *   `body` scrolling;
 * - wheel over a nested scrollable area, input, textarea, select or
 *   contenteditable is left to the browser;
 * - ctrl/cmd (zoom), shift (horizontal) and mostly-horizontal gestures are
 *   ignored;
 * - any scroll that this hook did not write (keyboard, scrollbar drag, anchor
 *   jump, scrollIntoView) is adopted as the new position, so the hook never
 *   fights the user or other scripts;
 * - `behavior: 'instant'` is explicit because the app sets
 *   `scroll-behavior: smooth` globally, which would otherwise re-smooth every
 *   frame and turn the glide into a laggy rubber band.
 */

const MIN_SMOOTH_TIME = 0.1;
const MAX_SMOOTH_TIME = 0.16;
const SETTLE = 0.4;
const SETTLE_VELOCITY = 2;
const LINE_HEIGHT = 16;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isEditable = (target: EventTarget | null) =>
  target instanceof Element &&
  Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));

const isInsideScrollable = (target: EventTarget | null) => {
  let el = target instanceof Element ? (target as HTMLElement) : null;
  for (let node = el; node && node !== document.body; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY;
    if (/(auto|scroll)/.test(overflow) && node.scrollHeight > node.clientHeight + 1) return true;
  }
  return false;
};

export const useSmoothScroll = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const root = document.documentElement;
    if (root.dataset.a11y === 'true') return;

    let target = window.scrollY;
    let current = target;
    let lastWritten = target;
    let velocity = 0;
    let raf = 0;
    let lastTime = 0;

    const isDisabled = () =>
      prefersReducedMotion() ||
      root.dataset.a11y === 'true' ||
      root.dataset.deviceTier === 'low-end' ||
      document.body.style.overflow === 'hidden';

    const maxScroll = () =>
      Math.max(0, root.scrollHeight - window.innerHeight);

    const write = (y: number) => {
      const clamped = Math.min(Math.max(0, y), maxScroll());
      lastWritten = clamped;
      window.scrollTo({ top: clamped, left: 0, behavior: 'instant' as ScrollBehavior });
      return clamped;
    };

    const step = (now: number) => {
      if (isDisabled()) {
        current = window.scrollY;
        target = current;
        lastWritten = current;
        stop();
        return;
      }

      const dt = lastTime ? Math.min(0.05, Math.max(0.006, (now - lastTime) / 1000)) : 1 / 60;
      lastTime = now;

      const diff = target - current;
      if (Math.abs(diff) < SETTLE && Math.abs(velocity) < SETTLE_VELOCITY) {
        const max = maxScroll();
        if (target > max + 0.5) {
          // The page is shorter than the queued distance right now (lazy
          // content below is still mounting). Rest at the end, keep the target,
          // and let the ResizeObserver finish the glide once it grows.
          current = max;
          write(current);
          raf = 0;
          lastTime = 0;
          velocity = 0;
          return;
        }
        current = target;
        velocity = 0;
        raf = 0;
        lastTime = 0;
        write(current);
        return;
      }

      // Critically damped spring (SmoothDamp). Distant flicks get a slightly
      // shorter response so they do not feel sluggish; small precise wheel
      // nudges take the softer end of the curve.
      const distance = Math.min(1, Math.abs(diff) / 900);
      const smoothTime = MAX_SMOOTH_TIME - (MAX_SMOOTH_TIME - MIN_SMOOTH_TIME) * distance;
      const omega = 2 / smoothTime;
      const x = omega * dt;
      const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
      const change = current - target;
      const temp = (velocity + omega * change) * dt;
      velocity = (velocity - omega * temp) * exp;
      current = target + (change + temp) * exp;

      const before = lastWritten;
      const written = write(current);

      // Reached the end of the currently mounted document while the wheel
      // target is still further down. Lazy sections below will grow the page
      // within a frame or two; park the loop instead of spinning, and let the
      // ResizeObserver resume the same glide into the newly mounted content.
      if (written === before && target > written + 0.5) {
        current = written;
        raf = 0;
        lastTime = 0;
        velocity = 0;
        return;
      }

      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (raf) return;
      lastTime = 0;
      raf = requestAnimationFrame(step);
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lastTime = 0;
      velocity = 0;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (isDisabled()) return;
      if (isEditable(e.target) || isInsideScrollable(e.target)) return;

      const unit = e.deltaMode === 1 ? LINE_HEIGHT : e.deltaMode === 2 ? window.innerHeight : 1;
      const delta = e.deltaY * unit;
      if (!delta) return;

      e.preventDefault();
      // Not clamped to the current document height: lazy sections below grow
      // the page mid-glide, and keeping the queued distance lets the motion
      // continue into them instead of stalling until the next wheel notch.
      target = Math.max(0, target + delta);
      start();
    };

    // Adopt scrolls we did not write: keyboard, scrollbar drag, anchors,
    // scrollIntoView from the navbar, or another script.
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastWritten) <= 1.5) return;
      target = y;
      current = y;
      lastWritten = y;
      stop();
    };

    const onResize = () => {
      target = window.scrollY;
      current = target;
      lastWritten = target;
      stop();
    };

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => {
      if (!prefersReducedMotion()) return;
      target = window.scrollY;
      current = target;
      lastWritten = target;
      stop();
    };

    const resizeObserver = new ResizeObserver(() => {
      if (!raf && target > window.scrollY + 0.5) start();
    });
    resizeObserver.observe(document.body);

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    motionQuery.addEventListener('change', onMotionChange);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      motionQuery.removeEventListener('change', onMotionChange);
      resizeObserver.disconnect();
      stop();
    };
  }, []);
};
