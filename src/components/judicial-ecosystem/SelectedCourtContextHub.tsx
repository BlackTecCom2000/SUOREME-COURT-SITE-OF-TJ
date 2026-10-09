import React, { useState } from 'react';
import {
  CourtNodeData,
  REGIONAL_CLUSTERS,
  getCourtName,
  getCourtAddress,
  getRegionName,
} from '../../data/sudTjData';
import { useLanguage } from '../../context/LanguageContext';
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
        relative w-full glass glass-panel p-5 sm:p-7 transition-all duration-300 animate-fadeIn select-none text-left
      `}
    >
      {/* 1. TOP BREADCRUMB TRAIL & CLOSE BUTTON */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-theme-border">
        <div className="flex items-center gap-2 font-mono text-xs text-theme-textMuted flex-wrap">
          <span className="text-theme-gold font-semibold">
            {language === 'tj' ? 'Судҳои ҶТ' : language === 'en' ? 'Courts of RT' : 'Суды Республики'}
          </span>
          <ChevronRight size={13} className="text-theme-textMuted" />
          <span style={{ color: regionColor }} className="font-bold uppercase">
            {regionName}
          </span>
          <ChevronRight size={13} className="text-theme-textMuted" />
          <span className="text-theme-text font-semibold truncate max-w-xs">{courtName}</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть карточку суда"
          className="p-1.5 rounded-lg text-theme-textMuted hover:text-theme-text hover:bg-theme-bg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. COURT TITLE, STATUS & METRICS ROW */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span
              className="font-mono text-2xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${regionColor}18`,
                borderColor: `${regionColor}60`,
                color: regionColor,
              }}
            >
              {typeLabel}
            </span>

            <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-500 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ОНЛАЙН (100% ДОСТУПЕН)</span>
            </span>

            <span className="font-mono text-[11px] text-theme-textMuted">
              ID: <strong className="text-theme-text">{court.id}</strong>
            </span>
          </div>

          <h3 className="font-serif font-bold text-xl sm:text-2xl text-theme-text tracking-wide leading-snug">
            {courtName}
          </h3>
        </div>

        {/* Official Court Website Button & QR Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="p-2.5 rounded-xl border border-theme-border bg-theme-bg/80 text-theme-textSec hover:text-theme-gold hover:border-theme-gold/50 transition-all font-mono text-xs flex items-center gap-1.5"
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
        <div className="mb-6 p-4 rounded-xl border border-theme-gold/40 bg-theme-bg/90 flex flex-col sm:flex-row items-center gap-4 animate-fadeIn">
          <div className="shrink-0">
            <CourtQrCode value={portalUrl} size={84} />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-theme-gold uppercase tracking-wider block">
              Официальный сайт суда
            </span>
            <p className="font-sans text-xs text-theme-textSec mt-1 leading-relaxed">
              Прямая ссылка на защищенный веб-портал {court.domain}. QR-проверка документов появится вместе с backend верификации.
            </p>
            <span className="font-mono text-[11px] text-theme-textMuted mt-1 block">{portalUrl}</span>
          </div>
        </div>
      )}

      {/* 4. CONTACTS & DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 font-mono text-xs">
        <div className="p-3 rounded-xl border glass-nest flex items-start gap-2.5">
          <MapPin size={16} className="text-theme-gold shrink-0 mt-0.5" />
          <div className="overflow-hidden">
            <span className="text-2xs text-theme-textMuted uppercase block">Адрес канцелярии</span>
            <span className="text-theme-text font-sans text-xs font-medium block truncate mt-0.5">
              {courtAddress || 'г. Душанбе, Республика Таджикистан'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl border glass-nest flex items-start gap-2.5">
          <Phone size={16} className="text-cyan-500 shrink-0 mt-0.5" />
          <div className="overflow-hidden">
            <span className="text-2xs text-theme-textMuted uppercase block">Телефон приёмной</span>
            <span className="text-theme-text font-medium block truncate mt-0.5">
              {court.phone || '+992 (37) 221-00-00'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl border glass-nest flex items-start gap-2.5">
          <Mail size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <div className="overflow-hidden">
            <span className="text-2xs text-theme-textMuted uppercase block">Электронная почта</span>
            <span className="text-theme-text font-medium block truncate mt-0.5">
              {court.email || `info@${court.domain || 'sud.tj'}`}
            </span>
          </div>
        </div>
      </div>

      {/* 5. LATEST COURT NEWS / PUBLICATION IF AVAILABLE */}
      {(court.latestNewsRu || court.latestNewsTj) && (
        <div className="p-4 rounded-xl border border-theme-border bg-theme-bg/70 mb-6 flex items-start gap-3">
          <Newspaper size={18} className="text-theme-gold shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-2xs font-mono text-theme-gold uppercase tracking-wider mb-1">
              <span>Последняя публикация суда</span>
              <span className="text-theme-textMuted">Сегодня</span>
            </div>
            <p className="font-serif font-semibold text-sm text-theme-text leading-snug">
              {language === 'tj' ? court.latestNewsTj : court.latestNewsRu}
            </p>
          </div>
        </div>
      )}

      {/* 6. AVAILABLE PUBLIC DIGITAL SERVICES HUB (1-CLICK DIRECT LAUNCHERS) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={15} className="text-theme-gold" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-theme-textSec">
            Электронные сервисы для данного суда
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => onOpenService?.('acts', court)}
            className="p-3 rounded-xl border border-theme-border bg-theme-bg/80 hover:border-theme-gold hover:bg-theme-surfaceHover transition-all flex flex-col items-center text-center gap-1.5 text-theme-text group"
          >
            <Gavel size={18} className="text-theme-gold group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Судебные акты</span>
            <span className="text-2xs text-theme-textMuted">Банк решений</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenService?.('esud', court)}
            className="p-3 rounded-xl border border-theme-border bg-theme-bg/80 hover:border-sky-400 hover:bg-theme-surfaceHover transition-all flex flex-col items-center text-center gap-1.5 text-theme-text group"
          >
            <Laptop size={18} className="text-sky-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Электронный суд</span>
            <span className="text-2xs text-theme-textMuted">Подача документов</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenService?.('appeals', court)}
            className="p-3 rounded-xl border border-theme-border bg-theme-bg/80 hover:border-emerald-400 hover:bg-theme-surfaceHover transition-all flex flex-col items-center text-center gap-1.5 text-theme-text group"
          >
            <Send size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Обращение</span>
            <span className="text-2xs text-theme-textMuted">Приемная граждан</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenService?.('duties', court)}
            className="p-3 rounded-xl border border-theme-border bg-theme-bg/80 hover:border-violet-400 hover:bg-theme-surfaceHover transition-all flex flex-col items-center text-center gap-1.5 text-theme-text group"
          >
            <Calculator size={18} className="text-violet-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Госпошлина</span>
            <span className="text-2xs text-theme-textMuted">Калькулятор тарифов</span>
          </button>
        </div>
      </div>
    </div>
  );
};
