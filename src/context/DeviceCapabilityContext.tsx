import React, { createContext, useContext, useEffect, useState } from 'react';

export type DeviceTier = 'high-end' | 'medium' | 'low-end';

export interface DeviceCapabilityContextProps {
  tier: DeviceTier;
  isReducedMotion: boolean;
}

const DeviceCapabilityContext = createContext<DeviceCapabilityContextProps>({
  tier: 'high-end', // Default to high-end for SSR
  isReducedMotion: false,
});

export const DeviceCapabilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [capability, setCapability] = useState<DeviceCapabilityContextProps>({
    tier: 'high-end',
    isReducedMotion: false,
  });

  useEffect(() => {
    // Check for prefers-reduced-motion
    const motionMatch = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReducedMotion = motionMatch.matches;

    // Assess hardware capabilities
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    // @ts-ignore - deviceMemory is not standard across all browsers yet
    const deviceMemory = navigator.deviceMemory || 4; 
    
    // @ts-ignore - connection is not standard
    const connection = navigator.connection;
    const isSlowConnection = connection ? (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' || connection.saveData) : false;

    // Check device type by simple user agent (mobile vs desktop)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    let tier: DeviceTier = 'high-end';

    // Simple heuristic for capability tier
    if (isSlowConnection || isReducedMotion || (isMobile && (hardwareConcurrency <= 4 || deviceMemory <= 4))) {
      tier = 'low-end';
    } else if (isMobile || hardwareConcurrency < 8 || deviceMemory < 8) {
      tier = 'medium';
    }

    setCapability({
      tier,
      isReducedMotion,
    });

    // Optional: listen to changes in reduced motion
    const listener = (e: MediaQueryListEvent) => {
      setCapability(prev => ({ ...prev, isReducedMotion: e.matches }));
    };
    motionMatch.addEventListener('change', listener);
    return () => motionMatch.removeEventListener('change', listener);
  }, []);

  return (
    <DeviceCapabilityContext.Provider value={capability}>
      {children}
    </DeviceCapabilityContext.Provider>
  );
};

export const useDeviceCapability = () => useContext(DeviceCapabilityContext);
