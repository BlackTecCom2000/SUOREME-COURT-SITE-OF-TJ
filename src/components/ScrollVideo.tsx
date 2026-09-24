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
  const rafRef = useRef(0);
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
      rafRef.current = 0;
      const y = window.scrollY;
      const p = Math.min(Math.max(y / maxScrollRef.current, 0), 1);
      const scale = 1 + Math.min(p * 0.08, 0.08);
      const ty = Math.min(y * 0.04, 60);
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `scale(${scale.toFixed(4)}) translateY(-${ty.toFixed(1)}px)`;
      }
      const dark = darkRef.current;
      // Natural background: no white overlay — keep building vibrant, sky blue intact
      if (overlayRef.current) {
        overlayRef.current.style.backgroundColor = dark
          ? `rgba(5, 8, 15, ${Math.min(0.35, 0.12 + p * 0.15).toFixed(2)})`
          : `rgba(0, 0, 0, 0)`;
      }
    };

    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(apply);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateMax);
    apply();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateMax);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
      {/* Atmospheric White Overlay — configurable, weak, building and sky remain visible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `rgba(255,255,255, var(--bg-overlay-opacity, 0.12))`,
          backdropFilter: `blur(calc(var(--bg-blur, 0px) * 0.5))`,
          WebkitBackdropFilter: `blur(calc(var(--bg-blur, 0px) * 0.5))`,
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
