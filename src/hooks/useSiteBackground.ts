import { useMemo } from 'react';
import { useThemeConfig } from '../theme';
import type { DesignSettings } from './useDesignSettings';

export interface SiteBackground {
  imageDay: string;
  imageNight: string;
  overlayOpacity: number;
}

const FALLBACK_DAY = '/supreme-court-day.jpg';
const FALLBACK_NIGHT = '/supreme-court-night.jpg';

/**
 * Reports the background photographs to GlobalBackground.
 *
 * The visual tokens are NOT written here any more. They come from the single
 * Theme Configuration via the ThemeProvider, whose CSS variable generator is the
 * only place that writes them. This hook previously duplicated that mapping,
 * which is how the Site Builder preview and the public runtime drifted apart:
 * they had two different key-precedence rules for the same setting.
 *
 * The raw settings bag is still exposed for the few values that are genuinely
 * per-surface rather than theme-level (the photographs).
 */
export const useSiteBackground = (): SiteBackground & { settings: DesignSettings } => {
  const { settings, mode } = useThemeConfig();

  return useMemo(() => {
    const data = settings ?? {};
    const day = data['background_image_day'] || data['background_image'] || FALLBACK_DAY;
    const night = data['background_image_night'] || FALLBACK_NIGHT;
    return {
      imageDay: day,
      imageNight: night,
      overlayOpacity: 0,
      settings: data,
      mode,
    };
  }, [settings, mode]);
};
