import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Newspaper,
  Calculator,
} from 'lucide-react';
import {
  CourtNodeData,
  REGIONAL_CLUSTERS,
  getCourtName,
  getCourtAddress,
  getRegionName,
} from '../../data/sudTjData';
import { CourtQrCode } from './CourtQrCode';
import { useLanguage } from '../../context/LanguageContext';

interface CourtDetailsDrawerProps {
  court: CourtNodeData | null;
  onClose: () => void;
  onOpenService?: (serviceTab: string) => void;
}

export const CourtDetailsDrawer: React.FC<CourtDetailsDrawerProps> = ({
  court,
  onClose,
  onOpenService,
}) => {
  const { language, t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && court) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [court, onClose]);

  if (!court) return null;

  const cluster = REGIONAL_CLUSTERS.find((r) => r.id === court.regionId);
  const regionColor = cluster ? cluster.colorHex : '#c5a059';
  const regionName = cluster ? getRegionName(cluster, language) : '';
  const courtName = getCourtName(court, language);
  const courtAddress = getCourtAddress(court, language);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="court-details-title"
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg h-full bg-theme-bgSec border-l border-theme-border p-6 sm:p-8 flex flex-col justify-between overflow-y-auto text-theme-text shadow-2xl animate-in slide-in-from-right duration-300 scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar: Region tag & Close button */}
        <div>
          <div className="flex items-center justify-between border-b border-theme-border pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span
                style={{ backgroundColor: `${regionColor}20`, borderColor: `${regionColor}60`, color: regionColor }}
                className="font-mono text-[10px] px-2.5 py-1 rounded-full border uppercase tracking-wider"
              >
                {regionName}
              </span>
              <span className="font-mono text-[10px] text-theme-textMuted uppercase">
                {court.type === 'military'
                  ? (language === 'en' ? 'Military Court' : language === 'tj' ? 'Суди ҳарбӣ' : 'Военный суд')
                  : (language === 'en' ? 'Judicial Body' : language === 'tj' ? 'Мақоми судӣ' : 'Судебный орган')}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t('nav.close')}
              className="p-1.5 rounded-lg text-theme-textMuted hover:text-theme-text hover:bg-theme-surface transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-theme-gold"
            >
              <X size={18} />
            </button>
          </div>

          {/* Court Official Title */}
          <h3
            id="court-details-title"
            className="text-lg sm:text-xl font-medium tracking-tight text-theme-text uppercase leading-snug mb-2"
          >
            {courtName}
          </h3>

          <div className="flex items-center gap-3 font-mono text-xs text-theme-textMuted mb-6">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('network.drawerSystemActive')}</span>
            </span>
            <span>•</span>
            <span className="text-theme-gold">{court.domain}</span>
          </div>

          {/* Direct Portal Link CTA */}
          <a
            href={court.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-4 rounded-xl border border-theme-border bg-theme-surface hover:border-theme-borderHover transition-all group mb-6 shadow-sm"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-theme-textMuted uppercase tracking-wider">
                {t('network.drawerSubdomain')}
              </span>
              <span className="text-sm font-mono font-medium text-theme-text group-hover:text-theme-gold transition-colors">
                {court.url}
              </span>
            </div>
            <ExternalLink
              size={16}
              className="text-theme-textMuted group-hover:text-theme-gold group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
            />
          </a>

          {/* Institutional Contact Grid */}
          <div className="space-y-3 mb-6 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-theme-surface border border-theme-border flex items-start gap-3 shadow-xs">
              <MapPin size={16} className="text-theme-gold shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-theme-textMuted uppercase block">
                  {t('network.drawerAddress')}
                </span>
                <span className="text-theme-textSec leading-relaxed block mt-0.5 font-sans text-xs">
                  {courtAddress}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-theme-surface border border-theme-border flex items-start gap-2.5 shadow-xs">
                <Phone size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-theme-textMuted uppercase block">
                    {t('network.drawerRegistry')}
                  </span>
                  <span className="text-theme-text font-medium">{court.phone}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-theme-surface border border-theme-border flex items-start gap-2.5 shadow-xs">
                <Mail size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-theme-textMuted uppercase block">
                    {t('network.drawerEmail')}
                  </span>
                  <span className="text-theme-text truncate block max-w-[140px]">{court.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Official site link (QR verification arrives with the verification backend) */}
          <div className="p-4 rounded-xl bg-theme-surface border border-theme-border flex items-center gap-4 mb-6 shadow-xs">
            <div className="shrink-0">
              <CourtQrCode value={court.url} size={64} />
            </div>
            <div>
              <span className="font-mono text-xs font-semibold text-theme-text uppercase block">
                {language === 'en'
                  ? 'OFFICIAL WEBSITE'
                  : language === 'tj'
                  ? 'СОМОНАИ РАСМӢ'
                  : 'ОФИЦИАЛЬНЫЙ САЙТ'}
              </span>
              <p className="text-[11px] text-theme-textSec font-sans mt-0.5 leading-snug">
                {language === 'en'
                  ? 'Direct link to the official court website.'
                  : language === 'tj'
                  ? 'Пайванди мустақим ба сомонаи расмии суд.'
                  : 'Прямая ссылка на официальный сайт суда.'}
              </p>
            </div>
          </div>

          {/* Latest News / Announcements for this court */}
          {(court.latestNewsRu || court.latestNewsTj) && (
            <div className="p-4 rounded-xl bg-theme-surface border border-theme-border mb-6 shadow-xs">
              <div className="flex items-center gap-2 font-mono text-[10px] text-theme-gold uppercase tracking-wider mb-2">
                <Newspaper size={12} />
                <span>{t('network.drawerLatestNews')}</span>
              </div>
              <p className="text-xs text-theme-text font-medium leading-snug">
                {language === 'tj' ? court.latestNewsTj : court.latestNewsRu}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Fast Action Buttons */}
        <div className="pt-4 border-t border-theme-border space-y-2">
          <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenService?.('esud');
              }}
              className="p-2.5 rounded-lg bg-theme-surface border border-theme-border hover:border-theme-gold hover:text-theme-text flex flex-col items-center justify-center gap-1 transition-all text-theme-textSec"
            >
              <Send size={14} className="text-theme-gold" />
              <span>{t('network.drawerSubmitAppeal')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenService?.('hearings');
              }}
              className="p-2.5 rounded-lg bg-theme-surface border border-theme-border hover:border-cyan-400 hover:text-theme-text flex flex-col items-center justify-center gap-1 transition-all text-theme-textSec"
            >
              <Clock size={14} className="text-cyan-400" />
              <span>{t('network.drawerHearings')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenService?.('duties');
              }}
              className="p-2.5 rounded-lg bg-theme-surface border border-theme-border hover:border-emerald-400 hover:text-theme-text flex flex-col items-center justify-center gap-1 transition-all text-theme-textSec"
            >
              <Calculator size={14} className="text-emerald-400" />
              <span>{t('network.drawerStateDuty')}</span>
            </button>
          </div>

          <a
            href={court.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-full bg-theme-gold text-black font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 hover:shadow-theme-glow transition-all"
          >
            <span>{t('network.drawerVisitPortal')}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
