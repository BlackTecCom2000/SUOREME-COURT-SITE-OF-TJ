import { useEffect } from 'react';

/**
 * Scroll "jelly" â€” a spring-damped lag applied to page content blocks.
 *
 * Only `translate` is written, on visible blocks only. `translate` is handled
 * entirely by the compositor, so glass cards keep their backdrop filters off
 * the raster path; the previous `scale` write forced a re-raster of every
 * backdrop-filter layer each frame, which is what made scrolling stutter.
 *
 * Values are never rounded to whole pixels (sub-pixel steps look like
 * micro-jumps) and are removed the moment the spring settles, so text is
 * pixel-crisp at rest and `will-change` never sticks around.
 */

const MAX_LAG = 10;
const LAG_PER_PX = 0.5;
const SMOOTH = 0.12;
const FOLLOW = 0.22;
const SETTLE = 0.03;
const MAX_DELTA = 240;

interface JellyTarget {
  el: HTMLElement;
  depth: number;
  y: number;
  visible: boolean;
  painted: boolean;
  lastWritten: number;
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
    let smoothDelta = 0;
    let lastTime = 0;
    let collectQueued = false;
    let observer: IntersectionObserver | null = null;

    const isDisabled = () =>
      prefersReducedMotion() ||
      root.dataset.a11y === 'true' ||
      root.dataset.deviceTier === 'low-end';

    const unpaint = (t: JellyTarget) => {
      if (!t.painted) return;
      t.el.style.removeProperty('translate');
      t.el.style.removeProperty('will-change');
      t.painted = false;
      t.lastWritten = 0;
    };

    const reset = (t: JellyTarget) => {
      t.y = 0;
      unpaint(t);
    };

    const paint = (t: JellyTarget) => {
      const shift = t.y * 0.7;
      if (Math.abs(shift - t.lastWritten) < 0.01) return;
      t.lastWritten = shift;
      // Written inline, not via a CSS custom property: custom properties
      // inherit, so every frame invalidated the style of the whole subtree
      // (thousands of nodes). An inline `translate` only touches this node
      // and is fully compositor-driven.
      t.el.style.translate = `0 ${shift.toFixed(2)}px`;
      if (!t.painted) {
        // Kept only for the duration of a gesture: the block is promoted to its
        // own layer once, instead of being re-composited on every frame, and
        // the memory is handed back the moment the spring settles.
        t.el.style.willChange = 'translate';
        t.painted = true;
      }
    };

    const tick = (now: number) => {
      const dt = lastTime ? Math.min(2.5, Math.max(0.4, (now - lastTime) / 16.6667)) : 1;
      lastTime = now;

      const scroll = window.scrollY;
      const delta = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, scroll - lastScroll));
      lastScroll = scroll;

      // Wheel input arrives as discrete spikes (one per notch). Feeding those
      // straight into a spring made the spring slam into its limit and cut its
      // own velocity â€” the visible "tick" on every notch. Low-pass the velocity
      // first; the follow step below then glides instead of snapping.
      smoothDelta += (delta - smoothDelta) * Math.min(1, SMOOTH * dt);

      let settled = true;

      for (const t of targets) {
        if (!t.visible) {
          if (t.painted || t.y !== 0) reset(t);
          continue;
        }

        const target = Math.max(
          -MAX_LAG,
          Math.min(MAX_LAG, smoothDelta * LAG_PER_PX * t.depth * strength),
        );
        t.y += (target - t.y) * Math.min(1, FOLLOW * dt);

        if (Math.abs(t.y) < SETTLE && Math.abs(target) < SETTLE) {
          reset(t);
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
      smoothDelta = 0;
      lastTime = 0;
      raf = requestAnimationFrame(tick);
    };

    const collect = () => {
      collectQueued = false;
      if (isDisabled()) {
        targets.forEach(reset);
        targets = [];
        observer?.disconnect();
        return;
      }

      const nodes = Array.from(document.querySelectorAll<HTMLElement>('.site-container'));

      // The page mutates constantly (clocks, tickers, live counters). Rebuilding
      // the targets and the IntersectionObserver on every mutation was pure
      // churn, so bail out when the set of containers is unchanged.
      const same =
        nodes.length === targets.length && nodes.every((el, i) => targets[i].el === el);
      if (same && observer) return;

      const next: JellyTarget[] = nodes.map((el, i) => {
        const prev = targets.find((t) => t.el === el);
        return {
          el,
          depth: 0.96 + (i % 4) * 0.027,
          y: prev ? prev.y : 0,
          visible: prev ? prev.visible : false,
          painted: prev ? prev.painted : false,
          lastWritten: prev ? prev.lastWritten : 0,
        };
      });

      const alive = new Set(nodes);
      targets.forEach((t) => {
        if (!alive.has(t.el)) unpaint(t);
      });
      targets = next;

      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const t = targets.find((item) => item.el === entry.target);
            if (t) t.visible = entry.isIntersecting;
          }
          if (targets.some((t) => t.visible)) start();
        },
        { rootMargin: '15% 0px 15% 0px' },
      );
      targets.forEach((t) => observer!.observe(t.el));
    };

    const queueCollect = () => {
      if (collectQueued) return;
      collectQueued = true;
      window.setTimeout(collect, 150);
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
        targets.forEach(reset);
      }
    };

    collect();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', onMotionChange);

    const mutations = new MutationObserver(queueCollect);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      motionQuery.removeEventListener('change', onMotionChange);
      mutations.disconnect();
      observer?.disconnect();
      if (raf) cancelAnimationFrame(raf);
      targets.forEach(unpaint);
      targets = [];
    };
  }, []);
};

