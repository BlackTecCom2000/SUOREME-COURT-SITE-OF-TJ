import { useEffect, useState } from 'react';

/**
 * Resolves the sky-silhouette masks used to let the live WebGL sky show through
 * the court photograph.
 *
 * If either PNG is missing the mask is disabled and the photograph renders
 * untouched, so a broken asset can never make the background disappear.
 */
export const SKY_MASK_DAY = '/supreme-court-sky-mask.png';
export const SKY_MASK_NIGHT = '/supreme-court-sky-mask-night.png';

let cache: Record<string, boolean> | null = null;

function probe(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

export const useSkyMasks = (): { day: string | null; night: string | null } => {
  const [masks, setMasks] = useState<{ day: string | null; night: string | null }>({
    day: null,
    night: null,
  });

  useEffect(() => {
    let alive = true;
    if (cache) {
      setMasks({
        day: cache[SKY_MASK_DAY] ? SKY_MASK_DAY : null,
        night: cache[SKY_MASK_NIGHT] ? SKY_MASK_NIGHT : null,
      });
      return;
    }
    Promise.all([probe(SKY_MASK_DAY), probe(SKY_MASK_NIGHT)]).then(([d, n]) => {
      if (!alive) return;
      cache = { [SKY_MASK_DAY]: d, [SKY_MASK_NIGHT]: n };
      setMasks({ day: d ? SKY_MASK_DAY : null, night: n ? SKY_MASK_NIGHT : null });
      if (!d && import.meta.env.DEV) {
        console.warn('CloudSky: day sky mask unavailable, background photo will render unmasked');
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return masks;
};
