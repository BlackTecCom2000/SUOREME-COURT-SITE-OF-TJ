import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, Eye } from 'lucide-react';

interface InteractiveThemisProps {
  isInsightMode?: boolean;
  onToggleInsight?: () => void;
  className?: string;
}

export const InteractiveThemis: React.FC<InteractiveThemisProps> = ({
  isInsightMode = false,
  onToggleInsight,
  className = '',
}) => {
  const { language } = useLanguage();
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 10;
      const y = (e.clientY / innerHeight - 0.5) * 6;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={language === 'tj' ? 'Фемида: Беғаразӣ' : language === 'en' ? 'Themis: Impartiality' : 'Фемида: Беспристрастность'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggleInsight?.();
        }
      }}
      onClick={onToggleInsight}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative select-none flex flex-col items-center justify-center cursor-pointer group ${className}`}
    >
      <style>{`
        @keyframes scanBeam {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(200%); opacity: 0; }
        }
        @keyframes dustFloat {
          0%, 100% { transform: translateY(0px) scale(0.8); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.1); opacity: 0.9; }
        }
      `}</style>

      {/* Atmospheric Gallery Volumetric Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div
          className={`w-[440px] h-[520px] rounded-full blur-3xl transition-all duration-700 ${
            isInsightMode
              ? 'bg-gradient-to-b from-[#dfbe7e]/35 via-cyan-500/25 to-transparent scale-110'
              : isHovered
              ? 'bg-gradient-to-b from-[#dfbe7e]/25 via-cyan-500/15 to-transparent scale-105'
              : 'bg-gradient-to-b from-[#dfbe7e]/15 via-blue-500/10 to-transparent scale-100'
          }`}
        />
      </div>

      {/* Floating Gallery Atmospheric Dust Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: '20%', top: '65%', dur: '4.5s', delay: '0s' },
          { left: '80%', top: '45%', dur: '5.2s', delay: '1.2s' },
          { left: '35%', top: '30%', dur: '3.8s', delay: '2.5s' },
          { left: '65%', top: '20%', dur: '4.8s', delay: '0.8s' },
        ].map((p, idx) => (
          <span
            key={`themis-dust-${idx}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#dfbe7e] shadow-[0_0_8px_#dfbe7e]"
            style={{
              left: p.left,
              top: p.top,
              animation: `dustFloat ${p.dur} ease-in-out infinite`,
              animationDelay: p.delay,
              opacity: isHovered || isInsightMode ? 0.9 : 0.4,
            }}
          />
        ))}
      </div>

      {/* Realistic Museum Sculpture Display Container */}
      <div
        style={{
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
          transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="relative w-full max-w-[340px] aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#dfbe7e]/30 bg-[#070b14]"
      >
        {/* Main High-Resolution Realistic Bronze Sculpture Image */}
        <img
          src="/assets/symbols/themis-sculpture.jpg"
          alt="Themis - Classical Museum Bronze Sculpture"
          className={`
            w-full h-full object-cover object-center transition-all duration-700
            ${isInsightMode ? 'brightness-115 contrast-105' : 'brightness-100 group-hover:brightness-110'}
          `}
        />

        {/* Cinematic Rim Light & Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050e] via-transparent to-transparent opacity-80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#02050e]/40 via-transparent to-transparent pointer-events-none" />

        {/* Digital Reconstruction Overlay (Active during Insight Mode) */}
        {isInsightMode && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Fine Scanning Laser Beam */}
            <div
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent shadow-[0_0_12px_#00e5ff]"
              style={{ animation: 'scanBeam 3s ease-in-out infinite' }}
            />
            {/* Digital Grid Scanlines */}
            <div
              className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-60"
            />
          </div>
        )}

        {/* Pedestal Inscription Plaque */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded border border-[#dfbe7e]/50 content-card">
          <span className="font-serif text-[11px] text-[#dfbe7e] font-bold tracking-[0.25em] uppercase">
            JUSTITIA
          </span>
        </div>
      </div>

      {/* Insight Mode Action Button Badge */}
      <div
        className={`
          mt-3.5 px-4 py-1.5 rounded-full border transition-all duration-300 flex items-center gap-2
          backdrop-blur-md
          ${
            isInsightMode
              ? 'border-[#dfbe7e] bg-[#dfbe7e]/20 text-[#ffe082] shadow-[0_0_15px_rgba(223,190,126,0.4)] scale-105'
              : 'border-white/15 bg-[#060b18]/80 text-white/75 hover:border-[#dfbe7e]/60 hover:text-white group-hover:scale-102'
          }
        `}
      >
        {isInsightMode ? <Sparkles size={13} className="text-[#dfbe7e] animate-spin" /> : <Eye size={13} />}
        <span className="font-mono text-[10px] tracking-widest uppercase font-semibold">
          {isInsightMode
            ? language === 'tj'
              ? 'РЕҶАИ БЕҒАРАЗӢ ФАЪОЛ'
              : language === 'en'
              ? 'INSIGHT MODE ACTIVE'
              : 'РЕЖИМ БЕСПРИСТРАСТНОСТИ'
            : language === 'tj'
            ? 'БАРОИ ИНСАЙТ ЗЕР КУНЕД'
            : language === 'en'
            ? 'EXPLORE IMPARTIALITY'
            : 'ИССЛЕДОВАТЬ БЕСПРИСТРАСТНОСТЬ'}
        </span>
      </div>
    </div>
  );
};
