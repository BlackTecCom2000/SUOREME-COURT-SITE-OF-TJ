import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export const ScrollVideo: React.FC = () => {
  const { isDark } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const [pageScrollProgress, setPageScrollProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

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

  // Atmospheric overlay deepening as user scrolls down the page
  const darkAtmospheric = Math.min(
    0.85,
    0.35 + Math.max(0, (pageScrollProgress - 0.15) * 0.65)
  );

  const lightAtmospheric = Math.min(
    0.92,
    0.65 + Math.max(0, (pageScrollProgress - 0.15) * 0.35)
  );

  const currentBgImage = isDark
    ? '/themis-background.jpg'
    : '/themis-light-background.jpg';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 bg-[var(--bg-primary)] pointer-events-none select-none overflow-hidden transition-colors duration-700"
    >
      {/* 1. High-Resolution Majestic Themis Artwork with Scroll-Scrubbed Parallax & Scale */}
      <div
        className="absolute inset-0 w-full h-full transform-gpu will-change-transform transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${scale}) translateY(-${translateY}px)`,
        }}
      >
        <img
          src={currentBgImage}
          alt="Фемида — Богиня правосудия"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center transition-opacity duration-1000 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* 2. Ambient Volumetric Lighting Glow */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          isDark
            ? 'bg-radial-gradient from-[#dfbe7e]/10 via-transparent to-black/80 opacity-90'
            : 'bg-radial-gradient from-[#b88a24]/5 via-transparent to-white/60 opacity-80'
        }`}
      />

      {/* 3. Deepening Atmospheric Overlay for Editorial Legibility */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          backgroundColor: isDark
            ? `rgba(5, 8, 15, ${darkAtmospheric})`
            : `rgba(246, 248, 251, ${lightAtmospheric})`,
        }}
      />

      {/* 4. Vignette / Contrast Framing */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isDark
            ? 'bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.85)_100%)] opacity-100'
            : 'bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(15,23,42,0.14)_100%)] opacity-70'
        }`}
      />
    </div>
  );
};

export default ScrollVideo;
