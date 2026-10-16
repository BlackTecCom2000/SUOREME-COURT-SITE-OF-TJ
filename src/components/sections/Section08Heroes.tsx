import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, X, Landmark } from 'lucide-react';
import { Reveal } from '../Reveal';
import { HEROES } from '../../data/heroes';
import { useLanguage } from '../../context/LanguageContext';

const AUTOPLAY_MS = 9000;
const SWIPE_PX = 50;

export const Section08Heroes: React.FC = () => {
  const { language } = useLanguage();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [photoOk, setPhotoOk] = useState<Record<string, boolean>>({});
  const touchX = useRef<number | null>(null);
  // Manual navigation silences autoplay for a while: a carousel must never
  // move content from under the user's cursor (microinteraction rule).
  const quietUntil = useRef(0);
  const total = HEROES.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      quietUntil.current = Date.now() + 30000;
      setIndex((i) => (i + dir + total) % total);
    },
    [total]
  );
  const jump = useCallback((d: number) => {
    quietUntil.current = Date.now() + 30000;
    setIndex(d);
  }, []);

  // Gentle autoplay: paused on hover, focus, open modal, reduced motion,
  // and for 30s after any manual navigation. The timer itself advances
  // silently (no quiet reset) so the 9s cadence resumes afterwards.
  useEffect(() => {
    if (paused || modalOpen) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const wait = Math.max(0, quietUntil.current - Date.now());
    const t = window.setTimeout(function tick() {
      setIndex((i) => (i + 1) % total);
    }, wait + AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [paused, modalOpen, index, total]);

  // Esc closes the biography modal.
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  const kicker =
    language === 'tj' ? 'ҚАҲРАМОНОНИ ТОҶИКИСТОН' : language === 'en' ? 'HEROES OF TAJIKISTAN' : 'ГЕРОИ ТАДЖИКИСТАНА';
  const tabLabel =
    language === 'tj' ? 'ТАРҶУМАИ ҲОЛ' : language === 'en' ? 'BIOGRAPHY' : 'БИОГРАФИЯ';
  const moreLabel =
    language === 'tj' ? 'Муфассал' : language === 'en' ? 'Read more' : 'Подробнее';
  const decreeLabel =
    language === 'tj' ? 'Унвони олӣ' : language === 'en' ? 'Supreme title' : 'Высшее звание';
  const ofLabel = language === 'en' ? 'of' : '/';

  const pad = (n: number) => String(n + 1).padStart(2, '0');

  return (
    <section
      id="heroes"
      aria-label={kicker}
      className="relative section-rhythm px-4 sm:px-8 md:px-12 text-theme-text overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="site-container relative z-10 space-y-8">
        <Reveal delay={100}>
          <div className="liquid-glass-title-pod p-6 sm:p-8 md:p-10 max-w-4xl mb-12">
            <div className="flex items-center gap-3 font-mono text-xs text-theme-textSec mb-4">
              <span className="tracking-widest text-theme-gold font-semibold">( 08 )</span>
              <span className="text-theme-textMuted">[ 008 / 008 ]</span>
              <span className="w-1.5 h-1.5 rounded-full bg-theme-gold animate-pulse ml-1" />
            </div>
            <h2 className="public-section-title type-glass text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight mb-4 text-theme-text">
              {kicker}
            </h2>
          </div>
        </Reveal>

        {/* Showcase window */}
        <Reveal delay={200}>
          <div
            className="relative rounded-[24px] overflow-hidden border border-theme-border glass shadow-lg min-h-[82vh] flex flex-col"
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            {HEROES.map((hero, i) => {
              const L = hero[language];
              const active = i === index;
              const [first, ...rest] = L.name.split(' ');
              return (
                <article
                  key={hero.id}
                  aria-hidden={!active}
                  className="heroes-slide absolute inset-0"
                  style={{
                    opacity: active ? 1 : 0,
                    transform: active ? 'none' : 'scale(1.015)',
                    pointerEvents: active ? 'auto' : 'none',
                    zIndex: active ? 1 : 0,
                  }}
                >
                  {/* Backdrop: palace photo, portrait on top when the file exists */}
                  <div className="absolute inset-0 bg-gradient-to-b from-theme-bg via-theme-surface to-theme-bg" aria-hidden="true" />
                  <img
                    src="/supreme-court-day.jpg"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                  {photoOk[hero.id] !== false && (
                    <img
                      src={hero.portrait}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      onLoad={() => setPhotoOk((p) => ({ ...p, [hero.id]: true }))}
                      onError={() => setPhotoOk((p) => ({ ...p, [hero.id]: false }))}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                      style={{ opacity: photoOk[hero.id] ? 1 : 0, transition: 'opacity 0.8s ease' }}
                    />
                  )}
                  {/* Fallback monogram while the portrait file is missing */}
                  {photoOk[hero.id] === false && (
                    <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                      <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full border-2 border-theme-gold/60 bg-theme-bg/40 backdrop-blur-xl flex flex-col items-center justify-center gap-2 shadow-xl">
                        <Landmark size={30} className="text-theme-gold" />
                        <span className="font-serif font-bold text-3xl sm:text-4xl text-theme-gold tracking-widest">
                          {hero.initials}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Scrims: readable name on top, readable card at bottom */}
                  <div
                    className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/55 via-black/15 to-transparent"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
                    aria-hidden="true"
                  />

                  {/* Name block */}
                  <div className="absolute top-6 left-6 sm:top-10 sm:left-10 max-w-[80%]">
                    <div className="w-10 h-0.5 bg-theme-gold mb-3" aria-hidden="true" />
                    <h3 className="type-glass font-serif font-medium leading-[1.04] tracking-tight text-4xl sm:text-6xl">
                      <span className="text-white">{first}</span>{' '}
                      <span className="text-theme-gold">{rest.join(' ')}</span>
                    </h3>
                    <div className="w-10 h-0.5 bg-theme-gold/70 mt-3 mb-2" aria-hidden="true" />
                    <p className="text-white/85 text-sm sm:text-base font-medium">{L.title}</p>
                    {L.years && (
                      <p className="font-mono text-xs sm:text-sm text-white/60 mt-1 tracking-[0.2em]">{L.years}</p>
                    )}
                  </div>

                  {/* Glass info card */}
                  <div className="absolute inset-x-3 bottom-3 sm:inset-x-8 sm:bottom-6">
                    <div className="glass glass-card rounded-2xl p-4 sm:p-5 border">
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2 text-theme-gold">
                          <BookOpen size={15} />
                          <span className="font-mono text-2xs sm:text-xs font-bold uppercase tracking-[0.18em]">
                            {tabLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-2xs text-theme-textMuted mr-1">
                            {pad(index)} {ofLabel} {pad(total - 1)}
                          </span>
                          <button
                            type="button"
                            onClick={() => go(-1)}
                            aria-label={language === 'tj' ? 'Қаҳрамони қаблӣ' : language === 'en' ? 'Previous hero' : 'Предыдущий герой'}
                            className="tap-target press-tactile w-9 h-9 rounded-full glass-nest border flex items-center justify-center text-theme-textSec hover:text-theme-gold hover:border-theme-gold/50 transition-colors"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => go(1)}
                            aria-label={language === 'tj' ? 'Қаҳрамони баъдӣ' : language === 'en' ? 'Next hero' : 'Следующий герой'}
                            className="tap-target press-tactile w-9 h-9 rounded-full glass-nest border flex items-center justify-center text-theme-textSec hover:text-theme-gold hover:border-theme-gold/50 transition-colors"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-theme-textSec line-clamp-3 mb-3">
                        {L.excerpt}
                      </p>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setModalOpen(true)}
                          className="tap-target press-tactile inline-flex items-center gap-2 px-5 h-11 rounded-full bg-theme-gold text-theme-bg font-bold text-sm shadow-md hover:brightness-110 transition"
                        >
                          {moreLabel}
                          <ChevronRight size={15} />
                        </button>
                        <div className="flex items-center gap-1.5" role="tablist" aria-label={kicker}>
                          {HEROES.map((h, d) => (
                            <button
                              key={h.id}
                              type="button"
                              role="tab"
                              aria-selected={d === index}
                              aria-label={`${L.name} — ${pad(d)}`}
                              onClick={() => jump(d)}
                              className={`tap-target h-2 rounded-full transition-all duration-300 ${
                                d === index ? 'w-7 bg-theme-gold' : 'w-2 bg-theme-textMuted/50 hover:bg-theme-textMuted'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Reveal>
      </div>

      {/* Biography modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={HEROES[index][language].name}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative glass glass-premium rounded-2xl border max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label={language === 'tj' ? 'Пӯшидан' : language === 'en' ? 'Close' : 'Закрыть'}
              className="tap-target press-tactile absolute top-4 right-4 w-10 h-10 rounded-full glass-nest border flex items-center justify-center text-theme-textSec hover:text-theme-gold transition-colors"
            >
              <X size={17} />
            </button>
            {(() => {
              const hero = HEROES[index];
              const L = hero[language];
              const [first, ...rest] = L.name.split(' ');
              return (
                <>
                  <div className="flex items-center gap-4 mb-5">
                    {photoOk[hero.id] ? (
                      <img
                        src={hero.portrait}
                        alt=""
                        aria-hidden="true"
                        className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl object-cover object-top border border-theme-gold/50 shadow-md shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl border border-theme-gold/50 bg-theme-bg/60 flex items-center justify-center shrink-0">
                        <span className="font-serif font-bold text-2xl text-theme-gold">{hero.initials}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-serif font-medium text-2xl sm:text-3xl leading-tight">
                        <span className="text-theme-text">{first}</span>{' '}
                        <span className="text-theme-gold">{rest.join(' ')}</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-theme-textSec mt-1">{L.title}</p>
                      {L.years && (
                        <p className="font-mono text-xs text-theme-textMuted mt-1 tracking-[0.2em]">{L.years}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-theme-textSec">
                    {L.bio.map((p, k) => (
                      <p key={k}>{p}</p>
                    ))}
                  </div>
                  <div className="mt-5 p-4 rounded-xl border border-theme-gold/40 bg-theme-gold/10">
                    <div className="font-mono text-2xs font-bold uppercase tracking-[0.18em] text-theme-gold mb-1.5">
                      {decreeLabel}
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-theme-text">{L.decree}</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </section>
  );
};
