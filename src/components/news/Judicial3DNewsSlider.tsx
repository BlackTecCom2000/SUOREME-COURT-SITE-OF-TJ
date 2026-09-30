import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Calendar, ArrowUpRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Slider3DConfig,
  Slider3DSlide,
  DEFAULT_SLIDER_3D_CONFIG,
  DEFAULT_SLIDER_3D_SLIDES,
} from '../../types/slider3d';

export interface NewsSlideItem {
  id: string;
  titleRu: string;
  titleTj: string;
  titleEn?: string;
  summaryRu: string;
  summaryTj: string;
  summaryEn?: string;
  date: string;
  categoryRu?: string;
  categoryTj?: string;
  categoryEn?: string;
  image: string;
  url?: string;
  slug?: string;
}

export interface Judicial3DNewsSliderProps {
  onOpenNewsItem?: (item: any) => void;
  onOpenAllNews?: () => void;
  region?: string;
  categoryTj?: string;
  categoryRu?: string;
  categoryEn?: string;
  // Optional configuration overrides for admin preview or customized embedding
  configOverride?: Partial<Slider3DConfig>;
  slidesOverride?: Slider3DSlide[];
  previewLanguage?: 'tj' | 'ru' | 'en';
  previewDark?: boolean;
}

export const Judicial3DNewsSlider: React.FC<Judicial3DNewsSliderProps> = ({
  onOpenNewsItem,
  onOpenAllNews,
  region,
  categoryTj,
  categoryRu,
  categoryEn,
  configOverride,
  slidesOverride,
  previewLanguage,
  previewDark,
}) => {
  const { language: ctxLanguage } = useLanguage();
  const { isDark: ctxDark } = useTheme();

  const language = previewLanguage || ctxLanguage || 'tj';
  const isDark = previewDark !== undefined ? previewDark : ctxDark;

  const [config, setConfig] = useState<Slider3DConfig>({
    ...DEFAULT_SLIDER_3D_CONFIG,
    ...configOverride,
  });

  const [slides, setSlides] = useState<NewsSlideItem[]>(() => {
    const initial = slidesOverride || DEFAULT_SLIDER_3D_SLIDES;
    return initial.map((s) => ({
      id: String(s.id),
      titleTj: s.titleTj,
      titleRu: s.titleRu,
      titleEn: s.titleEn || s.titleRu,
      summaryTj: s.summaryTj,
      summaryRu: s.summaryRu,
      summaryEn: s.summaryEn || s.summaryRu,
      categoryTj: s.categoryTj || 'ХАБАРҲОИ СУДИ ОЛӢ',
      categoryRu: s.categoryRu || 'НОВОСТИ ВЕРХОВНОГО СУДА',
      categoryEn: s.categoryEn || 'SUPREME COURT NEWS',
      date: s.dateText || '2026',
      image: s.imageUrl,
      url: s.linkUrl,
    }));
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const [tiltOffset, setTiltOffset] = useState({ x: 0, y: 0 });
  const sliderRef = useRef<HTMLDivElement>(null);

  // Sync config override changes
  useEffect(() => {
    if (configOverride) {
      setConfig((prev) => ({ ...prev, ...configOverride }));
    }
  }, [configOverride]);

  // Sync slides override changes
  useEffect(() => {
    if (slidesOverride) {
      setSlides(
        slidesOverride.map((s) => ({
          id: String(s.id),
          titleTj: s.titleTj,
          titleRu: s.titleRu,
          titleEn: s.titleEn || s.titleRu,
          summaryTj: s.summaryTj,
          summaryRu: s.summaryRu,
          summaryEn: s.summaryEn || s.summaryRu,
          categoryTj: s.categoryTj || 'ХАБАРҲОИ СУДИ ОЛӢ',
          categoryRu: s.categoryRu || 'НОВОСТИ ВЕРХОВНОГО СУДА',
          categoryEn: s.categoryEn || 'SUPREME COURT NEWS',
          date: s.dateText || '2026',
          image: s.imageUrl,
          url: s.linkUrl,
        }))
      );
    }
  }, [slidesOverride]);

  // Fetch dynamic data from API if no overrides provided
  useEffect(() => {
    if (slidesOverride || configOverride) return;

    let isMounted = true;
    const url = region
      ? `/api/slider-3d?region=${encodeURIComponent(region)}`
      : '/api/slider-3d';

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;

        if (data.config) {
          setConfig((prev) => ({ ...prev, ...data.config }));
        }

        if (Array.isArray(data.slides) && data.slides.length > 0) {
          const mapped: NewsSlideItem[] = data.slides.map((item: any) => ({
            id: String(item.id),
            titleTj: item.titleTj || item.title_tj || '',
            titleRu: item.titleRu || item.title_ru || '',
            titleEn: item.titleEn || item.title_en || item.titleRu || item.title_ru || '',
            summaryTj: item.summaryTj || item.summary_tj || '',
            summaryRu: item.summaryRu || item.summary_ru || '',
            summaryEn: item.summaryEn || item.summary_en || item.summaryRu || item.summary_ru || '',
            categoryTj: item.categoryTj || item.category_tj || categoryTj || 'ХАБАРҲОИ СУДИ ОЛӢ',
            categoryRu: item.categoryRu || item.category_ru || categoryRu || 'НОВОСТИ ВЕРХОВНОГО СУДА',
            categoryEn: item.categoryEn || item.category_en || categoryEn || 'SUPREME COURT NEWS',
            date: item.dateText || item.date_text || '2026',
            image: item.imageUrl || item.image_url || '/supreme-court-night.jpg',
            url: item.linkUrl || item.link_url || undefined,
            slug: item.slug,
          }));
          setSlides(mapped);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [region, categoryRu, categoryTj, categoryEn, slidesOverride, configOverride]);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (total || 1));
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + (total || 1)) % (total || 1));
  }, [total]);

  // Autoplay timer
  useEffect(() => {
    if (!config.autoplay || !isPlaying || isDragging || total <= 1 || (config.pauseOnHover && isHovered)) {
      return;
    }
    const intervalSec = Math.max(2, config.interval || 6);
    const interval = setInterval(nextSlide, intervalSec * 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isDragging, total, nextSlide, config.autoplay, config.interval, config.pauseOnHover, isHovered]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (slides[currentIndex]) onOpenNewsItem?.(slides[currentIndex]);
    }
  };

  // Mouse drag & touch swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!config.dragEnabled) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragDistance(0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && config.dragEnabled) {
      setDragDistance(e.clientX - dragStartX);
    }
    // Subtle parallax tilt on hover
    if (config.tiltEnabled && sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTiltOffset({ x: x * 6, y: y * -6 });
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      if (dragDistance > 45) {
        prevSlide();
      } else if (dragDistance < -45) {
        nextSlide();
      }
      setIsDragging(false);
      setDragDistance(0);
    }
  };

// Helper to convert ALL-CAPS titles into comfortable readable sentence case
const toReadableTitle = (text: string): string => {
  if (!text) return '';
  const trimmed = text.trim();
  const letters = trimmed.replace(/[^a-zA-Zа-яёА-ЯЁҷҶӣӢӯӮғҒҳҲқҚ]/g, '');
  if (letters.length > 5) {
    const upperCount = (letters.match(/[A-ZА-ЯЁҶӢӮҒҲҚ]/g) || []).length;
    if (upperCount / letters.length > 0.6) {
      const words = trimmed.split(/\s+/);
      const abbreviations = new Set(['ҷт', 'смм', 'идм', 'рф', 'мвд', 'вкд', 'вс', 'суд.тҷ', 'sud.tj', '3d', '№1', '№2', '№3', 'ссб']);
      const formatted = words.map((w, idx) => {
        const clean = w.toLowerCase().replace(/[^a-zA-Zа-яёА-ЯЁҷҶӣӢӯӮғҒҳҲқҚ]/g, '');
        if (abbreviations.has(clean)) {
          return w.toUpperCase();
        }
        const lower = w.toLowerCase();
        if (idx === 0 || /^["'«“]/.test(w)) {
          return lower.replace(/^([^a-zA-Zа-яёА-ЯЁҷҶӣӢӯӮғҒҳҲқҚ]*)([a-zA-Zа-яёА-ЯЁҷҶӣӢӯӮғҒҳҲқҚ])/, (_, prefix, first) => {
            return prefix + first.toUpperCase();
          });
        }
        return lower;
      });
      return formatted.join(' ');
    }
  }
  return trimmed;
};

  // Header badge text
  const badgeText =
    language === 'tj'
      ? config.badgeTextTj || 'Хабарҳои асосӣ // 3D Карусел'
      : language === 'en'
      ? config.badgeTextEn || 'Featured News // 3D Slider'
      : config.badgeTextRu || 'Главные новости // 3D Слайдер';

  // Read more text
  const readMoreText =
    language === 'tj'
      ? config.readMoreTextTj || 'Муфассал хондан'
      : language === 'en'
      ? config.readMoreTextEn || 'Read Full Story'
      : config.readMoreTextRu || 'Читать подробнее';

  // All news text
  const allNewsText =
    language === 'tj'
      ? config.allNewsTextTj || 'Ҳамаи хабарҳо'
      : language === 'en'
      ? config.allNewsTextEn || 'All News'
      : config.allNewsTextRu || 'Все новости';

  // Card theme helper
  const getCardThemeClasses = (_isCenter: boolean = false) => {
    switch (config.cardTheme) {
      case 'dark':
        return isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-slate-900 text-white border-slate-700';
      case 'solid':
        return isDark ? 'bg-[#060c18] border-[#1e293b]' : 'bg-[#0f172a] text-white border-[#334155]';
      case 'gold_bordered':
        return isDark ? 'bg-[#070b14]/90 border-[#dfbe7e]/50' : 'bg-[#181308]/90 text-white border-[#dfbe7e]/70';
      case 'cyber':
        return isDark ? 'bg-[#040d1a]/90 border-cyan-500/50' : 'bg-[#081528]/90 text-white border-cyan-400/60';
      case 'glass':
      default:
        return isDark ? 'bg-[#040813]/90 backdrop-blur-md' : 'bg-[var(--glass-surface-strong)] glass backdrop-blur-md';
    }
  };

  // Active Glow Styles
  const getActiveGlowStyle = () => {
    const borderColor = config.activeBorderColor || '#dfbe7e';
    const glowColor = config.glowColor || 'rgba(223, 190, 126, 0.6)';

    let boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    if (config.glowIntensity === 'soft') {
      boxShadow = `0 12px 30px rgba(0,0,0,0.6), 0 0 16px ${glowColor}`;
    } else if (config.glowIntensity === 'medium') {
      boxShadow = `0 18px 45px rgba(0,0,0,0.7), 0 0 28px ${glowColor}`;
    } else if (config.glowIntensity === 'strong') {
      boxShadow = `0 24px 60px rgba(0,0,0,0.85), 0 0 40px ${glowColor}, 0 0 10px ${borderColor}`;
    }

    return {
      borderColor,
      boxShadow,
    };
  };

  const stageHeightPx = config.stageHeight || 400;
  const cardWidthPx = config.cardWidth || 660;
  const cardHeightPx = config.cardHeight || 370;
  const cardRadiusPx = config.cardRadius || 24;
  const perspectivePx = config.perspective || 1200;

  return (
    <div
      ref={sliderRef}
      role="region"
      aria-label={language === 'tj' ? 'Слайдери 3D-и хабарҳои асосӣ' : language === 'en' ? '3D Judicial News Slider' : '3D-слайдер главных новостей'}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handlePointerUp();
        setTiltOffset({ x: 0, y: 0 });
      }}
      className="relative w-full overflow-hidden select-none py-4 outline-none focus-visible:ring-1 focus-visible:ring-theme-gold rounded-3xl"
      style={{ perspective: `${perspectivePx}px` }}
    >
      {/* Top Header Control Bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        {config.showBadge ? (
          <div className="flex items-center gap-2 font-mono text-xs text-theme-gold">
            <Sparkles size={14} />
            <span className="font-bold uppercase tracking-wider">{badgeText}</span>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          {/* Pagination Counter */}
          {config.showCounter && (
            <span className="font-mono text-xs text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-full border border-white/10 mr-1 shadow-sm">
              {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          )}

          {/* Autoplay Pause/Play */}
          {config.showPlayPause && (
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
              className="btn-icon w-8 h-8 rounded-full"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            </button>
          )}

          {/* Prev / Next Buttons */}
          {config.showArrows && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous News"
                className="btn-icon w-8 h-8 rounded-full"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next News"
                className="btn-icon w-8 h-8 rounded-full"
              >
                <ChevronRight size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3D Visual Carousel Stage */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{ height: `${stageHeightPx}px` }}
      >
        {slides.map((item, idx) => {
          let diff = (idx - currentIndex + total) % total;
          if (diff > total / 2) diff -= total;

          const isCenter = diff === 0;
          const isLeft = diff === -1 || (currentIndex === 0 && idx === total - 1);
          const isRight = diff === 1 || (currentIndex === total - 1 && idx === 0);
          const isVisible = isCenter || isLeft || isRight;

          if (!isVisible) return null;

          // 3D Transformations based on config
          let translateX = 0;
          let translateZ = 0;
          let rotateY = 0;
          let scale = 1;
          let opacity = 1;
          let zIndex = 20;

          const sideOffsetX = config.sideOffsetX ?? 280;
          const sideOffsetZ = config.sideOffsetZ ?? -120;
          const sideRotateY = config.sideRotateY ?? 18;
          const sideScale = config.sideScale ?? 0.88;
          const sideOpacity = config.sideOpacity ?? 0.70;

          if (isCenter) {
            translateX = dragDistance * 0.4;
            translateZ = 40;
            rotateY = tiltOffset.x * 0.5;
            scale = 1;
            opacity = 1;
            zIndex = 30;
          } else if (isLeft) {
            translateX = -sideOffsetX + dragDistance * 0.2;
            translateZ = sideOffsetZ;
            rotateY = sideRotateY;
            scale = sideScale;
            opacity = sideOpacity;
            zIndex = 10;
          } else if (isRight) {
            translateX = sideOffsetX + dragDistance * 0.2;
            translateZ = sideOffsetZ;
            rotateY = -sideRotateY;
            scale = sideScale;
            opacity = sideOpacity;
            zIndex = 10;
          }

          const rawTitle = language === 'en' ? (item.titleEn || item.titleRu) : language === 'tj' ? item.titleTj : item.titleRu;
          const title = toReadableTitle(rawTitle);
          const summary = language === 'en' ? (item.summaryEn || item.summaryRu) : language === 'tj' ? item.summaryTj : item.summaryRu;
          const category = language === 'en' ? (item.categoryEn || item.categoryRu) : language === 'tj' ? item.categoryTj : item.categoryRu;

          const activeStyle = isCenter ? getActiveGlowStyle() : {};

          return (
            <div
              key={item.id || `slide-${idx}`}
              onClick={() => {
                if (isCenter) {
                  onOpenNewsItem?.(item);
                } else if (isLeft) {
                  prevSlide();
                } else if (isRight) {
                  nextSlide();
                }
              }}
              className={`
                absolute w-[92%] overflow-hidden cursor-pointer
                border transition-all duration-500 ease-out will-change-transform group
                ${!isCenter ? 'border-white/10 hover:border-white/30' : ''}
                ${getCardThemeClasses(isCenter)}
              `}
              style={{
                maxWidth: `${cardWidthPx}px`,
                height: `${cardHeightPx}px`,
                borderRadius: `${cardRadiusPx}px`,
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) rotateX(${isCenter && config.tiltEnabled ? tiltOffset.y * 0.5 : 0}deg) scale(${scale})`,
                opacity,
                zIndex,
                transformStyle: 'preserve-3d',
                ...activeStyle,
              }}
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img
                  src={item.image}
                  alt={title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  style={{ opacity: `${(100 - (config.imageOverlayOpacity ?? 40)) / 100}` }}
                />
                {/* Contrast protection scrim for text readability */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#020612] via-[#020612]/80 to-transparent transition-opacity duration-500"
                  style={{
                    opacity: `${Math.max(0.7, (config.imageOverlayOpacity ?? 60) / 100)}`,
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-black/95 via-black/75 to-transparent pointer-events-none" />
              </div>

              {/* Slide Content Layer */}
              <div className="relative z-10 w-full h-full p-6 sm:p-8 flex flex-col justify-end text-left slide-dark-scrim">
                <div className="flex items-center gap-2 mb-2 font-mono text-2xs sm:text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider shadow-sm">
                    {category}
                  </span>
                  <span className="flex items-center gap-1 text-slate-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    <Calendar size={11} /> {item.date}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base sm:text-xl md:text-2xl text-white group-hover:text-amber-300 transition-colors line-clamp-3 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mb-2">
                  {title}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-slate-200/90 line-clamp-2 leading-relaxed mb-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {summary}
                </p>

                {isCenter && (
                  <div className="flex items-center gap-2">
                    {config.showReadMore && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenNewsItem?.(item);
                        }}
                        className="btn-primary text-xs !py-1.5 !px-4"
                      >
                        <span>{readMoreText}</span>
                        <ArrowUpRight size={13} />
                      </button>
                    )}
                    {config.showAllNews && onOpenAllNews && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAllNews();
                        }}
                        className="btn-ghost text-xs font-mono"
                      >
                        <span>{allNewsText}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Dots Indicator */}
      {config.showDots && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {slides.map((_, dotIdx) => (
            <button
              key={`dot-${dotIdx}`}
              type="button"
              onClick={() => setCurrentIndex(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className={`tap-target h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === dotIdx
                  ? 'w-7 bg-theme-gold shadow-[0_0_8px_rgba(223,190,126,0.6)]'
                  : 'w-2 bg-theme-border hover:bg-theme-gold/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Judicial3DNewsSlider;
