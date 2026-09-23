import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export const ScrollVideo: React.FC = () => {
  const { isDark } = useTheme();
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
      const a = dark
        ? Math.min(0.92, 0.5 + Math.max(0, (p - 0.15) * 0.55))
        : Math.min(0.96, 0.75 + Math.max(0, (p - 0.15) * 0.25));
      if (overlayRef.current) {
        overlayRef.current.style.backgroundColor = dark
          ? `rgba(5, 8, 15, ${a.toFixed(2)})`
          : `rgba(246, 248, 251, ${a.toFixed(2)})`;
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
      {/* 1. Ultra-High Resolution Supreme Court Building Architecture (Continuous Cross-fade) */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 w-full h-full transform-gpu"
        style={{ transform: 'scale(1) translateY(-0px)' }}
      >
        {/* Day background */}
        <img
          src="/supreme-court-day.jpg"
          alt="Бинои Суди Олии Ҷумҳурии Тоҷикистон (Рӯз)"
          loading="eager"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
            !isDark ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
        {/* Night background */}
        <img
          src="/supreme-court-night.jpg"
          alt="Бинои Суди Олии Ҷумҳурии Тоҷикистон (Шаб)"
          loading="eager"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
            isDark ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      </div>

      {/* 2. Ambient Volumetric Lighting Glow on Supreme Court Facade */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          isDark
            ? 'bg-radial-gradient from-[#dfbe7e]/12 via-transparent to-black/85 opacity-90'
            : 'bg-radial-gradient from-[#b88a24]/8 via-transparent to-white/70 opacity-80'
        }`}
      />

      {/* 3. Deepening Atmospheric Overlay for Absolute Editorial & Card Legibility */}
      <div
        ref={overlayRef}
        className="absolute inset-0"
        style={{
          backgroundColor: isDark ? 'rgba(5, 8, 15, 0.50)' : 'rgba(246, 248, 251, 0.75)',
        }}
      />

      {/* 4. Peripheral Vignette & Contrast Framing */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isDark
            ? 'bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.92)_100%)] opacity-100'
            : 'bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(15,23,42,0.18)_100%)] opacity-70'
        }`}
      />
    </div>
  );
};

export default ScrollVideo;
