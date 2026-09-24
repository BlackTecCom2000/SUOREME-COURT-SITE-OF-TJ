import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Calendar, ArrowUpRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

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

interface Judicial3DNewsSliderProps {
  onOpenNewsItem?: (item: any) => void;
  onOpenAllNews?: () => void;
  region?: string;
  categoryTj?: string;
  categoryRu?: string;
  categoryEn?: string;
}

const DEFAULT_SLIDES: NewsSlideItem[] = [
  {
    id: 'news-1',
    titleTj: 'Тартиби қабули муроҷиатҳои шаҳрвандон дар шакли электронӣ тавассути сомонаи суд.тҷ',
    titleRu: 'Порядок приёма обращений граждан в электронной форме через единый портал sud.tj',
    titleEn: 'Procedure for Receiving Citizen Appeals Electronically via sud.tj Portal',
    summaryTj: 'Суди Олии Ҷумҳурии Тоҷикистон дастури навро оид ба пешниҳоди аризаҳои электронӣ ва бақайдгирии фаврӣ нашр намуд.',
    summaryRu: 'Верховный суд Республики Таджикистан опубликовал обновленный регламент подачи электронных исковых заявлений.',
    summaryEn: 'The Supreme Court published updated guidelines on electronic court claim submissions and instant digital registration.',
    date: '18.08.2026',
    categoryTj: 'СУДИ ЭЛЕКТРОНӢ',
    categoryRu: 'ЭЛЕКТРОННЫЙ СУД',
    categoryEn: 'E-JUSTICE',
    image: '/supreme-court-night.jpg',
  },
  {
    id: 'news-2',
    titleTj: 'Ҷаласаи Пленуми Суди Олии Ҷумҳурии Тоҷикистон оид ба ҷамъбасти амалияи судӣ',
    titleRu: 'Заседание Пленума Верховного суда Республики Таджикистан по обобщению судебной практики',
    titleEn: 'Plenum Session of the Supreme Court on Summary of Judicial Practice',
    summaryTj: 'Дар ҷаласа натиҷаҳои ҷамъбасти амалияи судӣ оид ба татбиқи меъёрҳои қонунгузории оилавӣ ва манзилӣ баррасӣ гардиданд.',
    summaryRu: 'Рассмотрены итоги обобщения судебной практики по применению норм семейного и жилищного законодательства.',
    summaryEn: 'The session reviewed the consolidation of judicial practice regarding family and housing legislation standards.',
    date: '15.08.2026',
    categoryTj: 'ПЛЕНУМИ СУДИ ОЛӢ',
    categoryRu: 'ПЛЕНУМ ВЕРХОВНОГО СУДА',
    categoryEn: 'SUPREME COURT PLENUM',
    image: '/supreme-court-day.jpg',
  },
  {
    id: 'news-3',
    titleTj: 'Баррасии масъалаҳои дастрасии шахсони дорои маъюбият ба адолати судӣ ва инфрасохтори рақамӣ',
    titleRu: 'Обеспечение доступности правосудия для лиц с инвалидностью и цифровая инфраструктура',
    titleEn: 'Ensuring Equal Access to Justice for Persons with Disabilities and Digital Infrastructure',
    summaryTj: 'Ҷорӣ намудани воситаҳои рақамӣ ва интерфейсҳои мутобиқшуда дар биноҳои судҳо ва сомонаҳои расмӣ баррасӣ шуд.',
    summaryRu: 'Внедрение цифровых инструментов и адаптивных интерфейсов в зданиях судов и на веб-порталах республики.',
    summaryEn: 'Implementation of accessible digital portals and assistive judicial technologies across court branches.',
    date: '14.08.2026',
    categoryTj: 'ДАСТРАСИИ СУДӢ',
    categoryRu: 'ДОСТУПНОСТЬ ПРАВОСУДИЯ',
    categoryEn: 'ACCESS TO JUSTICE',
    image: '/themis-background.jpg',
  },
  {
    id: 'news-4',
    titleTj: 'Нашри шумораи нави нашрияи расмии Суди Олии ҶТ таҳти унвони «Мизони Қонун»',
    titleRu: 'Выпуск официального издания Верховного суда «Мизони Қонун»',
    titleEn: 'Release of Supreme Court Official Journal "Mizoni Qonun"',
    summaryTj: 'Дар нашри нав мақолаҳои таҳлилии судяҳо, шарҳҳои амалияи кассатсионӣ ва тавсияҳои методӣ нашр гардиданд.',
    summaryRu: 'Опубликованы аналитические статьи судей, обзоры кассационной практики и методические рекомендации.',
    summaryEn: 'Published analytical judicial articles, cassation reviews, and methodical recommendations for legal practice.',
    date: '10.08.2026',
    categoryTj: 'МАТБУОТИ СУДӢ',
    categoryRu: 'СУДЕБНАЯ ПЕЧАТЬ',
    categoryEn: 'JUDICIAL PRESS',
    image: '/themis-light-background.jpg',
  }
];

export const Judicial3DNewsSlider: React.FC<Judicial3DNewsSliderProps> = ({
  onOpenNewsItem,
  onOpenAllNews,
  region,
  categoryTj,
  categoryRu,
  categoryEn,
}) => {
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const [slides, setSlides] = useState<NewsSlideItem[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const [tiltOffset, setTiltOffset] = useState({ x: 0, y: 0 });
  const sliderRef = useRef<HTMLDivElement>(null);

  // 1. Fetch dynamic news from API if available (optionally filtered by region)
  useEffect(() => {
    let isMounted = true;
    fetch(region ? `/api/news?region=${encodeURIComponent(region)}` : '/api/news')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: NewsSlideItem[] = data.map((item, idx) => ({
            id: item.id.toString(),
            slug: item.slug,
            url: item.slug ? `/news/${item.slug}` : undefined,
            titleRu: item.title_ru || item.title || '',
            titleTj: item.title_tj || item.title_ru || item.title || '',
            titleEn: item.title_en || item.title_ru || item.title || '',
            summaryRu: item.body_ru || item.excerpt_ru || '',
            summaryTj: item.body_tj || item.excerpt_tj || item.body_ru || '',
            summaryEn: item.body_en || item.excerpt_en || item.body_ru || '',
            date: item.published_at ? new Date(item.published_at).toLocaleDateString() : '2026',
            categoryRu: categoryRu || 'НОВОСТИ ВЕРХОВНОГО СУДА',
            categoryTj: categoryTj || 'ХАБАРҲОИ СУДИ ОЛӢ',
            categoryEn: categoryEn || 'SUPREME COURT NEWS',
            image: item.cover_image ? `/uploads/${item.cover_image}` : DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].image,
          }));
          setSlides(mapped);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [region, categoryRu, categoryTj, categoryEn]);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay timer
  useEffect(() => {
    if (!isPlaying || isDragging || total <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, isDragging, total, nextSlide]);

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
      onOpenNewsItem?.(slides[currentIndex]);
    }
  };

  // Mouse drag & touch swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragDistance(0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setDragDistance(e.clientX - dragStartX);
    }
    // Subtle parallax tilt on hover
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTiltOffset({ x: x * 6, y: y * -6 });
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      if (dragDistance > 50) {
        prevSlide();
      } else if (dragDistance < -50) {
        nextSlide();
      }
      setIsDragging(false);
      setDragDistance(0);
    }
  };

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
      onPointerLeave={() => {
        handlePointerUp();
        setTiltOffset({ x: 0, y: 0 });
      }}
      className="relative w-full overflow-hidden select-none py-4 outline-none focus-visible:ring-1 focus-visible:ring-theme-gold rounded-3xl"
      style={{ perspective: '1200px' }}
    >
      {/* Top Header Control Bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 font-mono text-xs text-theme-gold">
          <Sparkles size={14} />
          <span className="font-bold uppercase tracking-wider">
            {language === 'tj' ? 'ХАБАРҲОИ АСОСӢ // 3D КАРУСЕЛ' : language === 'en' ? 'FEATURED NEWS // 3D SLIDER' : 'ГЛАВНЫЕ НОВОСТИ // 3D СЛАЙДЕР'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Pagination Counter */}
          <span className="font-mono text-xs text-theme-textMuted mr-2">
            {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>

          {/* Autoplay Pause/Play */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
            className="btn-icon w-8 h-8 rounded-full"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>

          {/* Prev / Next Buttons */}
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
        </div>
      </div>

      {/* 3D Visual Carousel Stage */}
      <div className="relative w-full h-[360px] sm:h-[400px] flex items-center justify-center">
        {slides.map((item, idx) => {
          let diff = (idx - currentIndex + total) % total;
          if (diff > total / 2) diff -= total;

          const isCenter = diff === 0;
          const isLeft = diff === -1 || (currentIndex === 0 && idx === total - 1);
          const isRight = diff === 1 || (currentIndex === total - 1 && idx === 0);
          const isVisible = isCenter || isLeft || isRight;

          if (!isVisible) return null;

          // CSS 3D Transformation variables
          let translateX = 0;
          let translateZ = 0;
          let rotateY = 0;
          let scale = 1;
          let opacity = 1;
          let zIndex = 20;

          if (isCenter) {
            translateX = dragDistance * 0.4;
            translateZ = 40;
            rotateY = tiltOffset.x * 0.5;
            scale = 1;
            opacity = 1;
            zIndex = 30;
          } else if (isLeft) {
            translateX = -280 + dragDistance * 0.2;
            translateZ = -120;
            rotateY = 18;
            scale = 0.85;
            opacity = 0.45;
            zIndex = 10;
          } else if (isRight) {
            translateX = 280 + dragDistance * 0.2;
            translateZ = -120;
            rotateY = -18;
            scale = 0.85;
            opacity = 0.45;
            zIndex = 10;
          }

          const title = language === 'en' ? (item.titleEn || item.titleRu) : language === 'tj' ? item.titleTj : item.titleRu;
          const summary = language === 'en' ? (item.summaryEn || item.summaryRu) : language === 'tj' ? item.summaryTj : item.summaryRu;
          const category = language === 'en' ? (item.categoryEn || item.categoryRu) : language === 'tj' ? item.categoryTj : item.categoryRu;

          return (
            <div
              key={item.id}
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
                absolute w-[92%] sm:w-[580px] lg:w-[660px] h-[330px] sm:h-[370px] rounded-3xl overflow-hidden cursor-pointer
                border transition-all duration-500 ease-out will-change-transform group
                ${
                  isCenter
                    ? 'border-[#dfbe7e]/80 shadow-[0_15px_40px_rgba(0,0,0,0.7)]'
                    : 'border-white/10 hover:border-white/30'
                }
                ${isDark ? 'bg-[#040813]' : 'bg-[var(--glass-surface-strong)] glass'}
              `}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) rotateX(${isCenter ? tiltOffset.y * 0.5 : 0}deg) scale(${scale})`,
                opacity,
                zIndex,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Background Image with Cinematic Overlay */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img
                  src={item.image}
                  alt={title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-60"
                />
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    isDark
                      ? 'bg-gradient-to-t from-[#02050e] via-[#02050e]/80 to-transparent'
                      : 'bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/85 to-transparent'
                  }`}
                />
              </div>

              {/* Slide Content Layer */}
              <div className="relative z-10 w-full h-full p-6 sm:p-8 flex flex-col justify-end text-left">
                <div className="flex items-center gap-2 mb-2 font-mono text-[10px]">
                  <span className="px-2.5 py-0.5 rounded-full bg-theme-gold/20 text-theme-gold border border-theme-gold/40 font-bold uppercase tracking-wider">
                    {category}
                  </span>
                  <span className="flex items-center gap-1 text-theme-textMuted">
                    <Calendar size={11} /> {item.date}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base sm:text-xl md:text-2xl text-theme-text group-hover:text-theme-gold transition-colors line-clamp-2 leading-snug drop-shadow-sm mb-2">
                  {title}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-theme-textSec line-clamp-2 leading-relaxed mb-4">
                  {summary}
                </p>

                {isCenter && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNewsItem?.(item);
                      }}
                      className="btn-primary text-xs !py-1.5 !px-4"
                    >
                      <span>{language === 'tj' ? 'Муфассал хондан' : language === 'en' ? 'Read Full Story' : 'Читать подробнее'}</span>
                      <ArrowUpRight size={13} />
                    </button>
                    {onOpenAllNews && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAllNews();
                        }}
                        className="btn-ghost text-xs font-mono"
                      >
                        <span>{language === 'tj' ? 'Ҳамаи хабарҳо' : language === 'en' ? 'All News' : 'Все новости'}</span>
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
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {slides.map((_, dotIdx) => (
          <button
            key={`dot-${dotIdx}`}
            type="button"
            onClick={() => setCurrentIndex(dotIdx)}
            aria-label={`Go to slide ${dotIdx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === dotIdx
                ? 'w-7 bg-theme-gold shadow-[0_0_8px_rgba(223,190,126,0.6)]'
                : 'w-2 bg-theme-border hover:bg-theme-gold/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Judicial3DNewsSlider;
