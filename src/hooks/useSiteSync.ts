import { useEffect, useRef } from 'react';

// Polls /api/sync and refetches when the admin bumps the epoch
// (any POST/PATCH/DELETE in any admin panel). Survives StrictMode
// double-mount via the `alive` guard + interval cleanup.
export function useSiteSync(refetch: () => void, intervalMs = 30000) {
  const ref = useRef(refetch);
  ref.current = refetch;

  useEffect(() => {
    let alive = true;
    let last = 0;
    const poll = async () => {
      try {
        const r = await fetch('/api/sync', { cache: 'no-store' });
        if (!r.ok) return;
        const d = await r.json();
        if (!alive || typeof d?.epoch !== 'number') return;
        if (last === 0) {
          last = d.epoch;
          return;
        }
        if (d.epoch !== last) {
          last = d.epoch;
          ref.current();
          window.dispatchEvent(new CustomEvent('sud:sync'));
        }
      } catch {
        /* offline / restarting server — retry on next tick */
      }
    };
    poll();
    const id = setInterval(poll, intervalMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [intervalMs]);
}

export default useSiteSync;
