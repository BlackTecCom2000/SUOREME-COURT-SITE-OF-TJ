import { DeviceCapabilityContextProps } from '../../context/DeviceCapabilityContext';

export type JusticeSymbolType = 'themis' | 'scales' | 'hammer';

export const getSymbolAssetPaths = (symbol: JusticeSymbolType, tier: DeviceCapabilityContextProps['tier']) => {
  const assets = {
    themis: {
      high: '/models/judicial/themis.glb',
      medium: '/models/judicial/optimized/themis-medium.glb',
      fallback: '/models/judicial/fallbacks/themis-fallback.webp'
    },
    scales: {
      high: '/models/judicial/scales.glb',
      medium: '/models/judicial/optimized/scales-medium.glb',
      fallback: '/models/judicial/fallbacks/scales-fallback.webp'
    },
    hammer: {
      high: '/models/judicial/judicial-gavel.glb',
      medium: '/models/judicial/optimized/gavel-medium.glb',
      fallback: '/models/judicial/fallbacks/gavel-fallback.webp'
    }
  };

  const asset = assets[symbol];
  
  if (tier === 'low-end') {
    return { glb: null, master: null, fallback: asset.fallback };
  }
  
  if (tier === 'medium') {
    return { glb: asset.medium, master: asset.high, fallback: asset.fallback };
  }

  return { glb: asset.high, master: asset.high, fallback: asset.fallback };
};
