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
