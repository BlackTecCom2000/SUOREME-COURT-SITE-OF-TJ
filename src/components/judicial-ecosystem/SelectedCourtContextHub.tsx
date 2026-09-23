import React, { useState } from 'react';
import {
  CourtNodeData,
  REGIONAL_CLUSTERS,
  getCourtName,
  getCourtAddress,
  getRegionName,
} from '../../data/sudTjData';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { CourtQrCode } from './CourtQrCode';
import {
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Send,
  Gavel,
  Calculator,
  Laptop,
  CheckCircle2,
  QrCode,
  Newspaper,
  ChevronRight,
  X,
} from 'lucide-react';

interface SelectedCourtContextHubProps {
  court: CourtNodeData;
  onClose: () => void;
  onOpenService?: (serviceKey: string, courtContext?: CourtNodeData) => void;
}

export const SelectedCourtContextHub: React.FC<SelectedCourtContextHubProps> = ({
  court,
  onClose,
  onOpenService,
}) => {
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const [showQr, setShowQr] = useState(false);

  const cluster = REGIONAL_CLUSTERS.find((r) => r.id === court.regionId);
  const regionColor = cluster ? cluster.colorHex : '#dfbe7e';
  const regionName = cluster ? getRegionName(cluster, language) : '';
  const courtName = getCourtName(court, language);
  const courtAddress = getCourtAddress(court, language);

  const typeLabel =
    court.type === 'regional'
      ? language === 'tj'
        ? 'Суди вилоятӣ'
        : language === 'en'
        ? 'Regional Court'
        : 'Областной суд'
      : court.type === 'city'
      ? language === 'tj'
        ? 'Суди шаҳрӣ'
        : language === 'en'
        ? 'City Court'
        : 'Городской суд'
      : court.type === 'military'
      ? language === 'tj'
        ? 'Суди ҳарбӣ'
        : language === 'en'
        ? 'Military Garrison Court'
        : 'Военный суд гарнизона'
      : language === 'tj'
      ? 'Суди ноҳиявӣ'
      : language === 'en'
      ? 'District Court'
      : 'Районный суд';

  const portalUrl = court.url || (court.domain ? `https://${court.domain}` : 'https://sud.tj');

  return (
    <div
      className={`
        relative w-full rounded-2xl border p-5 sm:p-7 shadow-2xl transition-all duration-300 animate-fadeIn select-none text-left
        ${
          isDark
            ? 'bg-[#070d1a]/95 border-amber-400/40 shadow-black/80'
            : 'bg-white/95 border-slate-300 shadow-slate-300/40'
        }
      `}
    >
      {/* 1. TOP BREADCRUMB TRAIL & CLOSE BUTTON */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 flex-wrap">
          <span className="text-amber-400 font-semibold">
            {language === 'tj' ? 'Судҳои ҶТ' : language === 'en' ? 'Courts of RT' : 'Суды Республики'}
          </span>
          <ChevronRight size={13} className="text-slate-500" />
          <span style={{ color: regionColor }} className="font-bold uppercase">
            {regionName}
          </span>
          <ChevronRight size={13} className="text-slate-500" />
          <span className="text-white font-semibold truncate max-w-xs">{courtName}</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть карточку суда"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. COURT TITLE, STATUS & METRICS ROW */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span
              className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${regionColor}18`,
                borderColor: `${regionColor}60`,
                color: regionColor,
              }}
            >
              {typeLabel}
            </span>

            <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ОНЛАЙН (100% ДОСТУПЕН)</span>
            </span>

            <span className="font-mono text-[11px] text-slate-400">
              ID: <strong className="text-slate-200">{court.id}</strong>
            </span>
          </div>

          <h3 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-wide leading-snug">
            {courtName}
          </h3>
        </div>

        {/* Official Court Website Button & QR Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-amber-400 hover:border-amber-400/50 transition-all font-mono text-xs flex items-center gap-1.5"
            title={
              language === 'tj'
                ? 'Пайванди сомонаи расмии суд'
                : language === 'en'
                ? 'Official court website link'
                : 'Ссылка на официальный сайт суда'
            }
          >
            <QrCode size={16} />
            <span className="hidden sm:inline">QR</span>
          </button>

          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ca8a04] to-[#eab308] text-slate-950 font-sans font-bold text-xs hover:brightness-110 active:scale-[0.98] shadow-md shadow-amber-500/20 transition-all"
          >
            <span>{court.domain || 'sud.tj'}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* 3. Official site link panel (real QR arrives with the verification backend) */}
      {showQr && (
        <div className="mb-6 p-4 rounded-xl border border-amber-400/40 bg-slate-950 flex flex-col sm:flex-row items-center gap-4 animate-fadeIn">
          <div className="shrink-0">
            <CourtQrCode value={portalUrl} size={84} />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Официальный сайт суда
            </span>
            <p className="font-sans text-xs text-slate-300 mt-1 leading-relaxed">
              Прямая ссылка на защищенный веб-портал {court.domain}. QR-проверка документов появится вместе с backend верификации.
            </p>
            <span className="font-mono text-[11px] text-slate-400 mt-1 block">{portalUrl}</span>
          </div>
        </div>
      )}

      {/* 4. CONTACTS & DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 font-mono text-xs">
        <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-2.5">
          <MapPin size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="overflow-hidden">
            <span className="text-[10px] text-slate-400 uppercase block">Адрес канцелярии</span>
            <span className="text-slate-200 font-sans text-xs font-medium block truncate mt-0.5">
              {courtAddress || 'г. Душанбе, Республика Таджикистан'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-2.5">
          <Phone size={16} className="text-cyan-400 shrink-0 mt-0.5" />
          <div className="overflow-hidden">
            <span className="text-[10px] text-slate-400 uppercase block">Телефон приёмной</span>
            <span className="text-slate-200 font-medium block truncate mt-0.5">
              {court.phone || '+992 (37) 221-00-00'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-2.5">
          <Mail size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="overflow-hidden">
            <span className="text-[10px] text-slate-400 uppercase block">Электронная почта</span>
            <span className="text-slate-200 font-medium block truncate mt-0.5">
              {court.email || `info@${court.domain || 'sud.tj'}`}
            </span>
          </div>
        </div>
      </div>

      {/* 5. LATEST COURT NEWS / PUBLICATION IF AVAILABLE */}
      {(court.latestNewsRu || court.latestNewsTj) && (
        <div className="p-4 rounded-xl border border-slate-800 bg-[#091124] mb-6 flex items-start gap-3">
          <Newspaper size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-1">
              <span>Последняя публикация суда</span>
              <span className="text-slate-400">Сегодня</span>
            </div>
            <p className="font-serif font-semibold text-sm text-slate-100 leading-snug">
              {language === 'tj' ? court.latestNewsTj : court.latestNewsRu}
            </p>
          </div>
        </div>
      )}

      {/* 6. AVAILABLE PUBLIC DIGITAL SERVICES HUB (1-CLICK DIRECT LAUNCHERS) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={15} className="text-amber-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
            Электронные сервисы для данного суда
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => onOpenService?.('acts', court)}
            className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-amber-400/60 hover:bg-[#0c1527] transition-all flex flex-col items-center text-center gap-1.5 text-slate-200 group"
          >
            <Gavel size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Судебные акты</span>
            <span className="text-[10px] text-slate-400">Банк решений</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenService?.('esud', court)}
            className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-sky-400/60 hover:bg-[#0c1527] transition-all flex flex-col items-center text-center gap-1.5 text-slate-200 group"
          >
            <Laptop size={18} className="text-sky-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Электронный суд</span>
            <span className="text-[10px] text-slate-400">Подача документов</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenService?.('appeals', court)}
            className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-emerald-400/60 hover:bg-[#0c1527] transition-all flex flex-col items-center text-center gap-1.5 text-slate-200 group"
          >
            <Send size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Обращение</span>
            <span className="text-[10px] text-slate-400">Приемная граждан</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenService?.('duties', court)}
            className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-violet-400/60 hover:bg-[#0c1527] transition-all flex flex-col items-center text-center gap-1.5 text-slate-200 group"
          >
            <Calculator size={18} className="text-violet-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Госпошлина</span>
            <span className="text-[10px] text-slate-400">Калькулятор тарифов</span>
          </button>
        </div>
      </div>
    </div>
  );
};
