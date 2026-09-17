import React, { useState, useRef, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, Moon, Sun, ArrowLeftRight, Maximize2, LayoutGrid, Layers, List, FileText, Lock } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { PreviewComponentMapper, placementsForType, PreviewPlacement } from './PreviewComponentMapper';
import { motion } from 'motion/react';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface LivePreviewEngineProps {
  type: string;
  data: any;
  originalData?: any;
}

export const LivePreviewEngine: React.FC<LivePreviewEngineProps> = ({ type, data, originalData }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [showComparison, setShowComparison] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [placement, setPlacement] = useState<PreviewPlacement>(() => placementsForType(type)[0]);

  const placementTabs: Array<{ id: PreviewPlacement; icon: React.ReactNode; tj: string; ru: string; en: string }> = [
    { id: 'slider', icon: <Layers size={13} />, tj: 'Слайдер', ru: 'Слайдер', en: 'Slider' },
    { id: 'card', icon: <LayoutGrid size={13} />, tj: 'Корт', ru: 'Карточка', en: 'Card' },
    { id: 'row', icon: <List size={13} />, tj: 'Сатр', ru: 'Строка', en: 'Row' },
    { id: 'detail', icon: <FileText size={13} />, tj: 'Саҳифа', ru: 'Страница', en: 'Page' },
  ];
  const availablePlacements = placementsForType(type);

  // Real URL shown in the browser chrome per placement
  const previewUrl =
    placement === 'detail'
      ? 'sud.tj/' + type + '/' + (data?.slug || '…')
      : placement === 'slider'
      ? 'sud.tj — 3D carousel'
      : placement === 'row'
      ? 'sud.tj/courts — press row'
      : 'sud.tj — press modal';

  // Scale-to-fit: measure stage width so tablet/phone frames never overflow
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageW, setStageW] = useState(0);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setStageW(entries[0].contentRect.width));
    ro.observe(el);
    setStageW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const MODE_W = viewport === 'tablet' ? 768 : viewport === 'mobile' ? 406 : 0;
  const CONTENT_H = viewport === 'tablet' ? 860 : viewport === 'mobile' ? 700 : 0;
  const CHROME_H = 46;
  const fitScale = viewport === 'desktop' || stageW <= 0 ? 1 : Math.min(1, (stageW - 4) / MODE_W);

  const BrowserChrome = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex items-center gap-2 px-3 bg-theme-surface/90 backdrop-blur-md border-b border-theme-border/60 shrink-0" style={{ height: CHROME_H }}>
      {!compact && (
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
        </span>
      )}
      <span className="flex-1 flex items-center justify-center gap-1.5 min-w-0 rounded-lg bg-theme-bg/70 border border-theme-border/40 px-3 py-1 font-mono text-[10px] sm:text-[11px] text-theme-textSec truncate">
        <Lock size={10} className="text-emerald-400 shrink-0" />
        <span className="truncate">{previewUrl}</span>
      </span>
      {!compact && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-theme-gold shrink-0 hidden sm:inline">
          {viewport}
        </span>
      )}
    </div>
  );

  const isDark = theme === 'dark';

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-3 border-b border-theme-border/50 bg-theme-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-theme-gold uppercase tracking-widest font-bold px-2">
          LIVE PREVIEW
        </span>
        <div className="h-4 w-px bg-theme-border mx-2" />
        
        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-theme-bg/50 p-1 rounded-lg border border-theme-border/30">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-md transition-colors ${viewport === 'desktop' ? 'bg-theme-surface text-theme-gold shadow-sm' : 'text-theme-textSec hover:text-theme-text'}`}
            title="Desktop Preview"
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-md transition-colors ${viewport === 'tablet' ? 'bg-theme-surface text-theme-gold shadow-sm' : 'text-theme-textSec hover:text-theme-text'}`}
            title="Tablet Preview"
          >
            <Tablet size={14} />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-md transition-colors ${viewport === 'mobile' ? 'bg-theme-surface text-theme-gold shadow-sm' : 'text-theme-textSec hover:text-theme-text'}`}
            title="Mobile Preview"
          >
            <Smartphone size={14} />
          </button>
        </div>

        {/* Placement Switcher: where this will appear on the site */}
        {availablePlacements.length > 1 && (
          <div className="flex items-center gap-1 bg-theme-bg/50 p-1 rounded-lg border border-theme-border/30 ml-1">
            {placementTabs.filter((pt) => availablePlacements.includes(pt.id)).map((pt) => (
              <button
                key={pt.id}
                onClick={() => setPlacement(pt.id)}
                title={language === 'tj' ? pt.tj : language === 'en' ? pt.en : pt.ru}
                className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${placement === pt.id ? 'bg-theme-surface text-theme-gold shadow-sm' : 'text-theme-textSec hover:text-theme-text'}`}
              >
                {pt.icon}
                <span className="text-[10px] font-bold uppercase hidden 2xl:block">
                  {language === 'tj' ? pt.tj : language === 'en' ? pt.en : pt.ru}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <div className="relative flex items-center gap-1 bg-theme-bg/50 p-1 rounded-lg border border-theme-border/30">
          {(['tj', 'ru', 'en'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`relative px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-colors z-10 ${
                language === lang ? 'text-theme-gold' : 'text-theme-textSec hover:text-theme-text'
              }`}
            >
              {language === lang && (
                <motion.div
                  layoutId="activeLivePreviewLangPill"
                  className="absolute inset-0 bg-theme-surface rounded-md shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <span>{lang}</span>
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-theme-border" />

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-theme-textSec hover:text-theme-gold transition-colors"
          title="Toggle Day/Night Mode"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Comparison Toggle */}
        {originalData && (
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${showComparison ? 'bg-theme-gold/20 text-theme-gold' : 'text-theme-textSec hover:text-theme-gold'}`}
            title="Compare with Published Version"
          >
            <ArrowLeftRight size={16} />
            <span className="text-[10px] font-bold uppercase hidden xl:block">Compare</span>
          </button>
        )}

        <div className="h-4 w-px bg-theme-border" />

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-lg text-theme-textSec hover:text-theme-gold transition-colors"
          title="Fullscreen Preview"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );

  const previewContent = (
    <div className={`flex flex-col bg-theme-bg overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-[9999]' : 'h-full rounded-2xl border border-theme-border'}`}>
      {renderToolbar()}
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-theme-bg/30 relative p-4">
        {/* Ambient gold glow for stage presence */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-theme-gold/10 blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMTUwLCAxNTAsIDE1MCwgMC4xKSIvPjwvc3ZnPg==')] pointer-events-none opacity-50 dark:opacity-20" />
        </div>

        {showComparison ? (
          <div className="relative z-10 flex w-full gap-4">
            {/* Published Version */}
            <div className="flex-1 border border-theme-border/50 rounded-xl overflow-hidden flex flex-col shadow-xl min-w-0">
              <div className="bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center py-1 border-b border-red-500/20">
                Published Version
              </div>
              <div className="h-[560px] overflow-y-auto">
                <PreviewComponentMapper type={type} data={originalData} placement={placement} />
              </div>
            </div>
            {/* Current Draft */}
            <div className="flex-1 border border-theme-gold/50 rounded-xl overflow-hidden flex flex-col shadow-xl shadow-theme-gold/5 min-w-0">
              <div className="bg-theme-gold/10 text-theme-gold text-[10px] font-bold uppercase tracking-widest text-center py-1 border-b border-theme-gold/20">
                Current Draft
              </div>
              <div className="h-[560px] overflow-y-auto">
                <PreviewComponentMapper type={type} data={data} placement={placement} />
              </div>
            </div>
          </div>
        ) : viewport === 'desktop' ? (
          <div className="relative z-10 w-full rounded-2xl overflow-hidden border border-theme-border/60 shadow-2xl bg-theme-bg flex flex-col" style={{ minHeight: 480 }}>
            <BrowserChrome />
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: 640 }}>
              <PreviewComponentMapper type={type} data={data} placement={placement} />
            </div>
          </div>
        ) : (
          /* Tablet / phone: fixed frame scaled to fit, sides never cut */
          <div ref={stageRef} className="relative z-10 w-full overflow-hidden flex justify-center">
            <div
              style={{
                width: MODE_W,
                height: (CONTENT_H + CHROME_H) * fitScale,
                transform: 'scale(' + fitScale + ')',
                transformOrigin: 'top center',
                flexShrink: 0,
              }}
            >
              <div
                style={{ width: MODE_W, height: CONTENT_H + CHROME_H }}
                className={'overflow-hidden bg-theme-bg flex flex-col shadow-2xl border-theme-border/70 ' + (viewport === 'mobile' ? 'border-8 rounded-[3rem]' : 'border-x border-t rounded-t-2xl')}
              >
                <BrowserChrome compact={viewport === 'mobile'} />
                <div className="flex-1 overflow-y-auto" style={{ height: CONTENT_H }}>
                  <PreviewComponentMapper type={type} data={data} placement={placement} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return previewContent;
};
