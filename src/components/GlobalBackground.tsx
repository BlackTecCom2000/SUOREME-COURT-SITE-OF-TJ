import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSiteBackground } from '../hooks/useSiteBackground';

export const GlobalBackground: React.FC = () => {
  const { isDark } = useTheme();
  const { imageDay, imageNight } = useSiteBackground();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const maxScrollRef = useRef(1);
  const rafRef = useRef(0);
  const darkRef = useRef(isDark);
  darkRef.current = isDark;

  useEffect(() => {
    const updateMax = () => { maxScrollRef.current = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); };
    updateMax();
    const apply = () => {
      rafRef.current = 0;
      const y = window.scrollY;
      const p = Math.min(Math.max(y / maxScrollRef.current, 0), 1);
      const scale = 1 + Math.min(p * 0.08, 0.08);
      const ty = Math.min(y * 0.04, 60);
      if (parallaxRef.current) parallaxRef.current.style.transform = `scale(${scale.toFixed(4)}) translateY(-${ty.toFixed(1)}px)`;
      if (overlayRef.current) overlayRef.current.style.backgroundColor = darkRef.current ? `rgba(5, 8, 15, ${Math.min(0.35, 0.12 + p * 0.15).toFixed(2)})` : `rgba(0, 0, 0, 0)`;
    };
    const onScroll = () => { if (!rafRef.current) rafRef.current = requestAnimationFrame(apply); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateMax);
    apply();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', updateMax); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 bg-[var(--bg-primary)] pointer-events-none select-none overflow-hidden">
      <div ref={parallaxRef} className="absolute inset-0 w-full h-full transform-gpu" style={{ transform: 'scale(1) translateY(-0px)' }}>
        <img src={imageDay} alt="" loading="eager" className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${!isDark ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} />
        <img src={imageNight} alt="" loading="eager" className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${isDark ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} />
      </div>
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${isDark ? 'opacity-40' : 'opacity-15'}`} style={{ background: isDark ? 'radial-gradient(ellipse at 50% 0%, rgba(223,190,126,0.08) 0%, transparent 55%)' : 'radial-gradient(ellipse at 50% 0%, rgba(184,138,36,0.04) 0%, transparent 60%)' }} />
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{ backgroundColor: isDark ? 'rgba(5, 8, 15, 0.12)' : 'rgba(0, 0, 0, 0)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'radial-gradient(ellipse at center, transparent 65%, rgba(0,0,0,0.14) 100%)' }} />
    </div>
  );
};

export default GlobalBackground;
