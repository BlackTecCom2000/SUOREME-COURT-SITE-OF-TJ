import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSiteBackground } from '../hooks/useSiteBackground';

export const GlobalBackground: React.FC = () => {
  const { isDark } = useTheme();
  const { imageDay, imageNight } = useSiteBackground();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const maxScrollRef = useRef(1);
  const frameRef = useRef(0);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);

  useEffect(() => {
    const updateMax = () => { maxScrollRef.current = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); };
    updateMax();
    const apply = () => {
      frameRef.current = 0;
      const current = currentScrollRef.current;
      const target = targetScrollRef.current;
      const next = current + (target - current) * 0.085;
      currentScrollRef.current = Math.abs(target - next) < 0.1 ? target : next;

      // The zoom eases toward a limit instead of stopping abruptly at the page end.
      const progress = Math.max(0, currentScrollRef.current / maxScrollRef.current);
      const zoom = 1 + 0.11 * (1 - Math.exp(-progress * 1.35));
      const translate = 54 * (1 - Math.exp(-progress * 1.1));
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `scale(${zoom.toFixed(5)}) translate3d(0, -${translate.toFixed(2)}px, 0)`;
      }

      if (Math.abs(target - currentScrollRef.current) > 0.1) {
        frameRef.current = requestAnimationFrame(apply);
      }
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
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 bg-[var(--bg-primary)] pointer-events-none select-none overflow-hidden">
      <div
        ref={parallaxRef}
        className="absolute inset-0 w-full h-full transform-gpu"
        style={{
          transform: 'scale(1) translateY(-0px)',
          filter: `blur(var(--bg-blur, 0px)) saturate(var(--bg-saturation, 100%)) brightness(var(--bg-brightness, 100%)) contrast(var(--bg-contrast, 100%))`,
        }}
      >
        <img src={imageDay} alt="" loading="eager" className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${!isDark ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} />
        <img src={imageNight} alt="" loading="eager" className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${isDark ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} />
      </div>
      {/* Atmospheric White Overlay — configurable, weak, building and sky remain visible — NO backdrop-filter here (only on GlassCard etc.) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `rgba(255,255,255, var(--bg-overlay-opacity, 0.12))`,
        }}
      />
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${isDark ? 'opacity-20' : 'opacity-10'}`} style={{ background: isDark ? 'radial-gradient(ellipse at 50% 0%, rgba(223,190,126,0.06) 0%, transparent 55%)' : 'radial-gradient(ellipse at 50% 0%, rgba(184,138,36,0.02) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'radial-gradient(ellipse at center, transparent 70%, rgba(0,0,0,0.08) 100%)' }} />
    </div>
  );
};

export default GlobalBackground;
