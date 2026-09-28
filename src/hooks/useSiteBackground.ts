import { useEffect, useState } from 'react';

export interface SiteBackground {
  imageDay: string;
  imageNight: string;
  overlayOpacity: number;
}

const FALLBACK_DAY = '/supreme-court-day.jpg';
const FALLBACK_NIGHT = '/supreme-court-night.jpg';

export const useSiteBackground = () => {
  const [bg, setBg] = useState<SiteBackground>({ imageDay: FALLBACK_DAY, imageNight: FALLBACK_NIGHT, overlayOpacity: 0 });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch('/api/design-settings');
        if (!res.ok) return;
        const data = await res.json() as Record<string, string>;
        if (!alive) return;
        const day = data['background_image_day'] || data['background_image'] || FALLBACK_DAY;
        const night = data['background_image_night'] || FALLBACK_NIGHT;
        const root = document.documentElement;
        const set = (name: string, value: string | undefined, suffix = '') => {
          if (value !== undefined && value !== '') root.style.setProperty(name, `${value}${suffix}`);
        };
        set('--bg-overlay-opacity', data.bg_overlay_opacity);
        set('--bg-blur', data.bg_blur, 'px');
        set('--bg-saturation', data.bg_saturation, '%');
        set('--bg-brightness', data.bg_brightness, '%');
        set('--bg-contrast', data.bg_contrast, '%');
        set('--glass-opacity', data.glass_opacity || data.glass_intensity);
        set('--glass-blur', data.glass_blur, 'px');
        set('--glass-saturation', data.glass_saturation, '%');
        set('--glass-border-opacity', data.glass_border_opacity || data.glass_border);
        if (data.glass_shadow) root.style.setProperty('--glass-shadow', `0 12px 40px rgba(0,0,0,${data.glass_shadow})`);
        if (data.glass_highlight) root.style.setProperty('--glass-highlight', `inset 0 1px 0 rgba(255,255,255,${data.glass_highlight})`);
        if (data.glass_radius) {
          set('--glass-radius', data.glass_radius, 'px');
          set('--glass-radius-card', data.glass_radius, 'px');
          set('--glass-radius-panel', data.glass_radius, 'px');
        }
        if (data.gold_accent) root.style.setProperty('--court-gold', data.gold_accent);
        setBg({ imageDay: day, imageNight: night, overlayOpacity: 0 });
      } catch {}
    };
    load();
    // poll for CMS changes every 30s so login and public stay synced without reload
    const id = setInterval(load, 30000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return bg;
};
