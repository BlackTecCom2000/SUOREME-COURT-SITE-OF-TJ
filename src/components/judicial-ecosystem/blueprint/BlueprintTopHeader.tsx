import React from 'react';
import { NationalEmblem } from '../NationalEmblem';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

export const BlueprintTopHeader: React.FC = () => {
  const { language } = useLanguage();
  const { isDark } = useTheme();

  const titleLine1 =
    language === 'tj'
      ? 'ҲОКИМИЯТИ СУДИИ'
      : language === 'en'
      ? 'JUDICIAL POWER OF'
      : 'СУДЕБНАЯ ВЛАСТЬ';

  const titleLine2 =
    language === 'tj'
      ? 'ҶУМҲУРИИ ТОҶИКИСТОН'
      : language === 'en'
      ? 'THE REPUBLIC OF TAJIKISTAN'
      : 'РЕСПУБЛИКИ ТАДЖИКИСТАН';

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          relative w-full max-w-[780px] h-[68px] rounded-xl px-6
          flex items-center justify-center gap-5 border transition-all duration-700
          backdrop-blur-xl select-none
          ${
            isDark
            ? 'border-[#dfbe7e]/80 bg-[#060a14]/80 shadow-[0_0_25px_rgba(223,190,126,0.25)]'
            : 'border-[#ca8a04]/80 bg-[var(--glass-surface-strong)] shadow-[0_4px_20px_rgba(202,138,4,0.2)]'
          }
        `}
        style={{
          boxShadow: isDark
            ? '0 0 30px rgba(223, 190, 126, 0.2), inset 0 0 15px rgba(223, 190, 126, 0.1)'
            : '0 4px 20px rgba(202, 138, 4, 0.15), inset 0 0 10px rgba(202, 138, 4, 0.05)',
        }}
      >
        {/* Inner Gold Frame Border */}
        <div
          className={`absolute inset-[3px] rounded-lg border pointer-events-none ${
            isDark ? 'border-[#dfbe7e]/30' : 'border-[#ca8a04]/25'
          }`}
        />

        {/* National Emblem */}
        <div className="shrink-0 flex items-center justify-center drop-shadow-[0_0_12px_rgba(223,190,126,0.5)]">
          <NationalEmblem size={50} />
        </div>

        {/* Banner Title */}
        <div className="flex flex-col items-center justify-center text-center">
          <h1
            className={`font-serif font-bold text-[19px] sm:text-[21px] tracking-[0.14em] leading-none uppercase ${
              isDark
                ? 'text-[#e8c679] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                : 'text-[#854d0e] drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]'
            }`}
          >
            {titleLine1}
          </h1>
          <h2
            className={`font-serif font-bold text-[19px] sm:text-[21px] tracking-[0.14em] leading-none uppercase mt-1 ${
              isDark
                ? 'text-[#e8c679] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                : 'text-[#854d0e] drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]'
            }`}
          >
            {titleLine2}
          </h2>
        </div>
      </div>
    </div>
  );
};
