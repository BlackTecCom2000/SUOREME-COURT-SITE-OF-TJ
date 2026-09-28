import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Landmark,
  Send,
  Gavel,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  X,
} from 'lucide-react';
import { NationalEmblem } from './NationalEmblem';

interface SupremeCourtContextHubProps {
  onClose: () => void;
  onOpenService?: (serviceKey: string) => void;
}

export const SupremeCourtContextHub: React.FC<SupremeCourtContextHubProps> = ({
  onClose,
  onOpenService,
}) => {
  const { language } = useLanguage();

  return (
    <div
      className={`
        relative w-full glass glass-panel p-5 sm:p-7 transition-all duration-300 animate-fadeIn select-none text-left
      `}
    >
      {/* 1. Header & Close */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-theme-border">
        <div className="flex items-center gap-2 font-mono text-xs text-theme-textMuted">
          <span className="text-theme-gold font-semibold">
            {language === 'tj' ? 'Мақомоти олии судӣ' : language === 'en' ? 'Supreme Judicial Body' : 'Высший судебный орган'}
          </span>
          <ChevronRight size={13} className="text-theme-textMuted" />
          <span className="text-theme-text font-bold uppercase">СУДИ ОЛИИ ҶУМҲУРИИ ТОҶИКИСТОН</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть карточку"
          className="p-1.5 rounded-lg text-theme-textMuted hover:text-theme-text hover:bg-theme-bg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. Brand & Title Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-2xl border border-theme-gold/40 bg-theme-bg shadow-md shrink-0">
            <NationalEmblem size={44} />
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold text-theme-gold uppercase tracking-widest block">
              КОНСТИТУЦИОННЫЙ ОРГАН СУДЕБНОЙ ВЛАСТИ
            </span>
            <h3 className="font-serif font-bold text-2xl text-theme-text tracking-wide leading-tight">
              {language === 'tj'
                ? 'Суди Олии Ҷумҳурии Тоҷикистон'
                : language === 'en'
                ? 'Supreme Court of the Republic of Tajikistan'
                : 'Верховный Суд Республики Таджикистан'}
            </h3>
          </div>
        </div>

        <a
          href="https://sud.tj"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ca8a04] to-[#eab308] text-slate-950 font-sans font-bold text-xs hover:brightness-110 active:scale-[0.98] shadow-md shadow-amber-500/20 transition-all shrink-0"
        >
          <span>sud.tj (Портал)</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* 3. Address & Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 font-mono text-xs">
        <div className="p-3 rounded-xl border border-theme-border bg-theme-bg/60 flex items-start gap-2.5">
          <MapPin size={16} className="text-theme-gold shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-theme-textMuted uppercase block">Адрес здания</span>
            <span className="text-theme-text font-sans text-xs font-medium block mt-0.5">
              г. Душанбе, ул. Шевченко, 55
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-theme-border bg-theme-bg/60 flex items-start gap-2.5">
          <Phone size={16} className="text-cyan-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-theme-textMuted uppercase block">Горячая линия</span>
            <span className="text-theme-text font-medium block mt-0.5">+992 (37) 221-14-14</span>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-theme-border bg-theme-bg/60 flex items-start gap-2.5">
          <Mail size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-theme-textMuted uppercase block">Канцелярия</span>
            <span className="text-theme-text font-medium block mt-0.5">info@sud.tj</span>
          </div>
        </div>
      </div>

      {/* 4. Collegiums & Fast Launchers */}
      <div>
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-theme-textSec block mb-3">
          Центральные сервисы Верховного суда:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => onOpenService?.('appeals')}
            className="p-3.5 rounded-xl border border-theme-gold/40 bg-theme-gold/15 hover:bg-theme-gold/25 text-theme-gold transition-all flex flex-col items-center text-center gap-1.5 group font-bold"
          >
            <Send size={18} className="text-theme-gold group-hover:scale-110 transition-transform" />
            <span>Интернет-приёмная</span>
            <span className="text-[10px] text-theme-textMuted font-normal">Подача электронных обращений</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenService?.('acts')}
            className="p-3.5 rounded-xl border border-theme-border bg-theme-bg/80 hover:border-sky-400 hover:bg-theme-surfaceHover text-theme-text transition-all flex flex-col items-center text-center gap-1.5 group"
          >
            <Gavel size={18} className="text-sky-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Постановления Пленума</span>
            <span className="text-[10px] text-theme-textMuted">Банк судебных актов</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenService?.('hearings')}
            className="p-3.5 rounded-xl border border-theme-border bg-theme-bg/80 hover:border-emerald-400 hover:bg-theme-surfaceHover text-theme-text transition-all flex flex-col items-center text-center gap-1.5 group"
          >
            <Clock size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">График приёма</span>
            <span className="text-[10px] text-theme-textMuted">Часы приёма граждан</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenService?.('esud')}
            className="p-3.5 rounded-xl border border-theme-border bg-theme-bg/80 hover:border-violet-400 hover:bg-theme-surfaceHover text-theme-text transition-all flex flex-col items-center text-center gap-1.5 group"
          >
            <Landmark size={18} className="text-violet-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Структура и коллегии</span>
            <span className="text-[10px] text-theme-textMuted">Судебные составы</span>
          </button>
        </div>
      </div>
    </div>
  );
};
