import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export const ScrollVideo: React.FC = () => {
  const { isDark } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const [pageScrollProgress, setPageScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = Math.min(Math.max(currentScroll / maxScroll, 0), 1);
      setScrollY(currentScroll);
      setPageScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Subtle zoom & parallax calculation based on scroll
  const scale = 1.0 + Math.min(pageScrollProgress * 0.08, 0.08);
  const translateY = Math.min(scrollY * 0.04, 60);

  // Atmospheric overlay deepening as user scrolls down the page so Themis is a soft atmospheric accent
  const darkAtmospheric = Math.min(
    0.92,
    0.50 + Math.max(0, (pageScrollProgress - 0.15) * 0.55)
  );

  const lightAtmospheric = Math.min(
    0.96,
    0.75 + Math.max(0, (pageScrollProgress - 0.15) * 0.25)
  );

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 bg-[var(--bg-primary)] pointer-events-none select-none overflow-hidden transition-colors duration-700"
    >
      {/* 1. Ultra-High Resolution Supreme Court Building Architecture (Continuous Cross-fade) */}
      <div
        className="absolute inset-0 w-full h-full transform-gpu will-change-transform transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${scale}) translateY(-${translateY}px)`,
        }}
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
        className="absolute inset-0 transition-colors duration-500"
        style={{
          backgroundColor: isDark
            ? `rgba(5, 8, 15, ${darkAtmospheric})`
            : `rgba(246, 248, 251, ${lightAtmospheric})`,
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
