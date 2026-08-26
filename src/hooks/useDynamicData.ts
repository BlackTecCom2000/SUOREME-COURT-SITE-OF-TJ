import { useState, useEffect } from 'react';
import * as fallbackData from '../data/sudTjData';

export function useDynamicData<T>(endpoint: string, fallbackKey: keyof typeof fallbackData): { data: T; isLoading: boolean; error: Error | null } {
  // Initialize with fallback data synchronously to avoid UI flickering or loading states on 24+ components
  const [data, setData] = useState<T>(fallbackData[fallbackKey] as any as T);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/${endpoint}`)
      .then(res => {
        if (!res.ok) throw new Error('API request failed');
        return res.json();
      })
      .then(apiData => {
        if (isMounted && apiData && (Array.isArray(apiData) ? apiData.length > 0 : Object.keys(apiData).length > 0)) {
          // Only replace fallback data if API actually returns something valid
          setData(apiData);
          setIsLoading(false);
        } else if (isMounted) {
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.warn(`Failed to fetch from /api/${endpoint}, using fallback for ${fallbackKey}`, err);
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [endpoint, fallbackKey]);

  return { data, isLoading, error };
}
