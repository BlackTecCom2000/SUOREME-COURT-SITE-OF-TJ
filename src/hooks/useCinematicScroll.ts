import { useEffect } from 'react';

/**
 * Site-wide cinematic scroll: one "camera" for every page.
 *
 * The spring-driven inertial wheel (useSmoothScroll), the jelly block lag
 * (useJellyScroll) and the drifting background (GlobalBackground) already run
 * everywhere. What was still home-page-only is the camera move itself: as a
 * hero leaves the viewport its content lags behind the scroll, shrinks a
 * little and fades toward the live background. This hook turns that into a
 * site-wide engine:
 *
 *   <element data-cinematic-stage="hero">   full-bleed hero (home page)
 *   <element data-cinematic-stage="page">   page header on the inner pages
 *
 * Why it is written the way it is:
 * - ONE rAF loop for the whole document, not one per element. The loop only
 *   runs while something is moving and parks itself when the page is at
 *   rest, so an idle page costs nothing.
 * - `transform` and `opacity` only, written straight to `style` — never
 *   through React state, never a CSS variable (an inherited variable
 *   re-styles the whole subtree every frame).
 * - Reads (getBoundingClientRect) happen before writes, so a frame never
 *   thrashes layout.
 * - `will-change` is held only while a stage is actually moving and is
 *   removed the moment it settles, so no layer is kept alive for nothing.
 * - Reduced motion, a11y mode, the low-end device tier and an open modal
 *   (body scroll locked) switch the whole effect off and clear the inline
 *   styles, so the page returns to a crisp, static state.
 */

type Profile = {
  /** Vertical lag in px at the end of the travel. */
  shift: number;
  /** Scale loss at the end of the travel (0.042 = 4.2%). */
  shrink: number;
  /** Opacity loss at the end of the travel (0.55 = 55% faded). */
  fade: number;
  /** Travel distance as a fraction of the stage height (hero) or viewport (page). */
  travel: number;
  /** Travel is measured against the element height instead of the viewport. */
  byHeight: boolean;
};

const PROFILES: Record<string, Profile> = {
  // The home hero is a full-bleed stage: a strong move reads as depth.
  hero: { shift: 58, shrink: 0.042, fade: 0.55, travel: 0.85, byHeight: true },
  // Inner page headers are small and carry the page title. They recede, but
  // the title has to stay readable, so the move is much gentler and it plays
  // out over roughly one header height of scrolling — the header is still on
  // screen when the move completes, so it never snaps back.
  page: { shift: 18, shrink: 0.02, fade: 0.45, travel: 1.1, byHeight: true },
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface Stage {
  el: HTMLElement;
  profile: Profile;
  active: boolean;
}

export const useCinematicScroll = (routeKey = '') => {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (prefersReducedMotion()) return;

    const root = document.documentElement;
    if (root.dataset.a11y === 'true') return;

    let stages: Stage[] = [];
    let raf = 0;

    const disabled = () =>
      prefersReducedMotion() ||
      root.dataset.a11y === 'true' ||
      root.dataset.deviceTier === 'low-end' ||
      document.body.style.overflow === 'hidden';

    const clear = (stage: Stage) => {
      if (!stage.active) return;
      stage.el.style.removeProperty('transform');
      stage.el.style.removeProperty('opacity');
      stage.el.style.removeProperty('will-change');
      stage.active = false;
    };

    const clearAll = () => {
      for (const stage of stages) clear(stage);
    };

    const scan = () => {
      const found = Array.from(
        document.querySelectorAll<HTMLElement>('[data-cinematic-stage]')
      );
      // Drop the stages of the previous page before adopting the new ones.
      for (const stage of stages) {
        if (!found.includes(stage.el)) clear(stage);
      }
      stages = found.map((el) => {
        const known = stages.find((s) => s.el === el);
        const profile = PROFILES[el.dataset.cinematicStage || 'page'] || PROFILES.page;
        return known ? { ...known, profile } : { el, profile, active: false };
      });
    };

    const update = () => {
      raf = 0;
      if (disabled()) {
        clearAll();
        return;
      }
      // React may replace the DOM node of a stage (the home page re-renders
      // with live counters and lazy sections). A cached reference to a
      // detached node would keep writing to a node that is no longer on the
      // page, so the stages are re-collected as soon as one is gone.
      if (!stages.length || stages.some((s) => !s.el.isConnected)) scan();
      if (!stages.length) return;

      const vh = window.innerHeight || 1;
      let moving = false;

      // --- read phase ---
      const metrics = stages.map((stage) => {
        const rect = stage.el.getBoundingClientRect();
        const travel = stage.profile.byHeight
          ? Math.max(1, rect.height * stage.profile.travel)
          : Math.max(1, vh * stage.profile.travel);
        const progress = Math.min(1, Math.max(0, -rect.top / travel));
        const visible = rect.bottom > 0 && rect.top < vh;
        return { stage, rect, progress, visible };
      });

      // --- write phase ---
      for (const m of metrics) {
        if (!m.visible) {
          clear(m.stage);
          continue;
        }
        if (m.progress <= 0) {
          clear(m.stage);
          continue;
        }
        const { shift, shrink, fade } = m.stage.profile;
        const dy = m.progress * shift;
        const scale = 1 - m.progress * shrink;
        m.stage.el.style.transform = `translate3d(0, ${dy.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        m.stage.el.style.opacity = (1 - m.progress * fade).toFixed(3);
        m.stage.el.style.willChange = 'transform, opacity';
        m.stage.active = true;
        moving = true;
      }

      if (moving) raf = requestAnimationFrame(update);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const onScroll = () => {
      schedule();
    };
    const onResize = () => {
      scan();
      schedule();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => {
      if (prefersReducedMotion()) clearAll();
      else schedule();
    };
    motionQuery.addEventListener('change', onMotionChange);

    // The page content is mounted after the route change, so the stages are
    // scanned once the new tree is in place.
    const settle = window.setTimeout(() => {
      scan();
      schedule();
    }, 60);
    scan();
    schedule();

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      motionQuery.removeEventListener('change', onMotionChange);
      if (raf) cancelAnimationFrame(raf);
      clearAll();
    };
  }, [routeKey]);
};
