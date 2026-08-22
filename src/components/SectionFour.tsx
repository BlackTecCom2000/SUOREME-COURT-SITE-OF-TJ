import React, { useState } from 'react';
import { Share2, Check, FileDown, Newspaper } from 'lucide-react';
import { Reveal } from './Reveal';
import { Language, PRESS_NEWS } from '../data/sudTjData';

interface SectionFourProps {
  lang: Language;
  onOpenNews?: () => void;
  onOpenDocs?: () => void;
}

export const SectionFour: React.FC<SectionFourProps> = ({
  lang,
  onOpenNews,
  onOpenDocs,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: lang === 'ru' ? 'Пресс-центр Верховного суда РТ' : 'Маркази матбуоти Суди Олии ҶТ',
          text: 'Официальные новости, постановления Пленума и образцы документов',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  const topNews = PRESS_NEWS.slice(0, 2);

  return (
    <section
      id="news"
      aria-label={lang === 'ru' ? 'Пресс-центр и нормативные акты' : 'Маркази матбуот ва санадҳо'}
      className="relative flex min-h-screen flex-col justify-between supports-[height:100svh]:min-h-[100svh]"
    >
      {/* Middle row */}
      <div className="relative flex flex-1 flex-col justify-center gap-10 px-5 pt-24 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 sm:pt-0 md:px-12">
        {/* Section 4 Headline */}
        <div className="max-w-xl text-4xl font-medium uppercase leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
          <Reveal delay={100}>
            <div>
              {lang === 'ru' ? (
                <>
                  Правопорядок <span className="normal-case italic font-light">и закон</span>
                </>
              ) : (
                <>
                  Тартиботи <span className="normal-case italic font-light">ҳуқуқӣ</span>
                </>
              )}
            </div>
          </Reveal>
          <Reveal delay={220}>
            <div>
              {lang === 'ru' ? '// Кодекс судейской этики' : '// Одоби касбии судя'}
            </div>
          </Reveal>
        </div>

        {/* Section Indicator */}
        <Reveal delay={340}>
          <div className="flex items-center justify-between font-mono text-white sm:justify-start sm:gap-16 md:gap-24">
            <span className="tracking-widest">( D )</span>
            <span className="text-white/60">[ 004 /004 ]</span>
          </div>
        </Reveal>
      </div>

      {/* Official News Cards Preview */}
      <div className="px-5 sm:px-8 md:px-12">
        <Reveal delay={380}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl py-2">
            {topNews.map((news) => (
              <div
                key={news.id}
                onClick={onOpenNews}
                className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-white/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-white/50 mb-2">
                  <span className="flex items-center gap-1.5 text-white/80">
                    <Newspaper size={12} />
                    <span>{news.source}</span>
                  </span>
                  <span>{news.date}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-medium text-white group-hover:text-white line-clamp-2 mb-1.5 leading-snug">
                  {lang === 'ru' ? news.titleRu : news.titleTj}
                </h4>
                <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed">
                  {lang === 'ru' ? news.summaryRu : news.summaryTj}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Bottom block */}
      <div className="relative flex flex-col gap-10 px-5 pb-16 sm:px-8 md:px-12 md:pb-20">
        <Reveal delay={460}>
          <p className="max-w-md text-sm leading-relaxed text-white/85 drop-shadow-md font-light">
            {lang === 'ru'
              ? 'Официальные решения Пленума Верховного суда, регулярный журнал «Мизони Қонун», процессуальные бланки и прямая линия взаимодействия с гражданами.'
              : 'Қарорҳои расмии Пленуми Суди Олӣ, нашрияи мунтазами «Мизони Қонун», намунаи санадҳои мурофиавӣ ва хатти мустақими робита бо шаҳрвандон.'}
          </p>
        </Reveal>

        {/* Bottom CTA Buttons */}
        <div className="w-full max-w-xs sm:absolute sm:bottom-16 sm:left-1/2 sm:w-auto sm:max-w-none sm:-translate-x-1/2 md:bottom-20 flex flex-col sm:flex-row gap-3">
          <Reveal delay={580}>
            <button
              type="button"
              onClick={onOpenNews}
              className="block w-full sm:w-auto rounded-full border border-white/60 px-8 py-3 text-center font-mono text-xs uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {lang === 'ru' ? 'Пресс-центр' : 'Маркази матбуот'}
            </button>
          </Reveal>
          <Reveal delay={640}>
            <button
              type="button"
              onClick={onOpenDocs}
              className="block w-full sm:w-auto rounded-full bg-white/10 border border-white/30 px-8 py-3 text-center font-mono text-xs uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white flex items-center justify-center gap-2"
            >
              <FileDown size={13} />
              <span>{lang === 'ru' ? 'Бланки & Документы' : 'Ҳуҷҷатҳои намунавӣ'}</span>
            </button>
          </Reveal>
        </div>

        {/* Absolute bottom-left Share button */}
        <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-8 md:left-12 z-20">
          <Reveal delay={700}>
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={handleShare}
                aria-label={lang === 'ru' ? 'Поделиться разделом' : 'Ба дигарон фиристодан'}
                className="text-white/80 hover:text-white transition-colors duration-200 p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
              >
                {copied ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
              </button>
              {copied && (
                <span className="absolute left-7 font-mono text-[11px] text-emerald-400 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded border border-emerald-400/30">
                  {lang === 'ru' ? 'Ссылка скопирована' : 'Истинод нусхабардорӣ шуд'}
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
