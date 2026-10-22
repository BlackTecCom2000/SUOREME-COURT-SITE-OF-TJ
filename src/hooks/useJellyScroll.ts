import { useEffect } from 'react';

/**
 * Scroll "jelly" — a spring-damped lag applied to page content blocks.
 *
 * Every `.site-container` is driven by one shared rAF loop: a scroll delta
 * feeds a little velocity into a spring, the spring overshoots and settles,
 * and the block is translated (plus a sub-percent squash) while it moves.
 * Nothing is applied at rest, so text stays pixel-crisp and the compositor
 * does no work while the user is idle.
 *
 * Deliberate constraints:
 *  - Only `translate` / `scale` (independent CSS properties) are written, so
 *    Tailwind/Framer/GSAP transforms on the same node are never clobbered.
 *  - Never touches `position: fixed` modals: sections render their modals as
 *    siblings of `.site-container`, not inside it.
 *  - Off for reduced-motion, the visually-impaired mode and low-end tiers.
 */

const MAX_LAG = 18;
const MAX_SQUASH = 0.005;
const STIFFNESS = 0.165;
const DAMPING = 0.26;
const KICK = 0.3;
const SETTLE = 0.04;
const MAX_DELTA = 240;

interface JellyTarget {
  el: HTMLElement;
  depth: number;
  y: number;
  vy: number;
  painted: boolean;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const useJellyScroll = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (prefersReducedMotion()) return;

    const root = document.documentElement;
    if (root.dataset.a11y === 'true') return;

    const strength = window.matchMedia('(pointer: coarse)').matches ? 0.55 : 1;

    let targets: JellyTarget[] = [];
    let raf = 0;
    let lastScroll = window.scrollY;
    let lastTime = 0;
    let collectQueued = false;

    const isDisabled = () =>
      prefersReducedMotion() ||
      root.dataset.a11y === 'true' ||
      root.dataset.deviceTier === 'low-end';

    const unpaint = (t: JellyTarget) => {
      if (!t.painted) return;
      t.el.style.removeProperty('--jelly-y');
      t.el.style.removeProperty('--jelly-s');
      delete t.el.dataset.jelly;
      t.painted = false;
    };

    const paint = (t: JellyTarget) => {
      const shift = Math.round(t.y * 0.7 * 2) / 2;
      const scale = Math.min(
        1 + MAX_SQUASH,
        Math.max(1 - MAX_SQUASH, Math.round((1 - t.y * 0.00035) * 1000) / 1000),
      );
      t.el.style.setProperty('--jelly-y', `${shift}px`);
      t.el.style.setProperty('--jelly-s', String(scale));
      if (!t.painted) {
        t.el.dataset.jelly = 'on';
        t.painted = true;
      }
    };

    const tick = (now: number) => {
      const dt = lastTime ? Math.min(2.5, Math.max(0.4, (now - lastTime) / 16.6667)) : 1;
      lastTime = now;

      const scroll = window.scrollY;
      const delta = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, scroll - lastScroll));
      lastScroll = scroll;

      let settled = true;

      for (const t of targets) {
        if (Math.abs(delta) > 0.4) t.vy += delta * KICK * t.depth;
        t.vy += (-STIFFNESS * t.y - DAMPING * t.vy) * dt;
        t.y += t.vy * dt;

        if (t.y > MAX_LAG) {
          t.y = MAX_LAG;
          t.vy *= 0.4;
        } else if (t.y < -MAX_LAG) {
          t.y = -MAX_LAG;
          t.vy *= 0.4;
        }

        if (Math.abs(t.y) < SETTLE && Math.abs(t.vy) < SETTLE) {
          t.y = 0;
          t.vy = 0;
          unpaint(t);
        } else {
          paint(t);
          settled = false;
        }
      }

      if (settled) {
        raf = 0;
        lastTime = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf || isDisabled()) return;
      lastScroll = window.scrollY;
      lastTime = 0;
      raf = requestAnimationFrame(tick);
    };

    const collect = () => {
      collectQueued = false;
      if (isDisabled()) {
        targets.forEach(unpaint);
        targets = [];
        return;
      }
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('.site-container'));
      const next: JellyTarget[] = nodes.map((el, i) => {
        const prev = targets.find((t) => t.el === el);
        return {
          el,
          depth: (0.9 + (i % 5) * 0.05) * strength,
          y: prev ? prev.y : 0,
          vy: prev ? prev.vy : 0,
          painted: prev ? prev.painted : false,
        };
      });
      const alive = new Set(nodes);
      targets.forEach((t) => {
        if (!alive.has(t.el)) unpaint(t);
      });
      targets = next;
    };

    const queueCollect = () => {
      if (collectQueued) return;
      collectQueued = true;
      window.setTimeout(collect, 120);
    };

    const onScroll = () => start();
    const onResize = () => {
      queueCollect();
      start();
    };
    const onMotionChange = () => {
      if (prefersReducedMotion()) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        targets.forEach(unpaint);
      }
    };

    collect();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', onMotionChange);

    const observer = new MutationObserver(queueCollect);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      motionQuery.removeEventListener('change', onMotionChange);
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
      targets.forEach(unpaint);
      targets = [];
    };
  }, []);
};
