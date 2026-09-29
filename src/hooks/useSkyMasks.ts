import { useEffect, useState } from 'react';

/**
 * Resolves the sky-silhouette mask used to let the live WebGL sky show through
 * the daytime court photograph.
 *
 * Only the DAY photograph is masked. The night photograph is deliberately left
 * unmasked: its sky carries the star field, cutting it away removed the stars
 * entirely, and a mask derived from the daytime framing does not line up with
 * the night framing. The night photo is dark enough that the live clouds read
 * through it without any mask at all.
 *
 * If the PNG is missing the mask is disabled and the photograph renders
 * untouched, so a broken asset can never make the background disappear.
 */
export const SKY_MASK_DAY = '/supreme-court-sky-mask.png';

let cache: boolean | null = null;

function probe(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

export const useSkyMask = (): { day: string | null } => {
  const [mask, setMask] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (cache !== null) {
      setMask(cache ? SKY_MASK_DAY : null);
      return;
    }
    probe(SKY_MASK_DAY).then((ok) => {
      if (!alive) return;
      cache = ok;
      setMask(ok ? SKY_MASK_DAY : null);
      if (!ok && import.meta.env.DEV) {
        console.warn('CloudSky: day sky mask unavailable, background photo will render unmasked');
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return { day: mask };
};
