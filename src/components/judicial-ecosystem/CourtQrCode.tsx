import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface CourtQrCodeProps {
  url?: string;
  value?: string;
  domain?: string;
  size?: number;
  className?: string;
}

// Honest official-link tile (NOT a scannable QR matrix).
// There is no QR encoder/verification backend in the bundle, so rendering a
// pseudo-random "realistic QR matrix" would deceive users scanning it.
// Real QR verification arrives with the document-verification backend;
// until then this tile links directly and is labeled accordingly.
export const CourtQrCode: React.FC<CourtQrCodeProps> = ({
  url,
  value,
  size = 120,
  className = '',
}) => {
  const { language } = useLanguage();
  const targetUrl = url || value || 'http://sud.tj';
  let host = targetUrl;
  try {
    host = new URL(targetUrl).hostname;
  } catch {
    /* keep raw value */
  }
  const soon =
    language === 'tj' ? 'QR ба наздикӣ' : language === 'en' ? 'QR soon' : 'QR скоро';
  const open =
    language === 'tj' ? 'Кушодан' : language === 'en' ? 'Open' : 'Открыть';
  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={host}
      className={`inline-flex flex-col items-center justify-center gap-1 p-2 glass glass-chip text-theme-text transition-colors ${className}`}
      style={{ width: size + 16, minHeight: size + 16 }}
    >
      <Globe size={Math.max(20, Math.round(size / 3))} aria-hidden="true" />
      <span className="font-mono text-[10px] leading-tight break-all text-center px-1">{host}</span>
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-theme-gold">
        <ExternalLink size={11} aria-hidden="true" />
        {open}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-wider text-theme-textMuted">{soon}</span>
    </a>
  );
};
