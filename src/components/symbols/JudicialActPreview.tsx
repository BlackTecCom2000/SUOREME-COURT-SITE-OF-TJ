import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { FileText, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface JudicialActPreviewProps {
  onOpenActs: () => void;
  className?: string;
}

export const JudicialActPreview: React.FC<JudicialActPreviewProps> = ({
  onOpenActs,
  className = '',
}) => {
  const { language, t } = useLanguage();

  return (
    <div
      className={`
        relative rounded-xl p-5 glass glass-chip border-theme-gold/40 select-none
        transition-all duration-500 animate-in fade-in zoom-in-95
        ${className}
      `}
    >
      {/* Inner Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-theme-gold to-transparent" />

      {/* Header Badge */}
      <div className="flex items-center justify-between gap-3 mb-3 border-b border-theme-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-theme-gold/20 text-theme-gold">
            <FileText size={15} />
          </div>
          <div>
            <span className="font-mono text-[9px] text-theme-gold uppercase tracking-widest block font-bold">
              {language === 'tj' ? 'САНАДИ СУДӢ / НАМУНА' : language === 'en' ? 'JUDICIAL ACT / SAMPLE' : 'СУДЕБНЫЙ АКТ / ОБРАЗЕЦ'}
            </span>
            <span className="font-mono text-[11px] text-theme-text font-semibold block">
              № ПР-2026/89-DEMO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
          <CheckCircle2 size={11} />
          <span>{language === 'tj' ? 'ЭЪТИБОР ПАЙДО КАРД' : language === 'en' ? 'IN FORCE' : 'ВСТУПИЛО В СИЛУ'}</span>
        </div>
      </div>

      {/* Act Title in Serif */}
      <h4 className="font-serif font-bold text-sm text-theme-text leading-snug mb-2">
        {language === 'tj'
          ? 'Таъиноти Суди Олии Ҷумҳурии Тоҷикистон оид ба парвандаи маданӣ ва волоияти қонун'
          : language === 'en'
          ? 'Ruling of the Supreme Court of the Republic of Tajikistan on Civil and Constitutional Matters'
          : 'Определение Верховного суда Республики Таджикистан по гражданскому делу и защите прав'}
      </h4>

      <p className="text-xs text-theme-textSec font-serif leading-relaxed mb-4">
        {language === 'tj'
          ? 'Қарори мазкур пас аз баррасии ҳамаҷонибаи далелҳо қабул гардида, дар пойгоҳи ягонаи санадҳои судӣ сабт шуд.'
          : language === 'en'
          ? 'This decision is recorded following comprehensive judicial proceedings and entered into the open acts registry.'
          : 'Решение принято на основе всестороннего анализа доказательств и внесено в открытый реестр судебных актов.'}
      </p>

      {/* CTA Button to Full Database */}
      <button
        type="button"
        onClick={onOpenActs}
        className="btn-primary w-full shadow-md text-xs"
      >
        <span>{t('digitalJustice.ctaActs')}</span>
        <ArrowUpRight size={14} />
      </button>
    </div>
  );
};
