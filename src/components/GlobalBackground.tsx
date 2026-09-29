import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSiteBackground } from '../hooks/useSiteBackground';
import { useSkyMask } from '../hooks/useSkyMasks';
import CloudSky from './CloudSky';

/**
 * ONE GLOBAL BACKGROUND (public portal, admin, login).
 *
 * Layer order, bottom to top:
 *   0. CloudSky      live WebGL sky + interactive clouds
 *   1. photograph    Supreme Court building, masked with a generated
 *                    silhouette so the sky part of the photo dissolves and the
 *                    live clouds fill the space around the building
 *   1b. cloud veil   dark mode only. The night photograph is opaque, so it
 *                    hides layer 0 completely; this second cloud layer sits
 *                    above it, masked away from the building. The stars stay
 *                    and the sky moves again. See `.clouds-over-sky`.
 *   2. white haze    weak, configurable, keeps the architecture bright
 *   3. gold glow     very subtle top vignette, ties the palette together
 *   4. vignette      edge falloff so content reads at any scroll position
 *
 * Glass (`backdrop-filter`) is intentionally absent from this whole stack - it
 * belongs to cards/buttons/modals only, otherwise the page seams and blanks.
 *
 * The day mask is generated from the day photograph by
 * `scripts/make-sky-mask.ps1`. There is deliberately no night mask: cutting the
 * night photo open removes the star field, and the earlier generated mask was
 * fully transparent, which made the building disappear entirely. Layer 1b
 * solves the same problem without an asset to keep aligned.
 */

export const GlobalBackground: React.FC = () => {
  const { isDark } = useTheme();
  const { imageDay, imageNight } = useSiteBackground();
  const mask = useSkyMask();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const maxScrollRef = useRef(1);
  const frameRef = useRef(0);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);

  useEffect(() => {
    const updateMax = () => { maxScrollRef.current = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); };
    updateMax();
    const apply = () => {
      frameRef.current = 0;
      const current = currentScrollRef.current;
      const target = targetScrollRef.current;
      const next = current + (target - current) * 0.085;
      currentScrollRef.current = Math.abs(target - next) < 0.1 ? target : next;

      // The zoom eases toward a limit instead of stopping abruptly at the page end.
      const progress = Math.max(0, currentScrollRef.current / maxScrollRef.current);
      const zoom = 1 + 0.11 * (1 - Math.exp(-progress * 1.35));
      const translate = 54 * (1 - Math.exp(-progress * 1.1));
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `scale(${zoom.toFixed(5)}) translate3d(0, -${translate.toFixed(2)}px, 0)`;
      }

      if (Math.abs(target - currentScrollRef.current) > 0.1) {
        frameRef.current = requestAnimationFrame(apply);
      }
    };
    const schedule = () => {
      targetScrollRef.current = Math.max(0, window.scrollY);
      if (!frameRef.current) frameRef.current = requestAnimationFrame(apply);
    };
    const onScroll = () => schedule();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onResize = () => { updateMax(); schedule(); };
    window.addEventListener('resize', onResize);
    schedule();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, []);

  const photoStyle = (mask: string | null): React.CSSProperties => ({
    filter: 'saturate(var(--bg-saturation, 100%)) brightness(var(--bg-brightness, 100%)) contrast(var(--bg-contrast, 100%))',
    ...(mask
      ? {
          maskImage: `url(${mask})`,
          WebkitMaskImage: `url(${mask})`,
          maskSize: 'cover',
          WebkitMaskSize: 'cover',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }
      : {}),
  });

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 bg-[var(--bg-primary)] pointer-events-none select-none overflow-hidden">
      {/* 0 — live sky + interactive clouds (WebGL), under the photograph */}
      <CloudSky
        className="absolute inset-0 w-full h-full"
        background={isDark ? '#050d1f' : '#2f6fb5'}
        baseColor={isDark ? '#16233d' : '#b9d6f0'}
        accentColor={isDark ? '#93a7c8' : '#ffffff'}
        density={62}
        speed={34}
        size={140}
        clouds={{ softness: 170, shadow: isDark ? 45 : 78, cirrus: 60 }}
        sun={{ x: 82, y: 94, glow: isDark ? 'rgba(150, 172, 212, 0.30)' : 'rgba(255, 246, 224, 0.95)' }}
        interactive={false}
        resolutionScale={0.5}
        opacity={isDark ? 0.95 : 1}
      />

      <div
        ref={parallaxRef}
        className="absolute inset-0 w-full h-full transform-gpu"
        style={{
          transform: 'scale(1) translateY(-0px)',
          filter: `blur(var(--bg-blur, 0px))`,
        }}
      >
        {/* 1 — the building; the baked sky is cut away so the live sky surrounds it */}
        <img
          src={imageDay}
          alt=""
          loading="eager"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
            !isDark ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          style={photoStyle(mask.day)}
        />
        <img
          src={imageNight}
          alt=""
          loading="eager"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
            isDark ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          style={photoStyle(null)}
          onLoad={(e) => {
            // The night plate is underexposed by design. Without a lift the
            // building sank into the dark theme, so nudge the midtones once it
            // has decoded - a no-op while the editor's own brightness token
            // is doing the work.
            const el = e.currentTarget;
            const v = getComputedStyle(el).getPropertyValue('--bg-brightness').trim();
            if (v === '100%' || v === '') el.style.filter = 'brightness(1.12)';
          }}
        />
      </div>

      {/* Dark only: in light mode the sky is cut out of the day photograph by
          its alpha mask, so the CloudSky layer underneath already shows through.
          A second layer here would double the clouds. */}
      {/* 1b - live clouds drifting across the night sky, masked away from the
          building so they never pass over the architecture. Dark only: the day
          photograph is cut open by its alpha mask, so the CloudSky layer below
          already shows through there and a second layer would double it. */}
      {isDark && (
        <div className="clouds-over-sky" aria-hidden="true">
          <CloudSky
            className="absolute inset-0 w-full h-full"
            background="#050d1f"
            baseColor="#16233d"
            accentColor="#8fa3c4"
            density={44}
            speed={26}
            size={150}
            clouds={{ softness: 200, shadow: 35, cirrus: 55 }}
            sun={{ x: 84, y: 96, glow: 'rgba(150, 172, 212, 0.28)' }}
            interactive={false}
            resolutionScale={0.45}
            opacity={0.55}
          />
        </div>
      )}
      {/* 2 — Atmospheric White Overlay: configurable but capped by
          .bg-atmosphere-haze, so a high CMS value cannot turn the glass
          into milk. Building and live sky stay visible. */}
      <div className="absolute inset-0 pointer-events-none bg-atmosphere-haze" />
      {/* 3 — gold glow ties the live sky to the court palette */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          isDark ? 'opacity-25' : 'opacity-10'
        }`}
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 0%, rgba(223,190,126,0.10) 0%, transparent 58%)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(184,138,36,0.05) 0%, transparent 62%)',
        }}
      />
      {/* 4 — vignette so foreground content always reads */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 70%, rgba(0,0,0,0.08) 100%)' }}
      />
    </div>
  );
};

export default GlobalBackground;
