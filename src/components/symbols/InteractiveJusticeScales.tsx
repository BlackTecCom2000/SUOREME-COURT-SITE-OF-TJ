import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Scale } from 'lucide-react';

interface InteractiveJusticeScalesProps {
  onBalanceRestored?: () => void;
  className?: string;
}

export const InteractiveJusticeScales: React.FC<InteractiveJusticeScalesProps> = ({
  onBalanceRestored,
  className = '',
}) => {
  const { language } = useLanguage();
  const [tilt, setTilt] = useState<number>(0);
  const [balanceState, setBalanceState] = useState<'neutral' | 'law' | 'justice' | 'restored'>('neutral');

  const handleTilt = (side: 'law' | 'justice') => {
    if (side === 'law') {
      setTilt(-5);
      setBalanceState('law');
    } else {
      setTilt(5);
      setBalanceState('justice');
    }
  };

  const handleResetEquilibrium = () => {
    setTilt(0);
    setBalanceState('restored');
    onBalanceRestored?.();
    setTimeout(() => setBalanceState('neutral'), 2500);
  };

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center pointer-events-auto ${className}`}
      aria-label={language === 'tj' ? 'Тарозуи адолат' : language === 'en' ? 'Scales of Justice' : 'Весы правосудия'}
    >
      {/* Gallery Backlight */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div
          className={`w-[480px] h-[380px] rounded-full blur-3xl transition-all duration-700 ${
            balanceState === 'restored'
              ? 'bg-gradient-to-b from-[#dfbe7e]/35 via-emerald-500/20 to-transparent scale-110'
              : 'bg-gradient-to-b from-[#dfbe7e]/15 to-transparent scale-100'
          }`}
        />
      </div>

      {/* Realistic Museum Scale Display Frame */}
      <div className="relative w-full max-w-[420px] aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#dfbe7e]/30 bg-[#070b14]">
        {/* Tilting Visual Layer */}
        <div
          style={{
            transform: `rotate(${tilt}deg)`,
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="w-full h-full relative origin-center"
        >
          <img
            src="/assets/symbols/justice-scales.jpg"
            alt="Antique Bronze Scales of Justice"
            className="w-full h-full object-cover object-center"
          />

          {/* Left Plate Glow on 'Law' Tilt */}
          <div
            className={`absolute left-[12%] bottom-[22%] w-24 h-24 rounded-full bg-cyan-400/20 blur-xl pointer-events-none transition-opacity duration-500 ${
              balanceState === 'law' ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Right Plate Glow on 'Justice' Tilt */}
          <div
            className={`absolute right-[12%] bottom-[22%] w-24 h-24 rounded-full bg-emerald-400/20 blur-xl pointer-events-none transition-opacity duration-500 ${
              balanceState === 'justice' ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050e] via-transparent to-transparent opacity-80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#02050e]/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Interactive Equilibrium Reset Controller */}
      <div className="mt-3.5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleTilt('law')}
          className={`px-3.5 py-1.5 rounded-lg border text-xs font-serif font-bold transition-all ${
            balanceState === 'law'
              ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
              : 'border-white/10 bg-[#060b18]/80 text-white/70 hover:border-[#dfbe7e]'
          }`}
        >
          {language === 'tj' ? 'ҚОНУН' : language === 'en' ? 'LAW' : 'ЗАКОН'}
        </button>

        <button
          type="button"
          onClick={handleResetEquilibrium}
          className={`px-4 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
            balanceState === 'restored'
              ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'border-[#dfbe7e] bg-[#dfbe7e]/15 text-[#ffe082] hover:bg-[#dfbe7e]/30'
          }`}
        >
          <Scale size={13} />
          <span>
            {balanceState === 'restored'
              ? language === 'tj'
                ? 'БАЛАНС БАРҚАРОР ШУД'
                : language === 'en'
                ? 'BALANCE RESTORED'
                : 'БАЛАНС ВОССТАНОВЛЕН'
              : language === 'tj'
              ? 'БАРҚАРОРИИ БАЛАНС'
              : language === 'en'
              ? 'RESTORE BALANCE'
              : 'УСТАНОВИТЬ БАЛАНС'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTilt('justice')}
          className={`px-3.5 py-1.5 rounded-lg border text-xs font-serif font-bold transition-all ${
            balanceState === 'justice'
              ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
              : 'border-white/10 bg-[#060b18]/80 text-white/70 hover:border-[#dfbe7e]'
          }`}
        >
          {language === 'tj' ? 'АДОЛАТ' : language === 'en' ? 'JUSTICE' : 'ПРАВО'}
        </button>
      </div>
    </div>
  );
};
