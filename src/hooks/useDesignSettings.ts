import { useEffect, useState } from 'react';

/**
 * Shared store for the public design settings (`/api/design-settings`).
 *
 * The endpoint is tiny but it was being fetched and polled independently by
 * every consumer, which meant several identical requests in flight and several
 * timers. This module owns the one fetch, keeps the last good response in
 * memory, and notifies subscribers. Mounting it anywhere starts it; unmounting
 * the last subscriber leaves the cached value in place so a remount renders
 * instantly instead of flashing the CSS defaults.
 *
 * Poll interval matches the previous per-hook behaviour: a published change
 * reaches an open tab within 30s. The service worker serves this route with
 * stale-while-revalidate, so the first read after an edit may be one poll old -
 * the same latency every other design setting already has.
 */

export type DesignSettings = Record<string, string>;

const POLL_MS = 30_000;

let cache: DesignSettings = {};
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<(settings: DesignSettings) => void>();

const publish = () => {
  listeners.forEach((listener) => {
    try {
      listener(cache);
    } catch {
      // a broken subscriber must not stop the others
    }
  });
};

const load = async () => {
  try {
    const res = await fetch('/api/design-settings');
    if (!res.ok) return;
    const data = (await res.json()) as DesignSettings;
    if (!data || typeof data !== 'object') return;
    cache = data;
    publish();
  } catch {
    // offline or malformed: keep serving the last good settings
  }
};

const start = () => {
  if (!loaded) {
    loaded = true;
    loading = load();
    // Deliberately never cleared: the settings are global and the app outlives
    // every subscriber. A reload is the only thing that should stop this.
    setInterval(load, POLL_MS);
  }
  return loading;
};

/** Read without subscribing. Safe to call during render. */
export const getDesignSettings = (): DesignSettings => cache;

/** Subscribe to the public design settings. */
export const useDesignSettings = (): DesignSettings => {
  const [settings, setSettings] = useState<DesignSettings>(cache);

  useEffect(() => {
    start();
    const listener = (next: DesignSettings) => setSettings(next);
    listeners.add(listener);
    // The first load may have resolved between render and effect.
    if (cache !== settings) setSettings(cache);
    return () => {
      listeners.delete(listener);
    };
    // `settings` is intentionally excluded: including it would resubscribe on
    // every value change, and the listener already delivers the updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return settings;
};
