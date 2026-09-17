import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTheme } from '../../context/ThemeContext';
import { useDeviceCapability } from '../../context/DeviceCapabilityContext';
import { Adaptive3DLoader, Static3DFallback } from './Adaptive3DLoader';
import { getSymbolAssetPaths } from './ModelAssetRegistry';

export type JusticeSymbolType = 'themis' | 'scales' | 'hammer';

interface JusticeScene3DProps {
  activeSymbol: JusticeSymbolType;
  isInsightMode?: boolean;
  balanceState?: 'neutral' | 'law' | 'justice' | 'restored';
  triggerStrike?: boolean;
  onDecision?: () => void;
  onTilt?: (side: 'law' | 'justice') => void;
  onResetEquilibrium?: () => void;
}

export const JusticeScene3D: React.FC<JusticeScene3DProps> = ({
  activeSymbol,
  isInsightMode = false,
  balanceState = 'neutral',
  triggerStrike = false,
  onDecision
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { tier } = useDeviceCapability();

  const rootMargin = tier === 'high-end' ? '250px' : tier === 'medium' ? '100px' : '0px';

  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0,
    rootMargin,
  });

  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (inView) {
      setShouldMount(true);
    } else {
      // Grace period before fully unmounting and destroying WebGL context
      // This prevents rapid mounting/unmounting if the user scrolls back and forth quickly
      timeout = setTimeout(() => {
        setShouldMount(false);
      }, tier === 'high-end' ? 3000 : 1500); 
    }
    return () => clearTimeout(timeout);
  }, [inView, tier]);

  const paths = getSymbolAssetPaths(activeSymbol, tier);

  return (
    <div ref={ref} className="w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] relative rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none">
      {tier === 'low-end' ? (
        <Static3DFallback symbol={activeSymbol} fallbackPath={paths.fallback} />
      ) : (
        shouldMount && (
          <Adaptive3DLoader 
            activeSymbol={activeSymbol} 
            inView={inView} 
            tier={tier} 
            isDark={isDark} 
            isInsightMode={isInsightMode} 
            balanceState={balanceState} 
            triggerStrike={triggerStrike} 
            onDecision={onDecision} 
          />
        )
      )}
    </div>
  );
};
