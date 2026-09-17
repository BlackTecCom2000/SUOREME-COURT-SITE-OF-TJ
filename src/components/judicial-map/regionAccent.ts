// Regional accent colors for the judicial map (single source of truth).
export const REGION_ACCENT: Record<string, string> = {
  gbao: '#16BFFF',
  khatlon: '#20E6B5',
  sugd: '#E6B84A',
  dushanbe_rrp: '#A855F7',
};

export const regionAccent = (regionId: string, fallback = '#E8C76A'): string =>
  REGION_ACCENT[regionId] || fallback;
