import React, { useState } from 'react';
import { Share2, ArrowDown, Check } from 'lucide-react';
import { Reveal } from './Reveal';
import { Language } from '../data/sudTjData';

interface SectionOneProps {
  lang: Language;
  onOpenESud?: () => void;
}

export const SectionOne: React.FC<SectionOneProps> = ({ lang, onOpenESud }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: lang === 'ru' ? 'Верховный суд Республики Таджикистан' : 'Суди Олии Ҷумҳурии Тоҷикистон',
          text: lang === 'ru' ? 'Официальный портал Верховного суда — Судебная власть' : 'Сомонаи расмии Суди Олӣ — Ҳокимияти судӣ',
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

  const handleScrollDown = () => {
    const nextSection = document.getElementById('acts');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({
        top: window.innerHeight * 1.2,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="hero"
      aria-label={lang === 'ru' ? 'Судебная власть' : 'Ҳокимияти судӣ'}
      className="relative flex min-h-screen flex-col justify-end supports-[height:100svh]:min-h-[100svh]"
    >
      {/* Content row */}
      <div className="relative flex flex-col gap-10 px-5 pb-16 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:px-8 md:px-12 md:pb-20">
        
        {/* Left Column: Staggered Headline */}
        <div className="max-w-xl text-4xl font-medium uppercase leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
          <Reveal delay={100}>
            <div className="pl-6 sm:pl-12">
              {lang === 'ru' ? 'Правосудие' : 'Адолати судӣ'}
            </div>
          </Reveal>

          <Reveal delay={220}>
            <div>
              {lang === 'ru' ? (
                <>
                  служит <span className="normal-case italic font-light">закону</span>
                </>
              ) : (
                <>
                  хизмат ба <span className="normal-case italic font-light">қонун</span>
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={340}>
            <div className="pl-10 sm:pl-20 text-white/90">
              {lang === 'ru' ? '// Защита' : '// Ҳимояи'}
            </div>
          </Reveal>

          <Reveal delay={460}>
            <div className="pl-16 sm:pl-32">
              {lang === 'ru' ? 'справедливости' : 'инсофу ҳақиқат'}
            </div>
          </Reveal>
        </div>

        {/* Right Column: Metadata + Mission Statement + Pill CTA */}
        <div className="flex w-full max-w-xs flex-col items-start">
          <Reveal delay={400} className="w-full">
            <div className="mb-6 flex w-full items-center justify-between font-mono text-white sm:mb-8">
              <span className="tracking-widest">( A )</span>
              <span className="text-white/60">[ 001 /004 ]</span>
            </div>
          </Reveal>

          <Reveal delay={520}>
            <p className="mb-6 text-sm leading-relaxed text-white/85 drop-shadow-md sm:mb-8 font-light">
              {lang === 'ru'
                ? 'Верховный суд Республики Таджикистан осуществляет судебную власть в соответствии с Конституцией и законами Республики Таджикистан, обеспечивая единообразное применение законодательства и защиту прав и свобод человека.'
                : 'Суди Олии Ҷумҳурии Тоҷикистон ҳокимияти судиро мутобиқи Конститутсия ва қонунҳои Ҷумҳурии Тоҷикистон амалӣ намуда, татбиқи якхелаи қонунгузорӣ ва ҳимояи ҳуқуқу озодиҳои инсонро таъмин менамояд.'}
            </p>
          </Reveal>

          <Reveal delay={640} className="w-full">
            <a
              href="#esud"
              onClick={(e) => {
                if (onOpenESud) {
                  e.preventDefault();
                  onOpenESud();
                }
              }}
              className="block w-full rounded-full border border-white/60 px-8 py-3 text-center font-mono text-xs uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {lang === 'ru' ? 'Электронный суд' : 'Суди электронӣ'}
            </a>
          </Reveal>
        </div>
      </div>

      {/* Absolute bottom-left Share button */}
      <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-8 md:left-12 z-20">
        <Reveal delay={760}>
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={handleShare}
              aria-label={lang === 'ru' ? 'Поделиться' : 'Фиристодан'}
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

      {/* Absolute bottom-center bounce arrow */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 sm:bottom-6 z-20">
        <Reveal delay={760}>
          <button
            type="button"
            onClick={handleScrollDown}
            aria-label={lang === 'ru' ? 'Прокрутить вниз' : 'Ба поён гузаштан'}
            className="text-white/80 hover:text-white transition-colors p-1 cursor-pointer"
          >
            <ArrowDown size={18} className="animate-bounce" />
          </button>
        </Reveal>
      </div>
    </section>
  );
};
