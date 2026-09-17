import React, { useState } from 'react';
import { ExternalLink, Scale, BookOpen } from 'lucide-react';
import { Reveal } from '../Reveal';
import { useLanguage } from '../../context/LanguageContext';
import { SHARED_LEGISLATION } from '../../sites/shared';
import { pickTri } from '../../sites/types';
import type { TriText } from '../../sites/types';
import { coverFaceStyle, coverEmblem, coverTitle, COVER_EMBLEMS } from './LawBookshelf';
import './LegislativeLibrary.css';

const SHOWCASE_BOOKS = SHARED_LEGISLATION.slice(0, 3);

export interface ShowcaseBook {
  url: string | null;
  title: TriText;
  coverText?: string | null;
  coverEmblem?: string | null;
  coverBg?: string | null;
  coverImage?: string | null;
  cover?: number;
  kind?: string;
}

const COVER_THEMES = [
  'linear-gradient(160deg, #17233d 0%, #0b1322 72%)',
  'linear-gradient(160deg, #143c39 0%, #0a2221 72%)',
  'linear-gradient(160deg, #2b2344 0%, #141029 72%)',
];

export const InteractiveLawBook: React.FC<{ books?: ShowcaseBook[] }> = ({ books }) => {
  const { language, t } = useLanguage();
  const showcase = ((books && books.length > 0 ? books : SHOWCASE_BOOKS).filter((b) => !!b.url) as { url: string; title: TriText }[]).slice(0, 3);
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const [flipUrl, setFlipUrl] = useState<string | null>(null);
  const [pageIdx, setPageIdx] = useState<Record<string, number>>({});

  const L = (tj: string, ru: string, en: string) =>
    language === 'tj' ? tj : language === 'en' ? en : ru;

  const toggleInside = (url: string) => {
    setFlipUrl(null);
    setOpenUrl((cur) => (cur === url ? null : url));
    setPageIdx((p) => ({ ...p, [url]: 0 }));
  };

  const toggleFlip = (url: string) => {
    setOpenUrl(null);
    setFlipUrl((cur) => (cur === url ? null : url));
  };

  const setPage = (url: string, i: number) =>
    setPageIdx((p) => ({ ...p, [url]: i }));

  return (
    <Reveal delay={100}>
      <div className="relative overflow-hidden rounded-2xl border border-theme-border bg-theme-bg p-6 shadow-theme-card">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={14} className="text-theme-gold" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-theme-gold">
            {t('leglib.featuredBadge')}
          </span>
        </div>

        <div className="py-2">
          {/* 3D book showcase (Codrops pattern, site design) */}
          <div className="bk-showcase">
            {showcase.map((b, bi) => {
              const title = pickTri(b.title, language);
              const isOpen = openUrl === b.url;
              const isFlipped = flipUrl === b.url;
              const page = pageIdx[b.url] || 0;
              return (
                <div
                  key={b.url}
                  className="bk-cell"
                  style={{ zIndex: isOpen || isFlipped ? 10 : 1 }}
                >
                  <div className="bk-stage">
                    <div
                      className={
                        'bk-book' +
                        (isOpen ? ' bk-viewinside' : '') +
                        (isFlipped ? ' bk-viewback' : '') +
                        (!isOpen && !isFlipped ? ' bk-bookdefault' : '')
                      }
                    >
                      <div className="bk-front">
                        <div className="bk-cover-back" />
                        <div className={'bk-cover' + (b.coverImage ? ' has-custom' : '')} style={coverFaceStyle(b as any, bi)}>
                          <span className="bk-emblem">
                            {(() => {
                              const ek = coverEmblem(b as any);
                              const EI = ek ? COVER_EMBLEMS[ek] : null;
                              return EI ? <EI size={26} /> : null;
                            })()}
                          </span>
                          <h2>
                            <span>{L('Санади меъёрӣ', 'Нормативный акт', 'Statute')}</span>
                            <span>{coverTitle(b as any, language)}</span>
                          </h2>
                          <span className="bk-cover-foot">SUD.TJ • PDF</span>
                        </div>
                      </div>
                      <div className="bk-page" style={{ display: isOpen ? 'block' : 'none' }}>
                        <div className={'bk-content' + (page === 0 ? ' bk-content-current' : '')}>
                          <div className="bk-meta">
                            <div>
                              <span>{L('Формат', 'Формат', 'Format')}</span>
                              <span>PDF</span>
                            </div>
                            <div>
                              <span>{L('Манбаъ', 'Источник', 'Source')}</span>
                              <span>sud.tj</span>
                            </div>
                            <div>
                              <span>{L('Забонҳо', 'Языки', 'Languages')}</span>
                              <span>TJ · RU · EN</span>
                            </div>
                          </div>
                          <a className="bk-openbtn" href={b.url} target="_blank" rel="noreferrer">
                            <span>{t('leglib.openDoc')}</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                        <div className={'bk-content' + (page === 1 ? ' bk-content-current' : '')}>
                          <p>{t('leglib.description')}</p>
                          <a className="bk-openbtn" href={b.url} target="_blank" rel="noreferrer">
                            <span>{t('leglib.openDoc')}</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                        <nav className="bk-pagenav" aria-label="pages">
                          <button
                            type="button"
                            onClick={() => setPage(b.url, 0)}
                            className={page === 0 ? 'bk-dot-current' : ''}
                            aria-label="1"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={() => setPage(b.url, 1)}
                            className={page === 1 ? 'bk-dot-current' : ''}
                            aria-label="2"
                          >
                            ›
                          </button>
                        </nav>
                      </div>
                      <div className="bk-back">
                        <span className="bk-emblem bk-emblem-sm">
                          <Scale size={20} />
                        </span>
                        <h2>{title}</h2>
                        <a className="bk-openbtn light" href={b.url} target="_blank" rel="noreferrer">
                          <span>{t('leglib.openDoc')}</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <div className="bk-right" />
                      <div className="bk-left" style={{ background: COVER_THEMES[(bi + 1) % COVER_THEMES.length] }}>
                        <h2>
                          <span>{title}</span>
                        </h2>
                      </div>
                      <div className="bk-top" />
                      <div className="bk-bottom" />
                    </div>
                  </div>
                  <div className="bk-info">
                    <div className="bk-actions">
                      <button
                        type="button"
                        onClick={() => toggleFlip(b.url)}
                        className={isFlipped ? 'bk-active' : ''}
                        aria-pressed={isFlipped}
                      >
                        {t('leglib.flipBook')}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleInside(b.url)}
                        className={isOpen ? 'bk-active' : ''}
                        aria-pressed={isOpen}
                      >
                        {t('leglib.viewInside')}
                      </button>
                    </div>
                    <h3>
                      <span>{L('Санади меъёрӣ', 'Нормативный акт', 'Statute')}</span>
                      <span>{title}</span>
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* actions live on each book above */}
        </div>
      </div>
    </Reveal>
  );
};

export default InteractiveLawBook;
