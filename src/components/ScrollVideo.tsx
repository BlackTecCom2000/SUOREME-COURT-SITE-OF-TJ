import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSiteBackground } from '../hooks/useSiteBackground';
import { useSkyMasks } from '../hooks/useSkyMasks';
import CloudSky from './CloudSky';

export const ScrollVideo: React.FC = () => {
  const { isDark } = useTheme();
  const { imageDay, imageNight } = useSiteBackground();
  // PERF: scroll writes bypass React state entirely â€” a single rAF-throttled
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
      // Natural background: no white overlay â€” keep building vibrant, sky blue intact
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

  // Same silhouette masks as GlobalBackground: the baked sky is cut away so the
  // live WebGL clouds fill the space around the building.
  const masks = useSkyMasks();
  const photoStyle = (mask: string | null): React.CSSProperties => ({
    filter: 'saturate(var(--bg-saturation, 100%)) brightness(var(--bg-brightness, 100%)) contrast(var(--bg-contrast, 100%))',
    ...(mask
      ? {
          maskImage: `url(${mask})`,
          WebkitMaskImage: `url(${mask})`,
          maskSize: 'cover',
          WebkitMaskSize: 'cover',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }
      : {}),
  });

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 bg-[var(--bg-primary)] pointer-events-none select-none overflow-hidden transition-colors duration-700"
    >
      {/* live sky + interactive clouds, under the photograph */}
      <CloudSky
        className="absolute inset-0 w-full h-full"
        background={isDark ? '#050d1f' : '#2f6fb5'}
        baseColor={isDark ? '#16233d' : '#b9d6f0'}
        accentColor={isDark ? '#8fa3c4' : '#ffffff'}
        density={62}
        speed={34}
        size={140}
        clouds={{ softness: 170, shadow: isDark ? 40 : 78, cirrus: 60 }}
        sun={{ x: 82, y: 94, glow: isDark ? 'rgba(148, 170, 210, 0.35)' : 'rgba(255, 246, 224, 0.95)' }}
        pointer={{ parallax: 150, wind: 190, damping: 26 }}
        resolutionScale={0.5}
        opacity={isDark ? 0.95 : 1}
      />

      <div
        ref={parallaxRef}
        className="absolute inset-0 w-full h-full transform-gpu"
        style={{
          transform: 'scale(1) translateY(-0px)',
          filter: `blur(var(--bg-blur, 0px))`,
        }}
      >
        <img
          src={imageDay}
          alt="Бинои Суди Олии Ҷумҳурии Тоҷикистон (Рӯз)"
          loading="eager"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
            !isDark ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          style={photoStyle(masks.day)}
        />
        <img
          src={imageNight}
          alt="Бинои Суди Олии Ҷумҳурии Тоҷикистон (Шаб)"
          loading="eager"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
            isDark ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          style={photoStyle(masks.night)}
        />
      </div>
      {/* Atmospheric White Overlay â€” configurable, weak, building and sky remain visible â€” NO backdrop-filter here */}
      {/* atmospheric haze, capped by .bg-atmosphere-haze */}
      <div className="absolute inset-0 pointer-events-none bg-atmosphere-haze" />
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

