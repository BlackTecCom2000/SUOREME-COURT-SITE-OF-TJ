import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Intro splash — a short local video that plays once, on top of the portal,
 * on the first tab session only.
 *
 * Rules implemented here:
 *  - The video is a local static asset (public/video/sud-intro.mp4). Nothing
 *    is fetched from a third party.
 *  - The page is NOT replaced: the overlay sits above it (fixed, z-index 100)
 *    and fades out when the clip ends.
 *  - It finishes on `ended`, on a media error, and on a hard timeout, so a
 *    visitor can never be trapped on the splash.
 *  - A "Skip" button is a real <button> (keyboard reachable) and Escape also
 *    skips.
 *  - Once per tab session: sessionStorage marks the intro as seen, so route
 *    changes and reloads inside the same session never replay it.
 *  - prefers-reduced-motion: the intro is skipped entirely (and marked as
 *    seen) instead of animating.
 *  - Autoplay is muted (the source file carries an AAC track) and inline, so
 *    the clip never plays sound unexpectedly and never goes fullscreen on
 *    phones.
 *  - The clip keeps its own proportions: object-contain letterboxes it on any
 *    aspect ratio instead of stretching it.
 */

const STORAGE_KEY = 'sudtj:intro-seen';
const VIDEO_SRC = '/video/sud-intro.mp4';
/** The clip is ~13s; give it slack for slow connections, then bail out. */
const HARD_TIMEOUT_MS = 22000;
/** Duration of the fade-out that reveals the site again. */
const FADE_MS = 700;

type Phase = 'hidden' | 'playing' | 'leaving';

export const IntroSplash: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('hidden');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const finish = useCallback(() => {
    setPhase((current) => (current === 'playing' ? 'leaving' : current));
  }, []);

  // 1. Decide once, on the client, whether the intro should run at all.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      seen = false; // storage blocked (private mode): play once per mount
    }
    if (seen) return;

    // The Control Center is a separate application: no court intro there.
    if (window.location.pathname.startsWith('/admin')) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) {
      // Respect the setting: no intro, no motion, and never retry later.
      try {
        window.sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
      return;
    }

    // Data saver / very slow link: the clip is 8.6 MB. Showing the portal
    // immediately is worth more than the intro on such a connection.
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
      return;
    }

    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setPhase('playing');

    // If the visitor turns reduced-motion on while the splash is up, drop it.
    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) finish();
    };
    reducedMotion.addEventListener('change', onMotionChange);
    return () => reducedMotion.removeEventListener('change', onMotionChange);
  }, [finish]);

  // 2. While the splash is up: lock the page scroll, arm the timeout, and
  //    make sure playback actually starts (autoplay may still be refused).
  useEffect(() => {
    if (phase === 'hidden') return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    timerRef.current = window.setTimeout(finish, HARD_TIMEOUT_MS);

    const video = videoRef.current;
    if (video) {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch((err: unknown) => {
          // A rejected play() is only fatal when playback really cannot
          // happen: AbortError means the call was interrupted (a pause, a seek,
          // a reload) and the clip is still fine, so the splash must stay.
          const name = (err as { name?: string })?.name;
          if (name === 'AbortError') return;
          if (video.error) {
            finish(); // the source failed to load
          } else if (name === 'NotAllowedError') {
            finish(); // autoplay refused by the browser
          }
        });
      }
    }

    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish();
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
  }, [phase, finish]);

  // 3. After the fade-out the overlay leaves the tree for good.
  useEffect(() => {
    if (phase !== 'leaving') return;
    const id = window.setTimeout(() => setPhase('hidden'), FADE_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === 'hidden') return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Вступительная заставка Верховного суда"
      tabIndex={-1}
      data-intro-splash="playing"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black outline-none transition-opacity duration-700 ease-out ${
        phase === 'leaving' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Video keeps its own aspect ratio (object-contain), never stretched. */}
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        src={VIDEO_SRC}
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate"
        onEnded={finish}
        onError={finish}
        onCanPlay={(event) => {
          // Some browsers defer autoplay until the data is ready; nudge it.
          const el = event.currentTarget;
          if (el.paused && !el.ended) {
            const attempt = el.play();
            if (attempt && typeof attempt.catch === 'function') attempt.catch(() => undefined);
          }
        }}
      />

      {/* Skip — real button, keyboard reachable; Escape works as well. */}
      <button
        type="button"
        onClick={finish}
        className="absolute right-3 top-3 sm:right-6 sm:top-6 min-h-[44px] min-w-[44px] px-4 rounded-full border border-white/25 bg-black/45 text-white/85 font-mono text-[11px] uppercase tracking-[0.18em] backdrop-blur-sm hover:text-white hover:border-white/50 hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors duration-200"
      >
        Пропустить
      </button>
    </div>
  );
};

export default IntroSplash;
