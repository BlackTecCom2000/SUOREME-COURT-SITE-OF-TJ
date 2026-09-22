import React, { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';

// Vendor Turn.js r3 (MIT) + jQuery slim are served locally from /lib
// (offline-safe). Loaded once, then cached on window.
function loadTurnLibs(): Promise<any> {
  const w = window as any;
  if (w.__turnLibPromise) return w.__turnLibPromise;
  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[data-turnlib="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.dataset.turnlib = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  w.__turnLibPromise = (async () => {
    if (!w.jQuery) await loadScript('/lib/jquery.min.js');
    if (!(w.jQuery && w.jQuery.fn && w.jQuery.fn.turn)) {
      await loadScript('/lib/turn.min.js');
    }
    if (!(w.jQuery && w.jQuery.fn && w.jQuery.fn.turn)) {
      throw new Error('turn.js plugin missing');
    }
    return w.jQuery;
  })().catch((e: any) => {
    w.__turnLibPromise = null;
    throw e;
  });
  return w.__turnLibPromise;
}

export interface TurnFlipBookHandle {
  next: () => void;
  prev: () => void;
  goTo: (page: number) => void;
  totalPages: () => number;
  resize: () => void;
}

interface TurnFlipBookProps {
  bookKey: string;
  mode: 'single' | 'double';
  coverFront: React.ReactNode;
  coverBack: React.ReactNode;
  pages: React.ReactNode[];
  initialPage?: number;
  aspect?: number | null;
  onFlip?: (page: number, total: number) => void;
  onReady?: () => void;
  onError?: (message: string) => void;
}

// Authentic Turn.js flipbook: hard front/back covers + turning leaves.
// Container remounts per bookKey+mode (fresh element each time, since
// turn.js r3 has no destroy method); StrictMode double-invoke is guarded
// per element via __turnReady.
export const TurnFlipBook = forwardRef<TurnFlipBookHandle, TurnFlipBookProps>(
  ({ bookKey, mode, coverFront, coverBack, pages, initialPage, aspect, onFlip, onReady, onError }, ref) => {
    const wrapRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<HTMLDivElement>(null);
    const onFlipRef = useRef(onFlip);
    onFlipRef.current = onFlip;
    const apiRef = useRef<{ $: any; el: HTMLElement } | null>(null);

    const total = pages.length + 2;
    const step = mode === 'single' ? 1 : 2;

    useImperativeHandle(
      ref,
      () => ({
        next: () => {
          const api = apiRef.current;
          if (!api) return;
          try { if (api.$(api.el).turn('animating')) return; } catch {}
          const cur = api.$(api.el).turn('page') as number;
          api.$(api.el).turn('page', Math.min(cur + step, total));
        },
        prev: () => {
          const api = apiRef.current;
          if (!api) return;
          try { if (api.$(api.el).turn('animating')) return; } catch {}
          const cur = api.$(api.el).turn('page') as number;
          api.$(api.el).turn('page', Math.max(cur - step, 1));
        },
        goTo: (page: number) => {
          const api = apiRef.current;
          if (!api) return;
          api.$(api.el).turn('page', Math.min(Math.max(page, 1), total));
        },
        totalPages: () => total,
        resize: () => {
          const api = apiRef.current;
          if (!api || !bookRef.current || !wrapRef.current) return;
          const wrap = wrapRef.current;
          const w = Math.max(Math.min(wrap.clientWidth || 880, 920), 280);
          const ratio = aspect || 0.62;
          const h = mode === 'double' ? Math.round((w / 2) * ratio) : Math.round(w * ratio);
          try {
            api.$(api.el).turn('size', w, h);
          } catch {
            /* not ready yet */
          }
        },
      }),
      [total, step, aspect, mode]
    );

    useEffect(() => {
      const el = bookRef.current;
      const wrap = wrapRef.current;
      if (!el || !wrap) return;
      let cancelled = false;

      const measure = () => {
        const w = Math.min(wrap.clientWidth || 880, 920);
        const hW = Math.max(w, 280);
        const ratio = aspect || 0.62;
        const h = mode === 'double' ? Math.round((hW / 2) * ratio) : Math.round(hW * ratio);
        return { w: hW, h };
      };

      const onResize = () => {
        const api = apiRef.current;
        if (!api || !bookRef.current) return;
        const { w, h } = measure();
        try {
          api.$(api.el).turn('size', w, h);
        } catch {
          /* not ready yet */
        }
      };

      loadTurnLibs()
        .then(($) => {
          if (cancelled || !bookRef.current || bookRef.current !== el) return;
          if ((el as any).__turnReady) {
            apiRef.current = { $, el };
            return;
          }
          const { w, h } = measure();
          $(el).turn({
            width: w,
            height: h,
            display: mode,
            duration: 800,
            acceleration: true,
            gradients: true,
          });
          (el as any).__turnReady = true;
          apiRef.current = { $, el };
          $(el).bind('turned', (_e: any, page: number) => {
            onFlipRef.current?.(page, total);
          });
          const startAt = Math.min(Math.max(initialPage || 1, 1), total);
          if (startAt > 1) {
            try {
              $(el).turn('page', startAt);
            } catch {
              /* ignore */
            }
          }
          onFlipRef.current?.(startAt, total);
          onReady?.();
          window.addEventListener('resize', onResize);
        })
        .catch((e: any) => {
          onError?.(String(e?.message || e));
        });

      return () => {
        cancelled = true;
        window.removeEventListener('resize', onResize);
        apiRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookKey, mode]);

    return (
      <div ref={wrapRef} className="tflip-wrap">
        <div key={bookKey + '-' + mode} ref={bookRef} className="tflip-book">
          <div className="tflip-hard tflip-front">{coverFront}</div>
          {pages}
          <div className="tflip-hard tflip-back">{coverBack}</div>
        </div>
      </div>
    );
  }
);

TurnFlipBook.displayName = 'TurnFlipBook';

export default TurnFlipBook;
