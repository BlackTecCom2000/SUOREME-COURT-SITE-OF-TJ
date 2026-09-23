import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Download, FileText, Volume2, VolumeX, Pause, Play, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Copy, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { pickTri } from '../../sites/types';
import type { ShelfBook } from './LawBookshelf';
import { getBestVoice, splitIntoChunks } from '../../utils/speech';

declare global {
  interface Window {
    pdfjsLib?: any;
    __pdfLibPromise?: Promise<any> | null;
  }
}

function loadPdfLib(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.__pdfLibPromise) return window.__pdfLibPromise;
  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[data-pdflib="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src; s.async = false; s.dataset.pdflib = src;
      s.onload = () => resolve(); s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  window.__pdfLibPromise = (async () => {
    if (!window.pdfjsLib) await loadScript('/lib/pdf.min.js');
    if (!window.pdfjsLib) throw new Error('pdf.js missing');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/lib/pdf.worker.min.js';
    return window.pdfjsLib;
  })().catch((e: any) => { window.__pdfLibPromise = null; throw e; });
  return window.__pdfLibPromise;
}

const PAGE_CHARS = 1400;

function paginate(text: string): string[] {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const pages: string[] = []; let cur = '';
  for (const p of paras) {
    if ((cur + '\n\n' + p).length > PAGE_CHARS && cur) { pages.push(cur.trim()); cur = p; }
    else cur = cur ? cur + '\n\n' + p : p;
  }
  if (cur.trim()) pages.push(cur.trim());
  const out: string[] = [];
  for (const pg of pages) {
    if (pg.length <= PAGE_CHARS * 1.6) { out.push(pg); continue; }
    for (let i = 0; i < pg.length; i += PAGE_CHARS) out.push(pg.slice(i, i + PAGE_CHARS));
  }
  return out.map((s) => s.trim()).filter(Boolean);
}



interface FoliantReaderProps {
  bookKey: string;
  book: ShelfBook;
  kindLabel: string;
  textContent: string | null | undefined;
  pdfUrl: string | null;
  downloadUrl?: string | null;
  loading: boolean;
  initialPage?: number;
  onPage?: (page: number, total: number) => void;
}

export const FoliantReader: React.FC<FoliantReaderProps> = ({
  bookKey, book, kindLabel, textContent, pdfUrl, downloadUrl, loading,
}) => {
  const { language, setLanguage } = useLanguage();
  const [pdfImages, setPdfImages] = useState<Record<number, string>>({});
  const [pdfTexts, setPdfTexts] = useState<Record<number, string>>({});
  const [pdfTotal, setPdfTotal] = useState(0);
  const [pdfFailed, setPdfFailed] = useState(false);
  // PERF: width/height ratio captured once from the first decoded page so every
  // page slot reserves its final space up-front (no layout shift as pages stream in).
  const [pdfRatio, setPdfRatio] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const foliantRef = useRef<HTMLDivElement>(null);

  // TTS state — free, human-like, no keys
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeChunk, setActiveChunk] = useState<number>(-1);
  const chunksRef = useRef<string[]>([]);
  const chunkIdxRef = useRef(0);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const L = (tj: string, ru: string, en: string) =>
    language === 'tj' ? tj : language === 'en' ? en : ru;

  const title = pickTri(book.title, language);

  // Ensure voices are loaded (Chrome lazy)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const upd = () => { voiceRef.current = getBestVoice(language); };
    upd();
    window.speechSynthesis.onvoiceschanged = upd;
    // also poll once
    const id = window.setTimeout(upd, 500);
    return () => window.clearTimeout(id);
  }, [language]);

  // Cleanup speech on unmount/book change
  useEffect(() => () => {
    try { window.speechSynthesis?.cancel(); } catch {}
    setIsSpeaking(false); setIsPaused(false); setActiveChunk(-1);
  }, [bookKey]);

  const stopSpeech = useCallback(() => {
    try { window.speechSynthesis?.cancel(); } catch {}
    setIsSpeaking(false); setIsPaused(false); setActiveChunk(-1);
    chunkIdxRef.current = 0;
  }, []);

  const speakChunk = useCallback((idx: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const chunks = chunksRef.current;
    if (idx >= chunks.length) { stopSpeech(); return; }
    chunkIdxRef.current = idx;
    setActiveChunk(idx);
    const utter = new SpeechSynthesisUtterance(chunks[idx]);
    const best = getBestVoice(language) || voiceRef.current;
    if (best) utter.voice = best;
    // Map language to BCP47
    utter.lang = language === 'tj' ? 'ru-RU' : language === 'en' ? 'en-US' : 'ru-RU';
    // Human charisma tuning: slight slower + pitch variation = more natural
    utter.rate = 0.95;
    utter.pitch = 1.02;
    utter.volume = 1;
    utter.onend = () => {
      if (!window.speechSynthesis) return;
      // small pause between chunks for breathing
      setTimeout(() => speakChunk(idx + 1), 120);
    };
    utter.onerror = () => stopSpeech();
    try { window.speechSynthesis.speak(utter); } catch { stopSpeech(); }
  }, [language, stopSpeech]);

  const startSpeech = useCallback((fullText: string) => {
    if (!fullText.trim() || typeof window === 'undefined' || !window.speechSynthesis) {
      setToast(L('Синтезатор дастрас нест', 'Синтезатор недоступен', 'Speech not available'));
      return;
    }
    try { window.speechSynthesis.cancel(); } catch {}
    const chunks = splitIntoChunks(fullText.replace(/\s+/g, ' '), 240);
    chunksRef.current = chunks;
    chunkIdxRef.current = 0;
    setIsSpeaking(true); setIsPaused(false); setActiveChunk(0);
    // Force voice refresh
    voiceRef.current = getBestVoice(language);
    speakChunk(0);
  }, [L, language, speakChunk]);

  const handleTtsToggle = useCallback(() => {
    if (!isSpeaking) {
      // Build full text from current document
      let full = '';
      if (isPdfModeRef.current && Object.keys(pdfTexts).length) {
        full = Object.keys(pdfTexts).sort((a,b)=>Number(a)-Number(b)).map(k=>pdfTexts[Number(k)]).join('\n\n');
      } else if (plainTextRef.current) {
        full = plainTextRef.current;
      }
      if (!full.trim()) full = L('Матн барои хондан нест', 'Нет текста для чтения', 'No text to read');
      startSpeech(full);
    } else if (isPaused) {
      try { window.speechSynthesis.resume(); setIsPaused(false); } catch { stopSpeech(); }
    } else {
      try { window.speechSynthesis.pause(); setIsPaused(true); } catch { stopSpeech(); }
    }
  }, [isSpeaking, isPaused, pdfTexts, L, startSpeech, stopSpeech]);

  // PDF as image pages + hidden selectable text layer
  useEffect(() => {
    if (textContent || !pdfUrl) return;
    let cancelled = false;
    setPdfImages({}); setPdfTexts({}); setPdfTotal(0); setPdfFailed(false); setPdfRatio(null);
    const fetchUrl = /^https?:\/\//i.test(pdfUrl) && !pdfUrl.startsWith(window.location.origin)
      ? `/api/library/pdf?url=${encodeURIComponent(pdfUrl)}`
      : pdfUrl;
    loadPdfLib().then(async (pdfjs) => {
      try {
        const doc = await pdfjs.getDocument({ url: fetchUrl }).promise;
        if (cancelled) return;
        setPdfTotal(doc.numPages);
        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) break;
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 1.4 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width; canvas.height = viewport.height;
          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          // Extract selectable text for copy + TTS
          try {
            const tc = await page.getTextContent();
            const str = (tc.items as any[]).map((it: any) => it.str).join(' ');
            if (str.trim() && !cancelled) setPdfTexts(prev => ({ ...prev, [i]: str }));
          } catch {}
          await page.cleanup();
          const url = canvas.toDataURL('image/webp', 0.85);
          if (!cancelled) setPdfImages(prev => ({ ...prev, [i]: url }));
        }
      } catch { if (!cancelled) setPdfFailed(true); }
    }).catch(() => { if (!cancelled) setPdfFailed(true); });
    return () => { cancelled = true; };
  }, [bookKey, textContent, pdfUrl]);

  const isHtmlContent = useMemo(() => {
    if (!textContent) return false;
    return /<[a-z][\s\S]*>/i.test(textContent) && textContent.includes('>');
  }, [textContent]);

  const plainTextForTts = useMemo(() => {
    if (!textContent) return '';
    if (isHtmlContent) {
      try { const div = document.createElement('div'); div.innerHTML = textContent; return div.textContent || div.innerText || ''; }
      catch { return textContent.replace(/<[^>]*>/g, ' '); }
    }
    return textContent;
  }, [textContent, isHtmlContent]);

  // Refs for TTS to avoid stale closure
  const plainTextRef = useRef(plainTextForTts);
  plainTextRef.current = plainTextForTts;
  const isPdfModeRef = useRef(false);

  const handleCopy = useCallback(async () => {
    let text = '';
    if (isPdfModeRef.current && Object.keys(pdfTexts).length) {
      text = Object.keys(pdfTexts).sort((a,b)=>Number(a)-Number(b)).map(k=>pdfTexts[Number(k)]).join('\n\n');
    } else {
      text = plainTextRef.current || '';
    }
    if (!text.trim()) { setToast(L('Матн барои нусхабардорӣ нест','Нет текста для копирования','No text to copy')); return; }
    try { await navigator.clipboard.writeText(text); setCopied(true); setToast(L('Нусхабардорӣ шуд','Скопировано','Copied')); setTimeout(()=>setCopied(false),1500); } catch { setToast(L('Хатои нусхабардорӣ','Ошибка копирования','Copy failed')); }
  }, [pdfTexts, L]);

  const textPages = useMemo(() => {
    const src = textContent;
    if (!src) return [];
    if (isHtmlContent) return [src]; // render as single HTML block
    return paginate(src);
  }, [textContent, isHtmlContent]);
  const isPdfMode = !textContent && !!pdfUrl && pdfTotal > 0;
  isPdfModeRef.current = isPdfMode;
  const pages = isPdfMode ? Array.from({ length: pdfTotal }, (_, i) => `__pdf:${i + 1}`) : textPages;
  const pdfBusy = !textContent && !!pdfUrl && pdfTotal === 0 && !pdfFailed;
  const busy = loading || pdfBusy;

  useEffect(() => { if (!toast) return; const id = window.setTimeout(() => setToast(null), 1800); return () => window.clearTimeout(id); }, [toast]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      foliantRef.current?.requestFullscreen().catch(() => setToast(L('Полноэкранный режим недоступен','Полноэкранный режим недоступен','Fullscreen unavailable')));
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, [L]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // Zoom shortcuts: Ctrl/Cmd + +/-/0 and Ctrl+wheel, F for fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=' ) { e.preventDefault(); setZoom(z => Math.min(2.4, +(z+0.1).toFixed(2))); }
        else if (e.key === '-' || e.key === '_' ) { e.preventDefault(); setZoom(z => Math.max(0.65, +(z-0.1).toFixed(2))); }
        else if (e.key === '0') { e.preventDefault(); setZoom(1); }
        return;
      }
      if (e.key.toLowerCase() === 'f') { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleFullscreen]);

  // Stop speech on language change to re-pick voice naturally
  useEffect(() => { if (isSpeaking) stopSpeech(); }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={foliantRef} className="foliant foliant-theme-dark">
      {/* Header — ONLY: language switch | read aloud | download */}
      <div className="foliant-head">
        <div className="foliant-head-title">
          <span className="foliant-head-icon"><BookOpen size={15} /></span>
          <div><strong>{title}</strong><span>{kindLabel}</span></div>
        </div>
        <div className="foliant-head-actions" style={{ gap: 8 }}>
          {/* 1) Смена языка — синхронизирована через LanguageContext */}
          <div className="elib-lang" style={{ padding: 2 }} role="group" aria-label={L('Забон','Язык','Language')}>
            {(['tj','ru','en'] as const).map(code => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={language === code ? 'is-active' : ''}
                aria-pressed={language === code}
                aria-label={code.toUpperCase()}
                title={code.toUpperCase()}
                style={{ minWidth: 34, padding: '5px 8px' }}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Zoom — интерактивность размера документа */}
          <div className="hidden sm:flex items-center gap-0.5 rounded-full border border-theme-border bg-theme-surface/60 p-1" role="group" aria-label="Zoom">
            <button type="button" onClick={() => setZoom(z => Math.max(0.6, +(z - 0.1).toFixed(2)))} aria-label="Уменьшить" title="Уменьшить (Ctrl+-)" className="w-7 h-7 grid place-items-center rounded-full hover:bg-theme-gold/15 text-theme-textMuted hover:text-theme-gold"><ZoomOut size={14} /></button>
            <span className="font-mono text-[11px] font-bold text-theme-text w-10 text-center select-none">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom(z => Math.min(2.2, +(z + 0.1).toFixed(2)))} aria-label="Увеличить" title="Увеличить (Ctrl++)" className="w-7 h-7 grid place-items-center rounded-full hover:bg-theme-gold/15 text-theme-textMuted hover:text-theme-gold"><ZoomIn size={14} /></button>
            <button type="button" onClick={() => setZoom(1)} aria-label="Сброс" title="Сброс 100% (Ctrl+0)" className="w-7 h-7 grid place-items-center rounded-full hover:bg-theme-gold/15 text-theme-textMuted hover:text-theme-gold"><RotateCcw size={12} /></button>
          </div>
          {/* Mobile zoom */}
          <div className="flex sm:hidden items-center gap-1">
            <button type="button" onClick={() => setZoom(z => Math.max(0.6, +(z - 0.1).toFixed(2)))} className="w-8 h-8 grid place-items-center rounded-full border border-theme-border text-theme-textMuted"><ZoomOut size={14} /></button>
            <button type="button" onClick={() => setZoom(z => Math.min(2.2, +(z + 0.1).toFixed(2)))} className="w-8 h-8 grid place-items-center rounded-full border border-theme-border text-theme-textMuted"><ZoomIn size={14} /></button>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? L('Баромад','Выйти','Exit fullscreen') : L('Тамоми экран','Полный экран','Fullscreen')}
            title={isFullscreen ? 'Выйти (Esc/F)' : 'Полный экран (F)'}
            aria-pressed={isFullscreen}
            style={{ width: 36, height: 36 }}
            className={isFullscreen ? 'is-speaking' : ''}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* 2) Читать вслух — бесплатный, максимально человечный (Web Speech API, neural voices) */}
          <button
            type="button"
            onClick={handleTtsToggle}
            aria-label={isSpeaking ? (isPaused ? L('Давом','Продолжить','Resume') : L('Таваққуф','Пауза','Pause')) : L('Хондан','Читать вслух','Read aloud')}
            title={isSpeaking ? (isPaused ? L('Давом','Продолжить','Resume') : L('Таваққуф','Пауза','Pause')) : L('Хондан','Читать вслух','Read aloud')}
            aria-pressed={isSpeaking && !isPaused}
            style={{ width: 36, height: 36 }}
            className={isSpeaking ? 'is-speaking' : ''}
          >
            {!isSpeaking ? <Volume2 size={16} /> : isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeech}
              aria-label={L('Қатъ','Стоп','Stop')}
              title={L('Қатъ','Стоп','Stop')}
              style={{ width: 32, height: 32 }}
            >
              <VolumeX size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            aria-label={L('Нусхабардорӣ','Копировать','Copy')}
            title={L('Нусхабардорӣ','Копировать','Copy')}
            style={{ width: 36, height: 36, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:10, border:'1px solid var(--border-primary)', color:'var(--text-muted)' }}
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
          </button>
          {/* 3) Скачать документ */}
          {downloadUrl && (
            <a href={downloadUrl} download aria-label={L('Зеркашӣ','Скачать','Download')} title={L('Зеркашӣ','Скачать','Download')} style={{ width: 36, height: 36, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:10, border:'1px solid var(--border-primary)', color:'var(--text-muted)' }}>
              <Download size={15} />
            </a>
          )}
        </div>
      </div>

      {/* Stage — document scroll only, selectable, interactive */}
      <div className="foliant-stagewrap" onDoubleClick={toggleFullscreen} title={L('Дучанд клик — тамоми экран','Двойной клик — полный экран','Double-click — fullscreen')}>
        <div className="foliant-stage">
          <div className="foliant-ground" aria-hidden="true" />
          {busy ? (
            <div className="tflip-loading" role="status" aria-live="polite">
              <span className="foliant-spinner" aria-hidden="true" />
              <span>{L('Матн бор мешавад...','Загрузка текста...','Loading text...')}</span>
            </div>
          ) : pdfFailed ? (
            <div className="foliant-empty" role="alert">
              <FileText size={22} aria-hidden="true" />
              <p>{L('Хатои боркунии PDF','Ошибка загрузки PDF','PDF load error')}</p>
              {downloadUrl && <a href={downloadUrl} className="foliant-empty-link" download>{L('Скачать файл','Скачать файл','Download file')}</a>}
            </div>
          ) : (
            <div className="foliant-scroll" style={{ userSelect: 'text', perspective: '1200px' } as any} onWheel={(e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); const d = e.deltaY > 0 ? -0.07 : 0.07; setZoom(z => Math.min(2.4, Math.max(0.65, +(z + d).toFixed(2)))); } }}>
              <div className="foliant-scroll-paper" style={{ userSelect: 'text', transform: `scale(${zoom}) translateZ(${zoom > 1 ? (zoom-1)*18 : 0}px)`, transformOrigin: 'top center', transition: 'transform 0.22s cubic-bezier(.2,.8,.2,1)' } as any}>
                {isPdfMode
                  ? Array.from({ length: pdfTotal }, (_, idx) => idx + 1).map(n => {
                      const speakingThis = isSpeaking && pdfTexts[n] && chunksRef.current.join(' ').includes((pdfTexts[n]||'').slice(0,40));
                      return (
                        <div key={n} className={`foliant-scroll-page is-image${speakingThis ? ' is-speaking' : ''}`} style={{ userSelect: 'text' } as any}>
                          {pdfImages[n] ? (
                            <div style={{ position: 'relative', aspectRatio: pdfRatio ? String(pdfRatio) : '3 / 4' }}>
                              <img
                                src={pdfImages[n]}
                                alt={`${L('Стр.','Стр.','P.')} ${n}`}
                                style={{ width:'100%', height:'100%', objectFit:'contain', display:'block', background:'#fff' }}
                                draggable={false}
                                onLoad={(e) => {
                                  if (pdfRatio == null) {
                                    const el = e.currentTarget;
                                    if (el.naturalWidth && el.naturalHeight) setPdfRatio(el.naturalWidth / el.naturalHeight);
                                  }
                                }}
                              />
                              {pdfTexts[n] && (
                                <div aria-hidden="true" style={{ position: 'absolute', inset: 0, color: 'transparent', userSelect: 'text', overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word', padding: '8% 6%', fontSize: '11px', lineHeight: 1.7, opacity: 0.01 } as any}>{pdfTexts[n]}</div>
                              )}
                            </div>
                          ) : <div className="foliant-loading" style={{ aspectRatio: pdfRatio ? String(pdfRatio) : '3 / 4', minHeight: 320 }}><span className="foliant-spinner" /></div>}
                          <span className="foliant-scroll-num">{n}</span>
                        </div>
                      );
                    })
                  : isHtmlContent
                    ? (
                      <div className="foliant-scroll-page foliant-html" style={{ userSelect:'text' } as any}>
                        <div
                          className="foliant-html-content"
                          style={{ userSelect:'text', fontFamily:'Georgia, serif', fontSize:14, lineHeight:1.7, color:'#1c140d' } as any}
                          dangerouslySetInnerHTML={{ __html: textPages[0] as string }}
                        />
                        <span className="foliant-scroll-num">1</span>
                      </div>
                    )
                    : pages.length > 0
                      ? pages.map((pg, i) => {
                          const isActive = isSpeaking && activeChunk >=0 && chunksRef.current[activeChunk] && pg.includes(chunksRef.current[activeChunk].slice(0,30));
                          return (
                            <div key={i} className={`foliant-scroll-page${isActive ? ' is-speaking' : ''}`} style={{ userSelect:'text' } as any}>
                              {pg.split('\n').map((line, j) => <p key={j} style={{ userSelect:'text' } as any}>{line || '\u00a0'}</p>)}
                              <span className="foliant-scroll-num">{i + 1}</span>
                            </div>
                          );
                        })
                      : (
                        <div className="foliant-empty" role="status"><FileText size={22} aria-hidden="true" /><p>{L('Матни пурра ҳоло дар китобхона нест.','Полный текст скоро появится в библиотеке.','Full text coming soon to the library.')}</p></div>
                      )}
              </div>
            </div>
          )}
        </div>
      </div>
      {toast && <div className="foliant-toast" role="status">{toast}</div>}
    </div>
  );
};

export default FoliantReader;
