import React, { useState } from 'react';
import { Share2, Check, Globe } from 'lucide-react';
import { Reveal } from './Reveal';
import { Language } from '../data/sudTjData';

interface SectionThreeProps {
  lang: Language;
  onOpenCourts?: () => void;
  onOpenHearings?: () => void;
}

export const SectionThree: React.FC<SectionThreeProps> = ({
  lang,
  onOpenCourts,
  onOpenHearings,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: lang === 'ru' ? 'Судебная сеть Республики Таджикистан' : 'Шабакаи судҳои Ҷумҳурии Тоҷикистон',
          text: 'Единая судебная система и график рассмотрения судебных дел',
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
      id="courts"
      aria-label={lang === 'ru' ? 'Единая судебная сеть' : 'Шабакаи ягонаи судҳо'}
      className="relative flex min-h-screen flex-col justify-between supports-[height:100svh]:min-h-[100svh]"
    >
      {/* Middle row */}
      <div className="relative flex flex-1 flex-col justify-center gap-10 px-5 pt-24 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 sm:pt-0 md:px-12">
        {/* Section 3 Headline */}
        <div className="max-w-xl text-4xl font-medium uppercase leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
          <Reveal delay={100}>
            <div>
              {lang === 'ru' ? (
                <>
                  Единая <span className="normal-case italic font-light">судебная</span>
                </>
              ) : (
                <>
                  Шабакаи <span className="normal-case italic font-light">ягонаи</span>
                </>
              )}
            </div>
          </Reveal>
          <Reveal delay={220}>
            <div>
              {lang === 'ru' ? 'сеть Таджикистана' : 'судҳои ҷумҳурӣ'}
            </div>
          </Reveal>
        </div>

        {/* Section Indicator */}
        <Reveal delay={340}>
          <div className="flex items-center justify-between font-mono text-white sm:justify-start sm:gap-16 md:gap-24">
            <span className="tracking-widest">( C )</span>
            <span className="text-white/60">[ 003 /004 ]</span>
          </div>
        </Reveal>
      </div>

      {/* Interactive Regional Quick Stats Grid */}
      <div className="px-5 sm:px-8 md:px-12">
        <Reveal delay={380}>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 max-w-4xl py-4 font-mono text-xs text-white/80">
            <div
              onClick={onOpenCourts}
              className="p-3 bg-black/40 border border-white/10 hover:border-white/30 rounded-xl transition-all cursor-pointer group"
            >
              <div className="text-[10px] text-white/50 mb-1 flex items-center justify-between">
                <span>01 // DUSHANBE</span>
                <Globe size={11} className="group-hover:text-white transition-colors" />
              </div>
              <div className="font-semibold text-white">6 {lang === 'ru' ? 'судов' : 'суд'}</div>
              <div className="text-[10px] text-white/60 font-sans mt-0.5">dushanbe.sud.tj</div>
            </div>

            <div
              onClick={onOpenCourts}
              className="p-3 bg-black/40 border border-white/10 hover:border-white/30 rounded-xl transition-all cursor-pointer group"
            >
              <div className="text-[10px] text-white/50 mb-1 flex items-center justify-between">
                <span>02 // RRP</span>
                <Globe size={11} className="group-hover:text-white transition-colors" />
              </div>
              <div className="font-semibold text-white">13 {lang === 'ru' ? 'судов' : 'суд'}</div>
              <div className="text-[10px] text-white/60 font-sans mt-0.5">НТҶ / Районы РП</div>
            </div>

            <div
              onClick={onOpenCourts}
              className="p-3 bg-black/40 border border-white/10 hover:border-white/30 rounded-xl transition-all cursor-pointer group"
            >
              <div className="text-[10px] text-white/50 mb-1 flex items-center justify-between">
                <span>03 // SUGD</span>
                <Globe size={11} className="group-hover:text-white transition-colors" />
              </div>
              <div className="font-semibold text-white">20 {lang === 'ru' ? 'судов' : 'суд'}</div>
              <div className="text-[10px] text-white/60 font-sans mt-0.5">sugd.sud.tj</div>
            </div>

            <div
              onClick={onOpenCourts}
              className="p-3 bg-black/40 border border-white/10 hover:border-white/30 rounded-xl transition-all cursor-pointer group"
            >
              <div className="text-[10px] text-white/50 mb-1 flex items-center justify-between">
                <span>04 // KHATLON</span>
                <Globe size={11} className="group-hover:text-white transition-colors" />
              </div>
              <div className="font-semibold text-white">25 {lang === 'ru' ? 'судов' : 'суд'}</div>
              <div className="text-[10px] text-white/60 font-sans mt-0.5">khatlon.sud.tj</div>
            </div>

            <div
              onClick={onOpenCourts}
              className="p-3 bg-black/40 border border-white/10 hover:border-white/30 rounded-xl transition-all cursor-pointer col-span-2 sm:col-span-1 group"
            >
              <div className="text-[10px] text-white/50 mb-1 flex items-center justify-between">
                <span>05 // GBAO</span>
                <Globe size={11} className="group-hover:text-white transition-colors" />
              </div>
              <div className="font-semibold text-white">10 {lang === 'ru' ? 'судов' : 'суд'}</div>
              <div className="text-[10px] text-white/60 font-sans mt-0.5">vmkb.sud.tj</div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Bottom block */}
      <div className="relative flex flex-col gap-10 px-5 pb-16 sm:px-8 md:px-12 md:pb-20">
        <Reveal delay={460}>
          <p className="max-w-md text-sm leading-relaxed text-white/85 drop-shadow-md font-light">
            {lang === 'ru'
              ? 'Более 70 городских, районных и специализированных судов объединены в единое цифровое информационное пространство sud.tj с прямым доступом к графику судебных заседаний.'
              : 'Зиёда аз 70 судҳои шаҳрӣ, ноҳиявӣ ва тахассусӣ дар фазои ягонаи иттилоотии рақамии sud.tj бо дастрасии мустақим ба рӯйхати парвандаҳои таъингардида муттаҳид карда шудаанд.'}
          </p>
        </Reveal>

        {/* Bottom CTA Button */}
        <div className="w-full max-w-xs sm:absolute sm:bottom-16 sm:left-1/2 sm:w-auto sm:max-w-none sm:-translate-x-1/2 md:bottom-20 flex flex-col sm:flex-row gap-3">
          <Reveal delay={580}>
            <button
              type="button"
              onClick={onOpenCourts}
              className="block w-full sm:w-auto rounded-full border border-white/60 px-8 py-3 text-center font-mono text-xs uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {lang === 'ru' ? 'Региональные суды' : 'Судҳои ҷумҳурӣ'}
            </button>
          </Reveal>
          <Reveal delay={640}>
            <button
              type="button"
              onClick={onOpenHearings}
              className="block w-full sm:w-auto rounded-full bg-white/10 border border-white/30 px-8 py-3 text-center font-mono text-xs uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {lang === 'ru' ? 'График заседаний' : 'Рӯйхати парвандаҳо'}
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
