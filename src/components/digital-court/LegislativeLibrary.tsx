import React, { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { LibraryBig, ArrowRight } from 'lucide-react';
import { Reveal } from '../Reveal';
import { DigitalDataRain } from '../effects/DigitalDataRain';
import { useLanguage } from '../../context/LanguageContext';
import { InteractiveLawBook } from './InteractiveLawBook';
import { useShelfBooks } from './LawBookshelf';
import './LegislativeLibrary.css';

export const LegislativeLibrary: React.FC = () => {
  const { language, t } = useLanguage();
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const splitRef = useRef<SplitType | null>(null);

  // Featured showcase follows admin-managed books; the full collection
  // lives in the standalone e-library (/library) — no duplication.
  const shelfBooks = useShelfBooks();
  const showcaseBooks = useMemo(() => shelfBooks.slice(0, 3), [shelfBooks]);

  // Split-Type animated title (re-split on language change)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    if (splitRef.current) {
      splitRef.current.revert();
      splitRef.current = null;
    }
    let split: SplitType | null = null;
    if (titleRef.current) {
      split = new SplitType(titleRef.current, { types: 'chars' });
      splitRef.current = split;
      gsap.from(split.chars || [], {
        yPercent: 55,
        opacity: 0,
        rotateX: -55,
        stagger: 0.016,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 82%' },
      });
    }
    return () => {
      if (splitRef.current) {
        splitRef.current.revert();
        splitRef.current = null;
      }
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === rootRef.current) st.kill();
      });
    };
  }, [language]);

  return (
    <section
      id="legislative-library"
      aria-label={t('leglib.badge')}
      ref={rootRef}
      className="relative py-14 lg:py-28 px-4 sm:px-8 md:px-12 text-theme-text overflow-hidden border-t border-theme-border/30 select-none"
    >
      <DigitalDataRain density="sparse" speed="medium" opacity={0.18} colorTheme="gold" />

      <div className="site-container relative z-10 space-y-8">
        <Reveal delay={50}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-theme-gold/30 bg-theme-gold/10 text-theme-gold font-mono text-[11px] font-bold uppercase tracking-wider">
            <LibraryBig size={13} />
            <span>{t('leglib.badge')}</span>
          </div>
        </Reveal>

        <div className="max-w-4xl">
          <h2
            ref={titleRef}
            className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight uppercase mb-4"
          >
            {t('leglib.title1')}{' '}
            <span className="italic font-light text-theme-gold">{t('leglib.title1Italic')}</span>{' '}
            {t('leglib.title2')}
          </h2>
          <Reveal delay={150}>
            <p className="text-sm sm:text-base leading-relaxed text-theme-textSec font-normal max-w-2xl">
              {t('leglib.description')}
            </p>
          </Reveal>
        </div>

        <InteractiveLawBook books={showcaseBooks} />

        <Reveal delay={200}>
          <Link
            to="/library"
            className="group inline-flex items-center gap-3 px-6 py-4 rounded-2xl border border-theme-gold/50 bg-theme-gold/10 hover:bg-theme-gold/20 transition-colors"
          >
            <LibraryBig size={20} className="text-theme-gold" />
            <span className="text-left">
              <span className="block font-serif font-bold text-base sm:text-lg text-theme-text group-hover:text-theme-gold transition-colors">
                {language === 'tj'
                  ? 'Китобхонаи электронии суд — Ҳамаи китобҳо'
                  : language === 'en'
                  ? 'Electronic Court Library — All Books'
                  : 'Электронная библиотека суда — Все книги'}
              </span>
              <span className="block font-mono text-[11px] text-theme-textSec">
                {language === 'tj'
                  ? `Забонҳо • Кодексҳо • Санадҳо — ${shelfBooks.length}`
                  : language === 'en'
                  ? `Laws • Codes • Acts — ${shelfBooks.length}`
                  : `Законы • Кодексы • Акты — ${shelfBooks.length}`}
              </span>
            </span>
            <ArrowRight size={18} className="text-theme-gold transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default LegislativeLibrary;
