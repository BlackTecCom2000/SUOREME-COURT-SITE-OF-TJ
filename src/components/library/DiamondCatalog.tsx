import React from 'react';
import { ShelfBook, coverFor, BOOK_THEMES } from '../digital-court/LawBookshelf';
import { pickTri } from '../../sites/types';
import { useLanguage } from '../../context/LanguageContext';
import './DiamondCatalogCodePen.css';

export const DiamondCatalog: React.FC<{ books: ShelfBook[]; onSelect: (b: ShelfBook) => void; selectedKey: string | null }> = ({ books, onSelect, selectedKey }) => {
  const { language } = useLanguage();
  if (!books.length) return <div className="py-16 text-center font-mono text-xs text-white/60">Китобҳо нестанд</div>;
  return (
    <div className="codepen-catalog">
      <ul>
        {books.map((b, i) => {
          const title = pickTri(b.title, language);
          const isActive = selectedKey === b.key;
          const coverImg = (b as any).coverImage as string | null | undefined;
          const fallbackBg = BOOK_THEMES[coverFor(b, i) % BOOK_THEMES.length];
          return (
            <li key={b.key} className={isActive ? 'is-active' : ''} onClick={() => onSelect(b)} title={title}>
              <span className="tj-shimmer" aria-hidden="true" />
              {coverImg ? (
                <img src={coverImg} alt={title} loading="lazy" />
              ) : (
                <div className="book-glass" style={{ background: fallbackBg }}>
                  <span style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'Georgia, serif', fontSize: 11, lineHeight: 1.2, fontWeight: 600, color: '#fff', textAlign: 'center', padding: '8px 6px' }}>{title.slice(0, 80)}</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default DiamondCatalog;
