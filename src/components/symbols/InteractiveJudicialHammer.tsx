import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Gavel, CheckCircle } from 'lucide-react';

interface InteractiveJudicialHammerProps {
  onDecisionTriggered?: () => void;
  className?: string;
}

export const InteractiveJudicialHammer: React.FC<InteractiveJudicialHammerProps> = ({
  onDecisionTriggered,
  className = '',
}) => {
  const { language } = useLanguage();
  const [isStriking, setIsStriking] = useState(false);
  const [hasStruck, setHasStruck] = useState(false);

  const handleStrike = () => {
    if (isStriking) return;
    setIsStriking(true);

    // Gavel downward strike & impact timing
    setTimeout(() => {
      setHasStruck(true);
      onDecisionTriggered?.();
    }, 450);

    setTimeout(() => {
      setIsStriking(false);
    }, 1200);

    setTimeout(() => {
      setHasStruck(false);
    }, 4000);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={language === 'tj' ? 'Гурзи судӣ: Қабули қарор' : language === 'en' ? 'Judicial Gavel: Record Decision' : 'Судейский молот: Принятие решения'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStrike();
        }
      }}
      onClick={handleStrike}
      className={`relative select-none flex flex-col items-center justify-center cursor-pointer group ${className}`}
    >
      <style>{`
        @keyframes gavel3DLiftStrike {
          0% { transform: translateY(0px) rotate(0deg) scale(1); }
          30% { transform: translateY(-16px) rotate(-6deg) scale(1.04); }
          55% { transform: translateY(6px) rotate(2deg) scale(0.98); }
          75% { transform: translateY(-3px) rotate(-1deg) scale(1.01); }
          100% { transform: translateY(0px) rotate(0deg) scale(1); }
        }
        @keyframes soundBlockShockwave {
          0% { transform: scale(0.3); opacity: 0.95; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* Gallery Backlight */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div
          className={`w-[480px] h-[400px] rounded-full blur-3xl transition-all duration-700 ${
            hasStruck
              ? 'bg-gradient-to-b from-[#dfbe7e]/35 via-amber-500/25 to-transparent scale-115'
              : 'bg-gradient-to-b from-[#dfbe7e]/15 to-transparent scale-100'
          }`}
        />
      </div>

      {/* Realistic Museum Gavel Display Frame */}
      <div className="relative w-full max-w-[440px] aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#dfbe7e]/30 bg-[#070b14]">
        {/* Animated Gavel Layer */}
        <div
          style={{
            animation: isStriking ? 'gavel3DLiftStrike 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' : 'none',
          }}
          className="w-full h-full relative origin-center"
        >
          <img
            src="/assets/symbols/judicial-gavel.jpg"
            alt="Dark Walnut and Brass Judicial Gavel"
            className="w-full h-full object-cover object-center"
          />

          {/* Soundblock Shockwave Wave on Impact */}
          {hasStruck && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-48 h-32 rounded-full border-2 border-[#dfbe7e] shadow-[0_0_25px_#dfbe7e]"
                style={{ animation: 'soundBlockShockwave 1s ease-out forwards' }}
              />
            </div>
          )}
        </div>

        {/* Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050e] via-transparent to-transparent opacity-80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#02050e]/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Action Trigger Button Badge */}
      <div
        className={`
          mt-3.5 px-5 py-2 rounded-full border transition-all duration-300 flex items-center gap-2
          backdrop-blur-md shadow-md
          ${
            hasStruck
              ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105'
              : 'border-[#dfbe7e] bg-[#dfbe7e]/15 text-[#ffe082] hover:bg-[#dfbe7e]/30 group-hover:scale-102'
          }
        `}
      >
        {hasStruck ? <CheckCircle size={15} className="text-emerald-400" /> : <Gavel size={15} />}
        <span className="font-mono text-xs font-bold uppercase tracking-wider">
          {hasStruck
            ? language === 'tj'
              ? 'ҚАРОР ҚАБУЛ ШУД'
              : language === 'en'
              ? 'DECISION RECORDED'
              : 'РЕШЕНИЕ ПРИНЯТО'
            : language === 'tj'
            ? 'БАРОИ ҚАБУЛИ ҚАРОР ЗЕР КУНЕД'
            : language === 'en'
            ? 'RECORD DECISION'
            : 'ПРИНЯТЬ РЕШЕНИЕ'}
        </span>
      </div>
    </div>
  );
};
