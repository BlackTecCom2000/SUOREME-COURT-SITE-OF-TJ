import { useEffect, type RefObject } from 'react';

/**
 * Scroll-linked "camera" move on the home hero.
 *
 * As the hero leaves the viewport its content lags behind the scroll and
 * shrinks a hair, while fading toward the live background — the classic
 * depth-of-field parallax that makes a page feel filmed rather than paged.
 * The global background has its own slow zoom, so the two layers separate.
 *
 * Only `transform` and `opacity` are written, on one wrapper, and only while
 * the hero is on screen. Nothing is written at scrollY 0, so the landing view
 * stays pixel-crisp. Disabled for reduced motion, a11y and low-end tiers.
 */

const MAX_SHIFT = 58;
const MAX_SHRINK = 0.042;
const MAX_FADE = 0.55;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const useCinematicHero = (
  sectionRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>
) => {
  useEffect(() => {
    if (typeof window === 'undefined' || prefersReducedMotion()) return;

    const root = document.documentElement;
    if (root.dataset.a11y === 'true') return;

    let raf = 0;
    let applied = false;

    const clear = () => {
      const stage = stageRef.current;
      if (!stage || !applied) return;
      stage.style.removeProperty('transform');
      stage.style.removeProperty('opacity');
      stage.style.removeProperty('will-change');
      applied = false;
    };

    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;

      if (
        prefersReducedMotion() ||
        root.dataset.a11y === 'true' ||
        root.dataset.deviceTier === 'low-end'
      ) {
        clear();
        return;
      }

      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        clear();
        return;
      }

      const travel = Math.max(1, rect.height * 0.85);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      if (progress <= 0) {
        clear();
        return;
      }

      const shift = progress * MAX_SHIFT;
      const scale = 1 - progress * MAX_SHRINK;
      stage.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      stage.style.opacity = (1 - progress * MAX_FADE).toFixed(3);
      stage.style.willChange = 'transform, opacity';
      applied = true;
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
      clear();
    };
  }, [sectionRef, stageRef]);
};
