import { useEffect, useRef } from 'react';

// Global admin-public sync manager.
// Polls /api/sync and dispatches "sud:sync" when the epoch changes.
// Components register refetch callbacks to re-read admin-managed data.

const POLL_INTERVAL = 5000;
const refetchers = new Set<() => void>();
let epoch = -1;
let timer: ReturnType<typeof setInterval> | null = null;
let lastEpochForInit = false;

export const registerSyncRefetch = (fn: () => void) => {
  refetchers.add(fn);
  return () => { refetchers.delete(fn); };
};

const poll = async () => {
  try {
    const r = await fetch('/api/sync', { cache: 'no-store' });
    if (!r.ok) return;
    const d = await r.json();
    if (typeof d?.epoch !== 'number') return;
    if (!lastEpochForInit) {
      epoch = d.epoch;
      lastEpochForInit = true;
      return;
    }
    if (d.epoch !== epoch) {
      epoch = d.epoch;
      window.dispatchEvent(new CustomEvent('sud:sync'));
      refetchers.forEach((fn) => fn());
    }
  } catch {
    // offline - retry on next tick
  }
};

export const startGlobalSync = () => {
  poll();
  timer = setInterval(poll, POLL_INTERVAL);
};

export const stopGlobalSync = () => {
  if (timer) { clearInterval(timer); timer = null; }
};

export const useGlobalSync = (fn: () => void, intervalMs = POLL_INTERVAL) => {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const onSync = () => ref.current();
    window.addEventListener('sud:sync', onSync);
    let id: any;
    const pollOnce = async () => {
      try {
        const r = await fetch('/api/sync', { cache: 'no-store' });
        if (!r.ok) return;
        const d = await r.json();
        if (typeof d?.epoch !== 'number') return;
        if (d.epoch !== epoch) {
          epoch = d.epoch;
          window.dispatchEvent(new CustomEvent('sud:sync'));
          ref.current();
        }
      } catch { /* retry */ }
    };
    pollOnce();
    id = setInterval(pollOnce, intervalMs);
    return () => { window.removeEventListener('sud:sync', onSync); clearInterval(id); };
  }, [intervalMs]);
};
