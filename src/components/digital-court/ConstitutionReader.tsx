import React, { useEffect, useRef, useState, useCallback } from 'react';
import './ConstitutionReader.css';

const rawPdfPages = [
`КОНСТИТУТСИЯИ ҶУМҲУРИИ ТОҶИКИСТОН
Тағйиру иловаҳо бо тариқи раъйпурсии умумихалқӣ аз 26 сентябри соли 1999, аз 22 июни соли 2003, аз 22 майи соли 2016
МО, ХАЛҚИ ТОҶИКИСТОН, қисми ҷудонашавандаи ҷомеаи ҷаҳон буда, худро дар назди наслҳои гузашта, ҳозира ва оянда масъул ва вазифадор дониста, таъмини соҳибихтиёрии давлати худ ва рушду камоли онро дарк намуда, озодӣ ва ҳуқуқи шахсро муқаддас шумурда, баробарҳуқуқӣ ва дӯстии тамоми миллату халқиятҳоро эътироф карда, бунёди ҷомеаи адолатпарварро вазифаи худ қарор дода,
ҲАМИН КОНСТИТУТСИЯРО ҚАБУЛ ВА ЭЪЛОН МЕНАМОЕМ.
БОБИ ЯКУМ. АСОСҲОИ СОХТОРИ КОНСТИТУТСИОНӢ
Моддаи 1.
Ҷумҳурии Тоҷикистон давлати соҳибихтиёр, демократӣ, ҳуқуқбунёд, дунявӣ ва ягона мебошад.
Шакли идораи Ҷумҳурии Тоҷикистон президентӣ мебошад (22 майи соли 2016)
Тоҷикистон давлати иҷтимоӣ буда, барои ҳар як инсон шароити зиндагии арзанда ва инкишофи озодонаро фароҳам меорад.
Ҷумҳурии Тоҷикистон ва Тоҷикистон ҳаммаъноянд.
Моддаи 2.
Забони давлатии Тоҷикистон забони тоҷикӣ аст. Забони русӣ ҳамчун забони муоширати байни миллатҳо амал мекунад.
Ҳамаи миллатҳо ва халқиятҳое, ки дар ҳудуди ҷумҳурӣ зиндагӣ мекунанд, ҳуқуқ доранд аз забони модариашон озодона истифода кунанд (22 майи соли 2016).
Моддаи 3.
Рамзҳои давлатии Тоҷикистон Парчам, Нишон ва Суруди Миллӣ аст.
Моддаи 4.
Пойтахти Тоҷикистон шаҳри Душанбе аст.
Моддаи 5.
Инсон, ҳуқуқ ва озодиҳои ў арзиши олӣ мебошанд (22 майи соли 2016).`,
`Ҳаёт, қадр, номус ва дигар ҳуқуқҳои фитрии инсон дахлнопазиранд.
Ҳуқуқу озодиҳои инсон ва шаҳрвандро давлат эътироф, риоя ва ҳифз менамояд.
Моддаи 6.
Дар Тоҷикистон халқ баёнгари соҳибихтиёрӣ ва сарчашмаи ягонаи ҳокимияти давлатӣ буда, онро бевосита ва ё ба воситаи вакилони худ амалӣ мегардонад.
Ифодаи олии бевоситаи ҳокимияти халқ раъйпурсии умумихалқӣ ва интихобот аст.
Халқи Тоҷикистонро сарфи назар аз миллаташон шаҳрвандони Тоҷикистон ташкил менамоянд.
Ҳеҷ як иттиҳодияи ҷамъиятӣ, ҳизбҳои сиёсӣ, гурӯҳи одамон ва ё фарде ҳуқуқ надорад, ки ҳокимияти давлатиро ғасб намояд.
Ғасби ҳокимият ва ё тасарруфи салоҳияти он манъ аст.
Аз номи тамоми халқи Тоҷикистон фақат Президент, Маҷлиси миллӣ ва Маҷлиси намояндагони Маҷлиси Олии Ҷумҳурии Тоҷикистон дар ҷаласаи якҷояи худ ҳуқуқи сухан гуфтан доранд.
Моддаи 7.
Ҳудуди Тоҷикистон тақсимнашаванда ва дахлнопазир мебошад.
Тоҷикистон аз Вилояти Мухтори Кӯҳистони Бадахшон, вилоятҳо, шаҳрҳо, ноҳияҳо, шаҳракҳо ва деҳаҳо иборат аст.
Соҳибихтиёрӣ, истиқлолият ва тамомияти арзии Тоҷикистонро давлат таъмин менамояд. Тарғиб ва амалиёти ҷудоиандозӣ, ки ягонагии давлатро халалдор мекунад, манъ аст.
Тартиби таъсис ва тағйири воҳидҳои маъмурию ҳудудиро қонуни конститутсионӣ танзим менамояд (22 майи соли 2016).
Моддаи 8.
Дар Тоҷикистон ҳаёти ҷамъиятӣ дар асоси равияҳои гуногуни сиёсӣ ва мафкуравӣ инкишоф меёбад.
Мафкураи ҳеҷ як ҳизб, иттиҳодияи ҷамъиятӣ, динӣ, ҳаракат ва гурӯҳе наметавонад ба ҳайси мафкураи давлатӣ эътироф шавад.
Иттиҳодияҳои ҷамъиятӣ ва ҳизбҳои сиёсӣ дар доираи Конститутсия ва қонунҳо таъсис меёбанд ва амал мекунанд.
Иттиҳодияҳои динӣ аз давлат ҷудо буда, ба корҳои давлатӣ мудохила карда наметавонанд (22 майи соли 2016).`,
];

interface ConstitutionReaderProps {
  onClose?: () => void;
}

export const ConstitutionReader: React.FC<ConstitutionReaderProps> = () => {
  const [currentSpread, setCurrentSpread] = useState(0);
  const TOTAL_SPREADS = 14;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const staticLeftRef = useRef<HTMLDivElement>(null);
  const staticRightRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const currentSpreadRef = useRef(0);
  const dragRef = useRef({ isDragging: false, startX: 0, dir: '' as 'next' | 'prev' | '' });

  currentSpreadRef.current = currentSpread;

  const formatRawText = useCallback((rawText: string, pageNumber: number) => {
    const lines = rawText.trim().split('\n');
    let html = `<div class="paper-inner font-serif-book text-[12.5px] leading-[1.5]"><div class="page-content-fit" style="transform-origin: top center; width: 100%;">`;
    lines.forEach(line => {
      line = line.trim();
      if (!line) return;
      line = line.replace(/^(Моддаи \d+\.)/g, '<b class="text-amber-900">$1</b>');
      if (line.match(/^БОБИ /) || line.includes('МУҚАРРАРОТИ ИНТИҚОЛӢ') || line.includes('КОНСТИТУТСИЯИ ҶУМҲУРИИ ТОҶИКИСТОН')) {
        html += `<h4 class="font-bold mt-3 mb-2 text-center text-sm tracking-wide text-amber-950 uppercase">${line}</h4>`;
      } else if (line.includes('ҲАМИН КОНСТИТУТСИЯРО')) {
        html += `<p class="text-center font-bold my-3 text-amber-900 uppercase">${line}</p>`;
      } else {
        html += `<p class="mb-1.5 text-justify indent-6">${line}</p>`;
      }
    });
    html += `</div><div class="absolute bottom-4 left-0 right-0 text-center text-[11px] text-neutral-400 font-sans">${pageNumber}</div></div>`;
    return html;
  }, []);

  const bookSpreads = useRef<{ left: string; right: string }[]>([]);

  if (bookSpreads.current.length === 0) {
    bookSpreads.current.push({
      left: '',
      right: `<div class="hard-cover w-full h-full flex flex-col items-center text-center p-8 relative"><div class="mt-16"><span class="text-xs uppercase tracking-[0.35em] text-amber-200/80 font-serif-book">ҚОНУНИ АСОСӢ</span><div class="w-24 h-px bg-amber-400/50 mx-auto my-6"></div><h2 class="font-title text-3xl text-amber-100 gold-text tracking-wider leading-snug">КОНСТИТУТСИЯИ<br>ҶУМҲУРИИ<br>ТОҶИКИСТОН</h2></div><div class="my-auto flex justify-center"><div class="w-32 h-32 rounded-full border border-amber-400/40 flex items-center justify-center bg-black/40 shadow-inner"><span class="font-title text-sm text-amber-200/90 font-bold tracking-widest">ТОҶИКИСТОН</span></div></div><div class="mb-8"><p class="text-xs tracking-widest text-amber-300/90 uppercase font-serif-book">Душанбе</p></div></div>`
    });
    for (let i = 0; i < rawPdfPages.length; i += 2) {
      let right = '';
      if (i + 1 < rawPdfPages.length) right = formatRawText(rawPdfPages[i + 1], i + 2);
      else right = `<div class="hard-cover w-full h-full flex items-center justify-center text-center"><div class="w-20 h-20 rounded-full border border-amber-400/30 flex items-center justify-center opacity-50">✦</div></div>`;
      bookSpreads.current.push({ left: formatRawText(rawPdfPages[i], i + 1), right });
    }
  }

  const fitPages = useCallback(() => {
    document.querySelectorAll('.const-reader .paper-inner').forEach((pageEl) => {
      const content = pageEl.querySelector('.page-content-fit') as HTMLElement;
      if (!content) return;
      content.style.transform = 'scale(1)';
      const availableHeight = (pageEl as HTMLElement).clientHeight - 85;
      const actualHeight = content.scrollHeight;
      if (actualHeight > availableHeight) {
        const scaleFactor = availableHeight / actualHeight;
        content.style.transform = `scale(${scaleFactor})`;
      }
    });
  }, []);

  const renderState = useCallback(() => {
    if (!staticRightRef.current || !staticLeftRef.current || !wrapperRef.current) return;
    staticRightRef.current.innerHTML = bookSpreads.current[currentSpreadRef.current].right;
    if (currentSpreadRef.current === 0) {
      wrapperRef.current.classList.add('is-closed');
      staticLeftRef.current.innerHTML = '';
    } else {
      wrapperRef.current.classList.remove('is-closed');
      staticLeftRef.current.innerHTML = bookSpreads.current[currentSpreadRef.current].left;
    }
    fitPages();
  }, [fitPages]);

  useEffect(() => {
    renderState();
  }, [currentSpread, renderState]);

  const executeFlip = useCallback((dir: 'next' | 'prev') => {
    if (isAnimatingRef.current) return;
    const cur = currentSpreadRef.current;
    if (dir === 'next' && cur >= TOTAL_SPREADS) return;
    if (dir === 'prev' && cur <= 0) return;
    isAnimatingRef.current = true;
    const isCover = (cur === 0 && dir === 'next') || (cur === 1 && dir === 'prev');
    const animDuration = isCover ? 0.7 : 0.95;
    const animName = dir === 'next' ? (isCover ? 'turnNextCover' : 'turnNextPaper') : (isCover ? 'turnPrevCover' : 'turnPrevPaper');
    const wrapper = wrapperRef.current!;
    const flipBlock = document.createElement('div');
    flipBlock.className = 'flip-container';
    const front = document.createElement('div');
    const back = document.createElement('div');
    flipBlock.appendChild(front);
    flipBlock.appendChild(back);
    wrapper.appendChild(flipBlock);
    if (dir === 'next') {
      front.className = 'flip-front spine-shadow-left';
      back.className = 'flip-back spine-shadow-right';
      flipBlock.style.right = '0';
      flipBlock.style.transformOrigin = 'left center';
      front.innerHTML = bookSpreads.current[cur].right;
      back.innerHTML = bookSpreads.current[cur + 1].left;
      staticRightRef.current!.innerHTML = bookSpreads.current[cur + 1].right;
      if (cur === 0) wrapper.classList.remove('is-closed');
      else staticLeftRef.current!.innerHTML = bookSpreads.current[cur].left;
      fitPages();
      const frontLight = document.createElement('div'); frontLight.className = 'lighting-overlay animate-next-front'; front.appendChild(frontLight);
      const backLight = document.createElement('div'); backLight.className = 'lighting-overlay animate-next-back'; back.appendChild(backLight);
      void flipBlock.offsetWidth;
      flipBlock.style.animation = `${animName} ${animDuration}s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
    } else {
      front.className = 'flip-front spine-shadow-right';
      back.className = 'flip-back spine-shadow-left';
      flipBlock.style.left = '0';
      flipBlock.style.transformOrigin = 'right center';
      front.innerHTML = bookSpreads.current[cur].left;
      back.innerHTML = bookSpreads.current[cur - 1].right;
      staticLeftRef.current!.innerHTML = bookSpreads.current[cur - 1].left;
      if (cur - 1 === 0) wrapper.classList.add('is-closed');
      else staticRightRef.current!.innerHTML = bookSpreads.current[cur].right;
      fitPages();
      const frontLight = document.createElement('div'); frontLight.className = 'lighting-overlay animate-prev-front'; front.appendChild(frontLight);
      const backLight = document.createElement('div'); backLight.className = 'lighting-overlay animate-prev-back'; back.appendChild(backLight);
      void flipBlock.offsetWidth;
      flipBlock.style.animation = `${animName} ${animDuration}s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
    }
    window.setTimeout(() => {
      const next = dir === 'next' ? cur + 1 : cur - 1;
      setCurrentSpread(next);
      flipBlock.remove();
      isAnimatingRef.current = false;
    }, animDuration * 1000);
  }, [fitPages]);

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent, dir: 'next' | 'prev') => {
    if (isAnimatingRef.current) return;
    const cur = currentSpreadRef.current;
    if (dir === 'next' && cur >= TOTAL_SPREADS) return;
    if (dir === 'prev' && cur <= 0) return;
    e.preventDefault();
    const clientX = (e as React.TouchEvent).touches ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    dragRef.current = { isDragging: true, startX: clientX, dir };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current.isDragging) return;
      e.preventDefault();
      const currentX = (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const diff = currentX - dragRef.current.startX;
      if (dragRef.current.dir === 'next' && diff < -50) { dragRef.current.isDragging = false; executeFlip('next'); }
      else if (dragRef.current.dir === 'prev' && diff > 50) { dragRef.current.isDragging = false; executeFlip('prev'); }
    };
    const onEnd = () => { dragRef.current.isDragging = false; };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') executeFlip('next');
      if (e.key === 'ArrowLeft') executeFlip('prev');
    };
    const resizeWindow = () => {
      const scaler = scalerRef.current;
      if (!scaler) return;
      const scale = Math.min((window.innerWidth - 40) / 960, (window.innerHeight - 150) / 680);
      scaler.style.transform = `scale(${Math.min(1, scale)})`;
      fitPages();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false } as any);
    document.addEventListener('touchend', onEnd);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', resizeWindow);
    resizeWindow();
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove as any);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', resizeWindow);
    };
  }, [executeFlip, fitPages]);

  return (
    <div className="const-reader flex flex-col h-[min(78vh,720px)] w-full max-w-[980px] mx-auto rounded-xl overflow-hidden border border-neutral-800 bg-[#110c09] shadow-2xl">
      <header className="relative z-40 flex items-center justify-between px-6 py-3 bg-neutral-950/90 border-b border-neutral-800 backdrop-blur shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-red-950 border border-red-500/40 flex items-center justify-center text-red-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-neutral-100 font-serif-book tracking-wide">Конститутсияи Тоҷикистон</h1>
            <p className="text-[10px] text-amber-400/80 font-mono">Аслии Ҳуҷҷат (27 Саҳифа)</p>
          </div>
        </div>
        <span className="text-xs text-neutral-400 font-mono">{currentSpread === 0 ? 'Муқова' : `${currentSpread * 2 - 1}-${currentSpread * 2}`}</span>
      </header>

      <main className="relative flex-1 overflow-hidden bg-[#110c09]">
        <div className="stage-container" style={{ perspective: '3500px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={scalerRef} className="book-scaler" style={{ transformOrigin: 'center center', transition: 'transform 0.4s ease' }}>
            <div ref={wrapperRef} className="book-wrapper is-closed" style={{ position: 'relative', width: '960px', height: '680px', transformStyle: 'preserve-3d', transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)' }}>
              <div className="book-bg" style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: '960px', background: '#150d09', borderRadius: '8px', boxShadow: '0 40px 80px rgba(0,0,0,0.9)', transition: 'width 0.8s cubic-bezier(0.25, 1, 0.5, 1)', zIndex: 0 }} />
              <div ref={staticLeftRef} className="book-page page-left" style={{ position: 'absolute', top: 0, left: 0, width: '480px', height: '680px', backgroundColor: '#fcf8f0', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden', zIndex: 10, borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px', transformOrigin: 'right center' }} />
              <div ref={staticRightRef} className="book-page page-right" style={{ position: 'absolute', top: 0, right: 0, width: '480px', height: '680px', backgroundColor: '#fcf8f0', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden', zIndex: 10, borderTopRightRadius: '6px', borderBottomRightRadius: '6px', transformOrigin: 'left center' }} />
              <div className="hotspot top-right" onMouseDown={(e) => startDrag(e, 'next')} onTouchStart={(e) => startDrag(e, 'next')} style={{ position: 'absolute', width: '100px', height: '100px', zIndex: 60, cursor: 'grab', top: 0, right: 0 }} />
              <div className="hotspot bottom-right" onMouseDown={(e) => startDrag(e, 'next')} onTouchStart={(e) => startDrag(e, 'next')} style={{ position: 'absolute', width: '100px', height: '100px', zIndex: 60, cursor: 'grab', bottom: 0, right: 0 }} />
              <div className="hotspot top-left" onMouseDown={(e) => startDrag(e, 'prev')} onTouchStart={(e) => startDrag(e, 'prev')} style={{ position: 'absolute', width: '100px', height: '100px', zIndex: 60, cursor: 'grab', top: 0, left: 0 }} />
              <div className="hotspot bottom-left" onMouseDown={(e) => startDrag(e, 'prev')} onTouchStart={(e) => startDrag(e, 'prev')} style={{ position: 'absolute', width: '100px', height: '100px', zIndex: 60, cursor: 'grab', bottom: 0, left: 0 }} />
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-40 px-6 py-3 bg-neutral-950/90 border-t border-neutral-800 backdrop-blur shrink-0 flex items-center justify-between">
        <button onClick={() => executeFlip('prev')} className="px-4 py-2 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs border border-neutral-700 transition active:scale-95">Қафо</button>
        <div className="flex-1 max-w-sm mx-4 flex flex-col items-center">
          <span className="text-[11px] text-amber-300/80 font-mono mb-1">{currentSpread === 0 ? 'Муқова' : `Саҳифаи ${currentSpread * 2 - 1}-${currentSpread * 2}`}</span>
          <input type="range" min={0} max={TOTAL_SPREADS} value={currentSpread} onChange={(e) => { const v = parseInt(e.target.value); const diff = v - currentSpread; if (diff > 0) for(let i=0;i<diff;i++) executeFlip('next'); else for(let i=0;i<-diff;i++) executeFlip('prev'); }} className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-amber-500" />
        </div>
        <button onClick={() => executeFlip('next')} className="px-4 py-2 rounded bg-amber-700 hover:bg-amber-600 text-white text-xs border border-amber-500 transition active:scale-95 shadow-lg shadow-amber-900/50">Пеш</button>
      </footer>
    </div>
  );
};

export default ConstitutionReader;
