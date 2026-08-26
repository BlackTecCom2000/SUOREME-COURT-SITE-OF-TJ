import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Gavel, RotateCcw, Sparkles } from 'lucide-react';

interface CinematicDigitalGavelProps {
  onDecisionTriggered?: () => void;
}

export const CinematicDigitalGavel: React.FC<CinematicDigitalGavelProps> = ({
  onDecisionTriggered,
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [hasDecided, setHasDecided] = useState(false);
  const [strikePhase, setStrikePhase] = useState<'idle' | 'lift' | 'slam' | 'impact' | 'rebound'>('idle');
  const [isHovered, setIsHovered] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string }>>([]);
  const animFrameRef = useRef<number | null>(null);

  // Trigger Strike
  const triggerStrike = useCallback(() => {
    if (strikePhase !== 'idle') return;

    setStrikePhase('lift');

    // Sequence timing
    setTimeout(() => {
      setStrikePhase('slam');
      setTimeout(() => {
        setStrikePhase('impact');
        setHasDecided(true);
        onDecisionTriggered?.();
        emitParticles();

        setTimeout(() => {
          setStrikePhase('rebound');
          setTimeout(() => {
            setStrikePhase('idle');
          }, 250);
        }, 120);
      }, 140);
    }, 280);
  }, [strikePhase, onDecisionTriggered]);

  // Reset Strike
  const handleReset = useCallback(() => {
    setHasDecided(false);
    setStrikePhase('idle');
  }, []);

  // Keyboard Navigation: Space / Enter to strike, R to reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        triggerStrike();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerStrike, handleReset]);

  // Pointer Parallax Handler
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: x * 15, y: y * 12 });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setParallax({ x: 0, y: 0 });
  };

  // Sparkles Particle Canvas Loop
  const emitParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const count = 38;
    const centerX = canvas.width / 2 - 35;
    const centerY = canvas.height / 2 + 55;

    const colors = isDark 
      ? ['#dfbe7e', '#ffe082', '#ffffff', '#ffd54f']
      : ['#c5a059', '#dfbe7e', '#b8860b', '#d4af37'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 5.5;
      particlesRef.current.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.2,
        life: 1.0,
        maxLife: 0.6 + Math.random() * 0.4,
        size: 1.5 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    if (!animFrameRef.current) {
      renderParticles();
    }
  };

  const renderParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // Gravity
      p.life -= 0.025;

      if (p.life > 0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        particlesRef.current.splice(idx, 1);
      }
    });

    if (particlesRef.current.length > 0) {
      animFrameRef.current = requestAnimationFrame(renderParticles);
    } else {
      animFrameRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Compute Gavel transform based on strike phase & parallax
  let gavelRotation = -14 + parallax.x * 0.4;
  let gavelTranslateY = 0 + parallax.y * 0.4;

  if (strikePhase === 'lift') {
    gavelRotation = -38;
    gavelTranslateY = -45;
  } else if (strikePhase === 'slam') {
    gavelRotation = 3;
    gavelTranslateY = 12;
  } else if (strikePhase === 'impact') {
    gavelRotation = 0;
    gavelTranslateY = 18;
  } else if (strikePhase === 'rebound') {
    gavelRotation = -6;
    gavelTranslateY = -8;
  }

  return (
    <div
      role="region"
      aria-label={language === 'tj' ? 'Гурзи судии интерактивӣ' : language === 'en' ? 'Interactive Judicial Gavel' : 'Интерактивный судебный молоток'}
      className="relative w-full h-[480px] sm:h-[540px] flex flex-col items-center justify-center select-none overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={handlePointerLeave}
    >
      {/* Background Subtle Radial Judicial Glow */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          hasDecided 
            ? 'opacity-80' 
            : isHovered 
            ? 'opacity-60' 
            : 'opacity-35'
        }`}
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 55%, rgba(223,190,126,0.18) 0%, rgba(6,11,24,0) 70%)'
            : 'radial-gradient(circle at 50% 55%, rgba(223,190,126,0.28) 0%, rgba(248,250,252,0) 70%)',
        }}
      />

      {/* Particle Canvas Overlay */}
      <canvas
        ref={canvasRef}
        width={600}
        height={500}
        className="absolute inset-0 pointer-events-none z-20 w-full h-full"
      />

      {/* Main Interactive SVG Canvas */}
      <div 
        onClick={triggerStrike}
        className="relative z-10 w-full max-w-[460px] cursor-pointer group transition-transform duration-300"
        style={{
          transform: `scale(${isHovered ? 1.02 : 1})`,
        }}
      >
        <svg
          viewBox="0 0 500 420"
          className="w-full h-auto drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Walnut Wood Grain Linear Gradient */}
            <linearGradient id="walnutWoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e0f05" />
              <stop offset="25%" stopColor="#3d210b" />
              <stop offset="50%" stopColor="#5c3413" />
              <stop offset="70%" stopColor="#3a1f0a" />
              <stop offset="100%" stopColor="#180c04" />
            </linearGradient>

            {/* Dark Antique Bronze Head Gradient */}
            <linearGradient id="darkBronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1c160e" />
              <stop offset="30%" stopColor="#382b1c" />
              <stop offset="50%" stopColor="#52402b" />
              <stop offset="75%" stopColor="#2c2114" />
              <stop offset="100%" stopColor="#140f09" />
            </linearGradient>

            {/* Judicial Gold Metallic Trim Gradient */}
            <linearGradient id="judicialGoldGrad" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#b8860b" />
              <stop offset="25%" stopColor="#dfbe7e" />
              <stop offset="50%" stopColor="#fff2cc" />
              <stop offset="75%" stopColor="#dfbe7e" />
              <stop offset="100%" stopColor="#996515" />
            </linearGradient>

            {/* Sounding Base Dark Stone / Marble Gradient */}
            <linearGradient id="stoneBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#251f18" />
              <stop offset="50%" stopColor="#15110d" />
              <stop offset="100%" stopColor="#0a0806" />
            </linearGradient>

            {/* Impact Plate Brass Gradient */}
            <radialGradient id="brassPlateGrad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#fdf3d8" />
              <stop offset="50%" stopColor="#dfbe7e" />
              <stop offset="85%" stopColor="#9a7428" />
              <stop offset="100%" stopColor="#5c4413" />
            </radialGradient>

            {/* Drop Shadow Filter for Real Depth */}
            <filter id="gavelDropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#000000" floodOpacity="0.65" />
            </filter>

            {/* Subtle Metallic Glow on Hover */}
            <filter id="metallicGoldGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
              <feComponentTransfer><feFuncA type="linear" slope="0.8" /></feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ========================================================= */}
          {/* LAYER 1: SOUNDING BLOCK / JUDICIAL BASE                   */}
          {/* ========================================================= */}
          <g transform="translate(140, 275)">
            {/* Ground Contact Shadow */}
            <ellipse cx="110" cy="85" rx="140" ry="24" fill="#000000" opacity="0.6" filter="blur(8px)" />

            {/* Octagonal Stepped Base Lower Plinth */}
            <path
              d="M 10 75 L 45 60 L 175 60 L 210 75 L 195 92 L 25 92 Z"
              fill="url(#stoneBaseGrad)"
              stroke="#0a0806"
              strokeWidth="2"
            />
            {/* Base Mid Layer with Walnut Texture */}
            <path
              d="M 22 62 L 50 48 L 170 48 L 198 62 L 188 74 L 32 74 Z"
              fill="url(#walnutWoodGrad)"
              stroke="url(#judicialGoldGrad)"
              strokeWidth="1.5"
            />

            {/* Gold Accent Bevel Trim */}
            <path
              d="M 32 50 L 58 38 L 162 38 L 188 50 L 180 58 L 40 58 Z"
              fill="url(#judicialGoldGrad)"
              opacity="0.95"
            />

            {/* Circular Brass Impact Sounding Plate */}
            <ellipse cx="110" cy="46" rx="65" ry="18" fill="url(#brassPlateGrad)" stroke="#b8860b" strokeWidth="2" />
            <ellipse cx="110" cy="46" rx="55" ry="14" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
            <ellipse cx="110" cy="46" rx="42" ry="10" fill="url(#darkBronzeGrad)" opacity="0.25" />

            {/* Expanding Shockwave Light Ring on Impact */}
            {strikePhase === 'impact' && (
              <ellipse
                cx="110"
                cy="46"
                rx="85"
                ry="24"
                fill="none"
                stroke="url(#judicialGoldGrad)"
                strokeWidth="4"
                opacity="0.9"
                className="animate-ping"
              />
            )}
          </g>

          {/* ========================================================= */}
          {/* LAYER 2: ARTICULATED MOVABLE GAVEL                       */}
          {/* ========================================================= */}
          <g
            style={{
              transformOrigin: '360px 240px',
              transform: `translate(${parallax.x * 0.2}px, ${gavelTranslateY}px) rotate(${gavelRotation}deg)`,
              transition: strikePhase === 'idle' 
                ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.3, 1)' 
                : strikePhase === 'lift' 
                ? 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)' 
                : strikePhase === 'slam' 
                ? 'transform 0.14s cubic-bezier(0.8, 0, 1, 1)' 
                : 'transform 0.12s ease-out',
            }}
            filter={isHovered ? 'url(#metallicGoldGlow)' : 'url(#gavelDropShadow)'}
          >
            {/* Gavel Handle Assembly */}
            {/* 1. Grip Pommel Bulb */}
            <circle cx="370" cy="240" r="16" fill="url(#walnutWoodGrad)" stroke="url(#judicialGoldGrad)" strokeWidth="2" />
            <ellipse cx="358" cy="240" rx="4" ry="12" fill="url(#judicialGoldGrad)" />

            {/* 2. Contoured Walnut Handle Shaft */}
            <path
              d="M 356 232 C 300 230, 240 228, 160 224 L 160 256 C 240 252, 300 250, 356 248 Z"
              fill="url(#walnutWoodGrad)"
              stroke="#180c04"
              strokeWidth="1.5"
            />
            {/* Handle Specular Light Reflection Streak */}
            <path
              d="M 350 236 C 290 234, 230 232, 165 230 L 165 233 C 230 235, 290 237, 350 239 Z"
              fill="#ffffff"
              opacity="0.3"
            />

            {/* 3. Inlaid Gold Collar Rings on Handle */}
            <rect x="300" y="231" width="6" height="18" rx="2" fill="url(#judicialGoldGrad)" />
            <rect x="230" y="230" width="7" height="20" rx="2" fill="url(#judicialGoldGrad)" />
            <rect x="162" y="226" width="9" height="28" rx="3" fill="url(#judicialGoldGrad)" stroke="#7a5210" strokeWidth="1" />

            {/* Gavel Barrel Head Assembly */}
            {/* 1. Central Barrel Waist */}
            <rect
              x="115"
              y="170"
              width="50"
              height="140"
              rx="16"
              fill="url(#darkBronzeGrad)"
              stroke="#140f09"
              strokeWidth="2"
            />

            {/* 2. Central Gold Inlay Sleeve */}
            <rect
              x="120"
              y="222"
              width="40"
              height="36"
              rx="4"
              fill="url(#judicialGoldGrad)"
              stroke="#7a5210"
              strokeWidth="1"
            />

            {/* 3. Upper Striking Face Cap */}
            <ellipse cx="140" cy="172" rx="28" ry="12" fill="url(#darkBronzeGrad)" stroke="url(#judicialGoldGrad)" strokeWidth="2.5" />
            <ellipse cx="140" cy="172" rx="18" ry="7" fill="url(#stoneBaseGrad)" opacity="0.6" />

            {/* 4. Lower Striking Face Cap (Impact surface) */}
            <ellipse cx="140" cy="308" rx="28" ry="12" fill="url(#darkBronzeGrad)" stroke="url(#judicialGoldGrad)" strokeWidth="2.5" />
            <ellipse cx="140" cy="308" rx="20" ry="8" fill="url(#stoneBaseGrad)" opacity="0.8" />

            {/* Highlight Accent Flare on Metal Edge */}
            <ellipse cx="128" cy="205" rx="4" ry="24" fill="#ffffff" opacity="0.25" />
          </g>
        </svg>
      </div>

      {/* Bottom Interactive Action Status Pill */}
      <div className="relative z-30 mt-3 flex flex-col items-center gap-2.5">
        <div className="flex items-center gap-3">
          {/* Strike Decision Button */}
          <button
            type="button"
            onClick={triggerStrike}
            className={`
              px-6 py-2.5 rounded-full border font-mono text-xs uppercase tracking-wider font-bold
              flex items-center gap-2 shadow-lg transition-all duration-300 cursor-pointer
              ${
                hasDecided
                  ? 'border-emerald-400/80 bg-emerald-500/20 text-emerald-300 shadow-emerald-500/20'
                  : 'border-[#dfbe7e] bg-gradient-to-r from-[#dfbe7e] via-[#eed49f] to-[#dfbe7e] text-black hover:scale-105 shadow-[#dfbe7e]/25'
              }
            `}
          >
            {hasDecided ? <Sparkles size={16} /> : <Gavel size={16} />}
            <span>
              {hasDecided
                ? (language === 'tj' ? 'ҚАРОР ҚАБУЛ ШУД' : language === 'en' ? 'DECISION RECORDED' : 'РЕШЕНИЕ ПРИНЯТО')
                : (language === 'tj' ? 'ҚАРОР БАРОРЕД' : language === 'en' ? 'DELIVER DECISION' : 'ВЫНЕСТИ РЕШЕНИЕ')}
            </span>
          </button>

          {/* Reset Button */}
          {hasDecided && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-[#dfbe7e] transition-all font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>{language === 'tj' ? 'АЗ НАВ' : language === 'en' ? 'RESET' : 'СБРОСИТЬ'}</span>
            </button>
          )}
        </div>

        {/* Keyboard & Mouse Interaction Hint */}
        <div className="flex items-center gap-2 font-mono text-[10px] text-white/50 tracking-wider">
          <span className="hidden sm:inline">
            [Space / Enter] = {language === 'tj' ? 'Зарба' : language === 'en' ? 'Strike' : 'Удар'}
          </span>
          {hasDecided && (
            <span className="hidden sm:inline">
              • [R] = {language === 'tj' ? 'Бозсозӣ' : language === 'en' ? 'Reset' : 'Сброс'}
            </span>
          )}
          <span>
            • {language === 'tj' ? 'Ба гурз клик кунед' : language === 'en' ? 'Click or tap the gavel' : 'Нажмите на молоток'}
          </span>
        </div>
      </div>
    </div>
  );
};
