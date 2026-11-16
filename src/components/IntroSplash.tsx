import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Intro splash — a short local clip shown in a window ON TOP of the portal.
 *
 * The portal is fully rendered underneath: the intro is a glass dialog over the
 * live page, not a black full-screen takeover, and once it closes the visitor
 * is straight on the site (no reload, no scroll jump).
 *
 * Rules implemented here:
 *  - The video is a local static asset (public/video/sud-intro.mp4). Nothing
 *    is fetched from a third party.
 *  - It plays on every full page load (a refresh included) and exactly once
 *    per load: route changes inside the portal do not replay it, because the
 *    component lives above the router.
 *  - It closes on `ended`, on a media error and on a hard timeout, so a
 *    visitor can never be trapped behind it.
 *  - A "Skip" button is a real <button> (keyboard reachable); Escape also
 *    skips.
 *  - prefers-reduced-motion: the intro is skipped entirely (and shown with no
 *    transitions if the setting changes mid-flight).
 *  - Autoplay is muted (the source carries an AAC track) and inline, so the
 *    clip never plays sound unexpectedly and never goes fullscreen on phones.
 *  - Data saver / 2g connections skip it: the portal is worth more there.
 *  - The clip keeps its own proportions: object-contain letterboxes it on any
 *    aspect ratio instead of stretching it.
 */

const VIDEO_SOURCES = [
  { src: '/video/sud-intro-251.webm', type: 'video/webm' },
  { src: '/video/sud-intro-251.mp4', type: 'video/mp4' },
];
const POSTER_SRC = '/video/sud-intro-251-poster.jpg';
/** The clip is ~13s; give it slack for slow connections, then bail out. */
const HARD_TIMEOUT_MS = 22000;
/** Duration of the closing transition that reveals the site again. */
const CLOSE_MS = 320;

/* One intro per page load, even if React mounts the component twice. */
let introStarted = false;

type Phase = 'hidden' | 'opening' | 'playing' | 'closing';

export const IntroSplash: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('hidden');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const close = useCallback(() => {
    setPhase((current) => (current === 'closing' || current === 'hidden' ? current : 'closing'));
  }, []);

  // 1. Decide once, on the client, whether the intro should run at all.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (introStarted) return;

    // The Control Center is a separate application: no court intro there.
    if (window.location.pathname.startsWith('/admin')) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    // Data saver / very slow link: the clip is heavy. Showing the portal
    // immediately is worth more than the intro on such a connection.
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') return;

    introStarted = true;
    setPhase('opening');

    // If the visitor turns reduced-motion on while the intro is up, drop it.
    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) close();
    };
    reducedMotion.addEventListener('change', onMotionChange);
    return () => reducedMotion.removeEventListener('change', onMotionChange);
  }, [close]);

  // 2. While the intro is up: lock the page scroll, arm the timeout, and
  //    make sure playback actually starts (autoplay may still be refused).
  useEffect(() => {
    if (phase === 'hidden' || phase === 'closing') return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    timerRef.current = window.setTimeout(close, HARD_TIMEOUT_MS);

    const video = videoRef.current;
    if (video) {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch((err: unknown) => {
          // A rejected play() is only fatal when playback really cannot
          // happen: AbortError means the call was interrupted (a pause, a seek,
          // a reload) and the clip is still fine, so the dialog must stay.
          const name = (err as { name?: string })?.name;
          if (name === 'AbortError') return;
          if (video.error) close(); // the source failed to load
          else if (name === 'NotAllowedError') close(); // autoplay refused
        });
      }
    }

    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      document.body.style.overflow = previousOverflow;
    };
  }, [phase, close]);

  // 3. After the closing transition the dialog leaves the tree for good.
  useEffect(() => {
    if (phase !== 'closing') return;
    const id = window.setTimeout(() => setPhase('hidden'), CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === 'hidden') return null;

  const isOpen = phase === 'opening' || phase === 'playing';

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ease-out ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(3, 7, 15, 0.55)', backdropFilter: 'blur(3px)' }}
      aria-hidden={!isOpen}
    >
      {/* The portal stays visible behind the dialog — this is a window on the
          site, not a takeover of it. */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Вступительная заставка Верховного суда"
        tabIndex={-1}
        data-intro-splash={isOpen ? 'playing' : 'closing'}
        className={`relative w-full max-w-4xl overflow-hidden rounded-3xl border border-theme-gold/30 shadow-[0_30px_90px_rgba(0,0,0,0.55)] outline-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.97] translate-y-2'
        }`}
        style={{ background: 'rgba(6, 12, 22, 0.92)' }}
      >
        {/* 16:9 stage — the clip's own ratio, never stretched */}
        <div className="relative w-full aspect-video bg-black">
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            poster={POSTER_SRC}
            autoPlay
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            controlsList="nodownload noplaybackrate"
            onEnded={close}
            onError={close}
            onCanPlay={(event) => {
              // Some browsers defer autoplay until the data is ready; nudge it.
              const el = event.currentTarget;
              if (el.paused && !el.ended) {
                const attempt = el.play();
                if (attempt && typeof attempt.catch === 'function') attempt.catch(() => undefined);
              }
            }}
          >
            {VIDEO_SOURCES.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        </div>

        {/* Footer strip: identity + skip */}
        <div className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3 border-t border-theme-gold/20">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/emblems/emblem-tj.png"
              alt=""
              aria-hidden="true"
              className="w-7 h-7 object-contain shrink-0"
              loading="lazy"
            />
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-theme-gold leading-tight">
                Суди Олии Ҷумҳурии Тоҷикистон
              </div>
              <div className="font-sans text-[11px] text-theme-textSec leading-tight truncate">
                Единая цифровая среда судебной власти
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={close}
            className="shrink-0 min-h-[44px] px-4 rounded-full border border-theme-border bg-theme-surface/70 text-theme-text font-mono text-[11px] uppercase tracking-[0.18em] hover:border-theme-gold hover:text-theme-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-gold transition-colors duration-200"
          >
            Пропустить
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroSplash;
