import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSiteBackground } from '../hooks/useSiteBackground';

export const ScrollVideo: React.FC = () => {
  const { isDark } = useTheme();
  const { imageDay, imageNight } = useSiteBackground();
  // PERF: scroll writes bypass React state entirely — a single rAF-throttled
  // handler writes transform/background directly to DOM nodes (zero re-renders,
  // no forced layout: scrollHeight is cached and refreshed on resize only).
  // No CSS transition on the parallax layer: it would fight per-frame updates.
  const parallaxRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const maxScrollRef = useRef(1);
  const frameRef = useRef(0);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const darkRef = useRef(isDark);
  darkRef.current = isDark;

  useEffect(() => {
    const updateMax = () => {
      maxScrollRef.current = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
    };
    updateMax();

    const apply = () => {
        frameRef.current = 0;
        const current = currentScrollRef.current;
        const target = targetScrollRef.current;
        const next = current + (target - current) * 0.085;
        currentScrollRef.current = Math.abs(target - next) < 0.1 ? target : next;
        const progress = Math.max(0, currentScrollRef.current / maxScrollRef.current);
        const scale = 1 + 0.11 * (1 - Math.exp(-progress * 1.35));
        const ty = 54 * (1 - Math.exp(-progress * 1.1));
      if (parallaxRef.current) {
          parallaxRef.current.style.transform = `scale(${scale.toFixed(5)}) translate3d(0, -${ty.toFixed(2)}px, 0)`;
      }
      const dark = darkRef.current;
      // Natural background: no white overlay — keep building vibrant, sky blue intact
      if (overlayRef.current) {
        overlayRef.current.style.backgroundColor = dark
          ? `rgba(5, 8, 15, ${Math.min(0.35, 0.12 + progress * 0.15).toFixed(2)})`
          : `rgba(0, 0, 0, 0)`;
      }
      if (Math.abs(target - currentScrollRef.current) > 0.1) frameRef.current = requestAnimationFrame(apply);
    };

    const schedule = () => {
      targetScrollRef.current = Math.max(0, window.scrollY);
      if (!frameRef.current) frameRef.current = requestAnimationFrame(apply);
    };
    const onScroll = () => schedule();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onResize = () => { updateMax(); schedule(); };
    window.addEventListener('resize', onResize);
    schedule();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 bg-[var(--bg-primary)] pointer-events-none select-none overflow-hidden transition-colors duration-700"
    >
      <div
        ref={parallaxRef}
        className="absolute inset-0 w-full h-full transform-gpu"
        style={{
          transform: 'scale(1) translateY(-0px)',
          filter: `blur(var(--bg-blur, 0px)) saturate(var(--bg-saturation, 100%)) brightness(var(--bg-brightness, 100%)) contrast(var(--bg-contrast, 100%))`,
        }}
      >
        <img
          src={imageDay}
          alt="Бинои Суди Олии Ҷумҳурии Тоҷикистон (Рӯз)"
          loading="eager"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
            !isDark ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
        <img
          src={imageNight}
          alt="Бинои Суди Олии Ҷумҳурии Тоҷикистон (Шаб)"
          loading="eager"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
            isDark ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      </div>
      {/* Atmospheric White Overlay — configurable, weak, building and sky remain visible — NO backdrop-filter here */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `rgba(255,255,255, var(--bg-overlay-opacity, 0.12))`,
        }}
      />
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${isDark ? 'opacity-20' : 'opacity-10'}`}
        style={{
          background: isDark ? 'radial-gradient(ellipse at 50% 0%, rgba(223,190,126,0.06) 0%, transparent 55%)' : 'radial-gradient(ellipse at 50% 0%, rgba(184,138,36,0.02) 0%, transparent 60%)',
        }}
      />
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 70%, rgba(0,0,0,0.08) 100%)' }}
      />
    </div>
  );
};

export default ScrollVideo;
