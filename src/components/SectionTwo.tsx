import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Reveal } from './Reveal';
import { Language } from '../data/sudTjData';

interface SectionTwoProps {
  lang: Language;
  onOpenActs?: () => void;
}

export const SectionTwo: React.FC<SectionTwoProps> = ({ lang, onOpenActs }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: lang === 'ru' ? 'Судебные акты — Верховный суд РТ' : 'Санадҳои судӣ — Суди Олии ҶТ',
          text: lang === 'ru' ? 'Доступ к судебной информации и актам Верховного суда Республики Таджикистан' : 'Дастрасӣ ба иттилооти судӣ ва санадҳои Суди Олии Ҷумҳурии Тоҷикистон',
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

  return (
    <section
      id="acts"
      aria-label={lang === 'ru' ? 'Открытый суд для общества' : 'Суди кушода барои ҷомеа'}
      className="relative flex min-h-screen flex-col justify-between supports-[height:100svh]:min-h-[100svh]"
    >
      {/* Middle row */}
      <div className="relative flex flex-1 flex-col justify-center gap-10 px-5 pt-24 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 sm:pt-0 md:px-12">
        {/* Section 2 Headline */}
        <div className="max-w-sm text-4xl font-medium uppercase leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
          <Reveal delay={100}>
            <div>
              {lang === 'ru' ? (
                <>
                  Открытый <span className="normal-case italic font-light">суд</span>
                </>
              ) : (
                <>
                  Суди <span className="normal-case italic font-light">кушода</span>
                </>
              )}
            </div>
          </Reveal>
          <Reveal delay={220}>
            <div>
              {lang === 'ru' ? 'для общества' : 'барои ҷомеа'}
            </div>
          </Reveal>
        </div>

        {/* Section Indicator */}
        <Reveal delay={340}>
          <div className="flex items-center justify-between font-mono text-white sm:justify-start sm:gap-16 md:gap-24">
            <span className="tracking-widest">( B )</span>
            <span className="text-white/60">[ 002 /004 ]</span>
          </div>
        </Reveal>
      </div>

      {/* Bottom block */}
      <div className="relative flex flex-col gap-10 px-5 pb-16 sm:px-8 md:px-12 md:pb-20">
        <Reveal delay={460}>
          <p className="max-w-xs text-sm leading-relaxed text-white/85 drop-shadow-md font-light">
            {lang === 'ru'
              ? 'Доступ к судебной информации, судебным актам и электронным сервисам должен быть понятным, своевременным и доступным для каждого.'
              : 'Дастрасӣ ба иттилооти судӣ, санадҳои судӣ ва хизматрасониҳои электронӣ бояд барои ҳар як шаҳрванд фаҳмо, саривақтӣ ва дастрас бошад.'}
          </p>
        </Reveal>

        {/* Bottom CTA Button */}
        <div className="w-full max-w-xs sm:absolute sm:bottom-16 sm:left-1/2 sm:w-auto sm:max-w-none sm:-translate-x-1/2 md:bottom-20">
          <Reveal delay={580}>
            <button
              type="button"
              onClick={onOpenActs}
              className="block w-full sm:w-auto rounded-full border border-white/60 px-10 py-3 text-center font-mono text-xs uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {lang === 'ru' ? 'Судебные акты' : 'Санадҳои судӣ'}
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
