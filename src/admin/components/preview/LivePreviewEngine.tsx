import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet, Moon, Sun, ArrowLeftRight, Maximize2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { PreviewComponentMapper } from './PreviewComponentMapper';
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

  const isDark = theme === 'dark';

  const viewportStyles = {
    desktop: 'w-full h-full',
    tablet: 'w-[768px] h-full mx-auto shadow-2xl border-x border-theme-border/50',
    mobile: 'w-[390px] h-[844px] mx-auto shadow-2xl border-8 border-theme-border/80 rounded-[3rem] overflow-hidden my-auto',
  };

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
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-theme-bg/30 relative flex items-center justify-center p-4">
        {/* Background Grid Pattern for Contrast */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMTUwLCAxNTAsIDE1MCwgMC4xKSIvPjwvc3ZnPg==')] pointer-events-none opacity-50 dark:opacity-20" />
        
        <div className={`transition-all duration-500 ease-in-out relative z-10 bg-theme-bg flex ${showComparison ? 'w-full gap-4' : viewportStyles[viewport]}`}>
          {showComparison ? (
            <>
              {/* Published Version */}
              <div className="flex-1 border border-theme-border/50 rounded-xl overflow-hidden flex flex-col shadow-xl">
                <div className="bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center py-1 border-b border-red-500/20">
                  Published Version
                </div>
                <div className="flex-1 overflow-y-auto">
                  <PreviewComponentMapper type={type} data={originalData} />
                </div>
              </div>
              
              {/* Current Draft */}
              <div className="flex-1 border border-theme-gold/50 rounded-xl overflow-hidden flex flex-col shadow-xl shadow-theme-gold/5">
                <div className="bg-theme-gold/10 text-theme-gold text-[10px] font-bold uppercase tracking-widest text-center py-1 border-b border-theme-gold/20">
                  Current Draft
                </div>
                <div className="flex-1 overflow-y-auto">
                  <PreviewComponentMapper type={type} data={data} />
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full overflow-y-auto relative">
              <PreviewComponentMapper type={type} data={data} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return previewContent;
};
