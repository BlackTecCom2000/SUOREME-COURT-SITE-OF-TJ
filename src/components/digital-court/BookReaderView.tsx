import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { pickTri } from '../../sites/types';
import { ShelfBook, COVER_THEMES, coverFor, coverFaceStyle, coverEmblem, coverTitle, COVER_EMBLEMS } from './LawBookshelf';
import '../digital-court/LegislativeLibrary.css';

const PAGE_CHARS = 1400;

function paginate(text: string): string[] {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const pages: string[] = [];
  let cur = '';
  for (const p of paras) {
    if ((cur + '\n\n' + p).length > PAGE_CHARS && cur) {
      pages.push(cur.trim());
      cur = p;
    } else {
      cur = cur ? cur + '\n\n' + p : p;
    }
  }
  if (cur.trim()) pages.push(cur.trim());
  // Fallback: single huge paragraph → hard split
  const out: string[] = [];
  for (const pg of pages) {
    if (pg.length <= PAGE_CHARS * 1.6) {
      out.push(pg);
      continue;
    }
    for (let i = 0; i < pg.length; i += PAGE_CHARS) out.push(pg.slice(i, i + PAGE_CHARS));
  }
  return out.length > 0 ? out : [];
}

function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const fn = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return narrow;
}

interface BookReaderViewProps {
  book: ShelfBook;
  content: string | null | undefined;
  loading: boolean;
}

export const BookReaderView: React.FC<BookReaderViewProps> = ({ book, content, loading }) => {
  const { language, t } = useLanguage();
  const [opened, setOpened] = useState(false);
  const [spread, setSpread] = useState(0);
  const [flip, setFlip] = useState<{ dir: 1 | -1; from: number } | null>(null);
  const narrow = useNarrow();
  const title = pickTri(book.title, language);
  const themeIdx = coverFor(book, 0) % COVER_THEMES.length;

  const pages = useMemo(() => (content ? paginate(content) : []), [content]);

  useEffect(() => {
    setSpread(0);
    setFlip(null);
    setOpened(false);
  }, [book.key, content]);

  const step = narrow ? 1 : 2;
  const maxSpread = narrow
    ? Math.max(pages.length - 1, 0)
    : pages.length % 2 === 0
      ? Math.max(pages.length - 2, 0)
      : pages.length - 1;

  const goSpread = (dir: 1 | -1) => {
    if (flip || loading || pages.length === 0) return;
    const target = Math.min(Math.max(spread + dir * step, 0), maxSpread);
    if (target === spread) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSpread(target);
      return;
    }
    setFlip({ dir, from: spread });
  };

  const onLeafDone = () => {
    if (!flip) return;
    const target = Math.min(Math.max(flip.from + flip.dir * step, 0), maxSpread);
    setSpread(target);
    setFlip(null);
  };

  const L = (tj: string, ru: string, en: string) =>
    language === 'tj' ? tj : language === 'en' ? en : ru;

  const fileUrl = book.url || null;
  const isPdf = !!fileUrl && /\.pdf($|\?|#)/i.test(fileUrl);
  const fileName = fileUrl ? decodeURIComponent(fileUrl.split('/').pop()?.split('?')[0] || fileUrl) : '';

  const renderPageText = (idx: number | null) => {
    if (idx === null || !pages[idx]) return <div className="elib-spread-blank" aria-hidden="true" />;
    return (
      <>
        {pages[idx].split('\n').map((line, i) => (
          <p key={i}>{line || '\u00a0'}</p>
        ))}
      </>
    );
  };

  const leftIdx = narrow ? null : flip ? flip.from : spread;
  const rightIdx = narrow ? (flip ? flip.from : spread) : flip ? flip.from + 1 : spread + 1;
  const leafFrontIdx = flip && flip.dir === 1 ? flip.from + (narrow ? 0 : 1) : flip ? flip.from : null;
  const leafBackIdx =
    flip && flip.dir === 1
      ? Math.min(flip.from + step, maxSpread) + (narrow ? 0 : 1)
      : flip
        ? Math.max(flip.from - step, 0)
        : null;

  const counter = narrow
    ? `${spread + 1} / ${pages.length}`
    : `${spread + 1}${pages[spread + 1] ? `–${spread + 2}` : ''} / ${pages.length}`;

  return (
    <div className="elib-bookview">
      {!opened ? (
        <div className="bk-showcase elib-bookview-stage">
          <div className="bk-cell elib-bookview-cell">
            <div className="bk-stage elib-bookview-bookstage">
              <div className="bk-book bk-bookdefault">
                <div className="bk-front" aria-hidden="true">
                  <div className="bk-cover-back" />
                  <div className={'bk-cover' + (book.coverImage ? ' has-custom' : '')} style={coverFaceStyle(book, 0)}>
                    <span className="bk-emblem">
                      {(() => {
                        const ek = coverEmblem(book);
                        const EI = ek ? COVER_EMBLEMS[ek] : null;
                        return EI ? <EI size={24} /> : null;
                      })()}
                    </span>
                    <h2>
                      <span>{L('Санади меъёрӣ', 'Нормативный акт', 'Statute')}</span>
                      <span>{coverTitle(book, language)}</span>
                    </h2>
                    <span className="bk-cover-foot">SUD.TJ</span>
                  </div>
                </div>
                <div className="bk-back" aria-hidden="true">
                  <span className="bk-emblem bk-emblem-sm">
                    <BookOpen size={20} />
                  </span>
                  <h2>{title}</h2>
                </div>
                <div className="bk-right" aria-hidden="true" />
                <div className="bk-left" style={{ background: COVER_THEMES[(themeIdx + 1) % COVER_THEMES.length] }} aria-hidden="true">
                  <h2>
                    <span>{title}</span>
                  </h2>
                </div>
                <div className="bk-top" aria-hidden="true" />
                <div className="bk-bottom" aria-hidden="true" />
              </div>
              {!loading && (
                <button
                  type="button"
                  onClick={() => setOpened(true)}
                  className="elib-bookview-openbtn"
                >
                  <BookOpen size={18} aria-hidden="true" />
                  <span>{L('Китобро кушоед', 'Открыть книгу', 'Open the book')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="elib-spreadwrap">
          {loading ? (
            <div className="elib-spread-loading">
              <Loader2 size={24} className="spin" />
              <span>{L('Матн бор мешавад...', 'Загрузка текста...', 'Loading text...')}</span>
            </div>
          ) : pages.length > 0 ? (
            <div className={'elib-spread' + (narrow ? ' is-narrow' : '')}>
              {!narrow && (
                <div className="elib-spread-page left">
                  <div className="elib-spread-text">{renderPageText(leftIdx)}</div>
                  <div className="elib-spread-folio">{leftIdx !== null && pages[leftIdx] ? leftIdx + 1 : ''}</div>
                </div>
              )}
              <div className="elib-spread-gutter" aria-hidden="true" />
              <div className="elib-spread-page right">
                <div className="elib-spread-text">{renderPageText(rightIdx)}</div>
                <div className="elib-spread-folio">
                  {rightIdx !== null && pages[rightIdx] ? (narrow ? `${rightIdx + 1} / ${pages.length}` : rightIdx + 1) : ''}
                </div>
              </div>
              {flip && (
                <div
                  className={'elib-flip-leaf ' + (flip.dir === 1 ? 'turn-right' : 'turn-left')}
                  onAnimationEnd={onLeafDone}
                >
                  <div className="elib-flip-face front">
                    <div className="elib-spread-text">{renderPageText(leafFrontIdx)}</div>
                  </div>
                  <div className="elib-flip-face back">
                    <div className="elib-spread-text">{renderPageText(leafBackIdx)}</div>
                  </div>
                  <div className="elib-flip-shade" aria-hidden="true" />
                </div>
              )}
            </div>
          ) : isPdf && fileUrl ? (
            <div className="elib-spread-single">
              <iframe src={fileUrl} title={title} className="elib-bookview-pdf" loading="lazy" />
            </div>
          ) : (
            <div className="elib-spread-single">
              <div className="elib-bookview-empty">
                <FileText size={22} aria-hidden="true" />
                <p>{L('Матни пурра ҳоло дар китобхона нест.', 'Полный текст скоро появится в библиотеке.', 'Full text coming soon to the library.')}</p>
                {fileUrl && (
                  <>
                    <span className="elib-bookview-filename">{fileName}</span>
                    <span className="elib-bookview-filebtns">
                      <a className="bk-openbtn" href={fileUrl} target="_blank" rel="noreferrer">
                        <span>{t('leglib.openDoc')}</span>
                        <ExternalLink size={12} />
                      </a>
                      <a className="bk-openbtn" href={fileUrl} download>
                        <span>{L('Зеркашӣ', 'Скачать', 'Download')}</span>
                      </a>
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <nav className="elib-bookview-nav" aria-label={L('Саҳифаҳо', 'Страницы', 'Pages')}>
            <button type="button" onClick={() => setOpened(false)} aria-label={L('Бозгашт ба муқова', 'Вернуться к обложке', 'Back to cover')}>
              <BookOpen size={16} />
              <span>{L('Муқова', 'Обложка', 'Cover')}</span>
            </button>
            {pages.length > 1 && (
              <>
                <button type="button" onClick={() => goSpread(-1)} disabled={spread === 0 || !!flip} aria-label={L('Саҳифаи қаблӣ', 'Назад', 'Previous pages')}>
                  <ChevronLeft size={16} />
                  <span>{L('Қаблӣ', 'Назад', 'Prev')}</span>
                </button>
                <span className="elib-spread-counter">{counter}</span>
                <button type="button" onClick={() => goSpread(1)} disabled={spread >= maxSpread || !!flip} aria-label={L('Саҳифаи баъдӣ', 'Вперёд', 'Next pages')}>
                  <span>{L('Баъдӣ', 'Вперёд', 'Next')}</span>
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
};

export default BookReaderView;
