import React from 'react';

/**
 * Boot guard for the lazily loaded application.
 *
 * The SPA shell is tiny and the real app is imported dynamically. If a visitor
 * keeps an old shell (Service Worker cache, an open tab across a deploy) the
 * dynamic import can fail: the chunk it asks for no longer exists, the
 * promise rejects, and React has nothing to render — the page stays on the
 * loading placeholder forever.
 *
 * This boundary catches exactly that case and repairs it once: it drops the
 * stale worker/caches and reloads the document so the visitor gets the new
 * build. Any other error gets a calm, on-brand message with a retry button
 * instead of a blank screen.
 */

const RETRY_KEY = 'sudtj:boot-retry';

const isChunkError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /ChunkLoadError/i.test(message) ||
    /Loading chunk \d+ failed/i.test(message) ||
    /Failed to fetch/i.test(message)
  );
};

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class BootErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    if (!isChunkError(error)) return;

    // One repair attempt per tab session: if the reload still fails we show
    // the message instead of looping.
    let alreadyRetried = false;
    try {
      alreadyRetried = sessionStorage.getItem(RETRY_KEY) === '1';
      sessionStorage.setItem(RETRY_KEY, '1');
    } catch {
      alreadyRetried = false;
    }
    if (alreadyRetried) return;

    // Offline: a reload would only produce the browser's error page. Stay
    // here and let the visitor retry when the connection is back.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

    // Drop the stale worker and its caches, then come back with a clean slate.
    void (async () => {
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((r) => r.unregister()));
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.filter((k) => k.startsWith('sudtj-')).map((k) => caches.delete(k)));
        }
      } catch {
        /* best effort */
      } finally {
        window.location.reload();
      }
    })();
  }

  private handleRetry = () => {
    try {
      sessionStorage.removeItem(RETRY_KEY);
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-theme-bg text-theme-text">
        <div className="glass glass-card rounded-3xl p-8 sm:p-10 max-w-md text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-theme-gold mb-3">
            Ошибка загрузки
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-theme-text mb-3">
            Не удалось запустить портал
          </h1>
          <p className="text-sm text-theme-textSec leading-relaxed mb-6">
            Обновите страницу — портал загрузится в актуальной версии.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="btn-primary w-full justify-center"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    );
  }
}

export default BootErrorBoundary;
