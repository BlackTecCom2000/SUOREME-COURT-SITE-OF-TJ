import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const BookCSS = `@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}
.stage-container{width:100%;height:100%;display:flex;align-items:center;justify-content:center;perspective:3500px}
.book-scaler{transform-origin:center center;transition:transform 0.4s ease}
.book-wrapper{position:relative;width:960px;height:680px;transform-style:preserve-3d;transition:transform 0.8s cubic-bezier(0.25,1,0.5,1)}
.book-wrapper.is-closed{transform:translateX(-240px)}
.book-bg{position:absolute;top:0;right:0;height:100%;width:960px;background:#000;border-radius:8px;box-shadow:0 40px 80px rgba(0,0,0,0.9),0 10px 20px rgba(0,0,0,0.6);transition:width 0.8s cubic-bezier(0.25,1,0.5,1);z-index:0}
.book-wrapper.is-closed .book-bg{width:480px}
.spine-shadow-left::after{content:'';position:absolute;top:0;bottom:0;z-index:25;pointer-events:none;left:0;width:60px;background:linear-gradient(to right,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.1) 40%,transparent 100%)}
.spine-shadow-right::after{content:'';position:absolute;top:0;bottom:0;z-index:25;pointer-events:none;right:0;width:60px;background:linear-gradient(to left,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.1) 40%,transparent 100%)}
.book-page{position:absolute;top:0;width:480px;height:680px;background-color:#fcf8f0;transform-style:preserve-3d;backface-visibility:hidden;z-index:10}
.page-left{left:0;transform-origin:right center;transition:opacity 0.6s ease,transform 0.4s ease;border-top-left-radius:6px;border-bottom-left-radius:6px}
.page-right{right:0;transform-origin:left center;transition:transform 0.4s ease;border-top-right-radius:6px;border-bottom-right-radius:6px}
.book-wrapper.is-closed .page-left{opacity:0;pointer-events:none}
.paper-inner{width:100%;height:100%;padding:40px 48px;background-image:linear-gradient(to right,rgba(255,255,255,0.8),rgba(255,255,255,0)),radial-gradient(circle at center,#fffefc 0%,#f4ebd6 100%);color:#1c140d;overflow:hidden;display:flex;flex-direction:column;position:relative;font-family:'Cormorant Garamond',Georgia,serif;font-size:12px;line-height:1.6}
.hard-cover{background:#231811 !important;color:#D4AF37;box-shadow:inset 0 0 60px rgba(0,0,0,0.9),inset 0 0 20px rgba(0,0,0,0.8);border-radius:6px;padding:0 !important;overflow:hidden !important;border-right:2px solid rgba(255,255,255,0.1);border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05)}
.gold-text{color:#C5A880;text-shadow:1px 1px 2px rgba(0,0,0,0.8)}
.hotspot{position:absolute;width:100px;height:100px;z-index:60;cursor:grab}.hotspot:active{cursor:grabbing}.hotspot.top-right{top:0;right:0}.hotspot.bottom-right{bottom:0;right:0}.hotspot.top-left{top:0;left:0}.hotspot.bottom-left{bottom:0;left:0}
.hotspot.top-right:hover ~ .page-right,.hotspot.bottom-right:hover ~ .page-right{transform:rotateY(-3deg) rotateX(1deg);box-shadow:20px 20px 40px rgba(0,0,0,0.4)}
.hotspot.top-left:hover ~ .page-left,.hotspot.bottom-left:hover ~ .page-left{transform:rotateY(3deg) rotateX(1deg);box-shadow:-20px 20px 40px rgba(0,0,0,0.4)}
.flip-container{position:absolute;top:0;width:480px;height:680px;transform-style:preserve-3d;z-index:50}
.flip-front,.flip-back{position:absolute;inset:0;backface-visibility:hidden;border-radius:6px;overflow:hidden;background-color:#fcf8f0}
.flip-back{transform:rotateY(180deg)}
@keyframes turnNextCover{0%{transform:rotateY(0deg)}100%{transform:rotateY(-180deg)}}@keyframes turnPrevCover{0%{transform:rotateY(0deg)}100%{transform:rotateY(180deg)}}
@keyframes turnNextPaper{0%{transform:rotateY(0deg) skewY(0deg)}45%{transform:rotateY(-80deg) skewY(-2.5deg)}100%{transform:rotateY(-180deg) skewY(0deg)}}
@keyframes turnPrevPaper{0%{transform:rotateY(0deg) skewY(0deg)}45%{transform:rotateY(80deg) skewY(2.5deg)}100%{transform:rotateY(180deg) skewY(0deg)}}
.lighting-overlay{position:absolute;inset:0;pointer-events:none;z-index:40;opacity:0}
.flip-front .lighting-overlay{background:linear-gradient(to right,rgba(0,0,0,0) 0%,rgba(0,0,0,0.15) 100%)}
.flip-back .lighting-overlay{background:linear-gradient(to left,rgba(0,0,0,0) 0%,rgba(0,0,0,0.15) 100%)}
@keyframes fadeOutNextFront{0%{opacity:0}100%{opacity:1}}@keyframes fadeInNextBack{0%{opacity:1}100%{opacity:0}}
@keyframes fadeOutPrevFront{0%{opacity:0}100%{opacity:1}}@keyframes fadeInPrevBack{0%{opacity:1}100%{opacity:0}}
.animate-next-front{animation:fadeOutNextFront 0.95s cubic-bezier(0.4,0,0.2,1) forwards}
.animate-next-back{animation:fadeInNextBack 0.95s cubic-bezier(0.4,0,0.2,1) forwards}
.animate-prev-front{animation:fadeOutPrevFront 0.95s cubic-bezier(0.4,0,0.2,1) forwards}
.animate-prev-back{animation:fadeInPrevBack 0.95s cubic-bezier(0.4,0,0.2,1) forwards}
input[type=range]{-webkit-appearance:none;background:transparent}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;height:12px;width:12px;border-radius:50%;background:#D4AF37;cursor:pointer;margin-top:-5px}
input[type=range]::-webkit-slider-runnable-track{width:100%;height:2px;cursor:pointer;background:#334155}
@keyframes bounceRight{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}
.red-arrow{animation:bounceRight 1.5s infinite}
`;

interface Props {
  pages: string[];
  title: string;
  typeLabel: string;
  onToast?: (msg: string) => void;
}

export const ElectronicLibraryView: React.FC<Props> = ({ pages, title, typeLabel }) => {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flipState, setFlipState] = useState<'next' | 'prev' | null>(null);
  const bookAreaRef = useRef<HTMLDivElement>(null);

  const formatRawText = (rawText: string, pageNumber: number) => {
    let lines = rawText.trim().split('\n');
    let html = `<div class="page-content-fit" style="transform-origin: top center; width: 100%;">`;
    lines.forEach(line => {
      line = line.trim();
      if (!line) return;
      line = line.replace(/^(Моддаи \d+\.)/g, '<b class="text-amber-900">$1</b>');
      if (line.match(/^БОБИ /) || line.includes('МУҚАРРАРОТИ ИНТИҚОЛӢ') || line.includes('КОНСТИТУТСИЯИ ҶУМҲУРИИ ТОҶИКИСТОН')) {
        html += `<h4 class="font-bold mt-4 mb-3 text-center text-sm tracking-wide text-amber-950 uppercase">${line}</h4>`;
      } else if (line.includes('ҲАМИН КОНСТИТУТСИЯРО')) {
        html += `<p class="text-center font-bold my-4 text-amber-900 uppercase">${line}</p>`;
      } else {
        html += `<p class="mb-2 text-justify indent-6">${line}</p>`;
      }
    });
    html += `</div><div class="absolute bottom-4 left-0 right-0 text-center text-[10px] text-neutral-400 font-sans tracking-widest">${pageNumber}</div>`;
    return html;
  };

  const bookSpreads = useMemo(() => {
    const spreads: { left: string; right: string }[] = [];
    const formattedTitle = title.toUpperCase().length > 25 ? title.toUpperCase().replace(' ', '<br>') : title.toUpperCase();
    spreads.push({
      left: '',
      right: `<div class="hard-cover w-full h-full flex flex-col items-center justify-between p-12 relative text-center"><div class="mt-8"><span class="text-[10px] uppercase tracking-[0.3em] font-serif-book gold-text opacity-90">${typeLabel}</span></div><div class="flex flex-col items-center gap-10"><h2 class="font-title text-[28px] gold-text tracking-[0.15em] leading-[1.6] uppercase">${formattedTitle}</h2><div class="w-14 h-14 rounded-full border border-[#D4AF37] flex items-center justify-center opacity-80 mt-4">TJ</div></div><div class="flex flex-col items-center mb-4"><p class="text-[10px] tracking-[0.2em] gold-text opacity-70 uppercase font-sans mb-8">SUD.TJ &bull; PDF</p><p class="text-[9px] gold-text opacity-50 font-sans tracking-wide">Потяните угол, чтобы открыть</p></div></div>`
    });
    for (let i = 0; i < pages.length; i += 2) {
      let right = '';
      if (i + 1 < pages.length) right = `<div class="paper-inner">${formatRawText(pages[i + 1], i + 2)}</div>`;
      else right = `<div class="hard-cover w-full h-full flex items-center justify-center text-center"><div class="w-16 h-16 rounded-full border border-[#D4AF37]/30 flex items-center justify-center opacity-50 text-[#D4AF37]">✦</div></div>`;
      spreads.push({ left: `<div class="paper-inner">${formatRawText(pages[i], i + 1)}</div>`, right });
    }
    return spreads;
  }, [pages, title, typeLabel]);

  const totalSpreads = bookSpreads.length - 1;

  const fitPages = useCallback(() => {
    document.querySelectorAll('.electronic-view .paper-inner').forEach(page => {
      const content = page.querySelector('.page-content-fit') as HTMLElement;
      if (!content) return;
      content.style.transform = 'scale(1)';
      const available = (page as HTMLElement).clientHeight - 80;
      const actual = content.scrollHeight;
      if (actual > available) content.style.transform = `scale(${available / actual})`;
    });
  }, []);

  const handleResize = useCallback(() => {
    if (!bookAreaRef.current) return;
    const s = Math.min((bookAreaRef.current.clientWidth - 80) / 960, (bookAreaRef.current.clientHeight - 240) / 680);
    const scaler = bookAreaRef.current.querySelector('.book-scaler') as HTMLElement;
    if (scaler) scaler.style.transform = `scale(${Math.min(1, s)})`;
    fitPages();
  }, [fitPages]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => { fitPages(); }, [currentSpread, fitPages]);

  const executeFlip = useCallback((dir: 'next' | 'prev') => {
    if (isAnimating) return;
    if (dir === 'next' && currentSpread >= totalSpreads) return;
    if (dir === 'prev' && currentSpread <= 0) return;
    setIsAnimating(true);
    setFlipState(dir);
    const isCover = (currentSpread === 0 && dir === 'next') || (currentSpread === 1 && dir === 'prev');
    const d = isCover ? 700 : 950;
    setTimeout(() => {
      setCurrentSpread(c => dir === 'next' ? c + 1 : c - 1);
      setFlipState(null);
      setIsAnimating(false);
    }, d);
  }, [isAnimating, currentSpread, totalSpreads]);

  const renderFlipBlock = () => {
    if (!flipState) return null;
    const isCover = (currentSpread === 0 && flipState === 'next') || (currentSpread === 1 && flipState === 'prev');
    const anim = flipState === 'next' ? (isCover ? 'turnNextCover' : 'turnNextPaper') : (isCover ? 'turnPrevCover' : 'turnPrevPaper');
    const dur = isCover ? '0.7s' : '0.95s';
    if (flipState === 'next') {
      return (
        <div className="flip-container" style={{ right: 0, transformOrigin: 'left center', animation: `${anim} ${dur} cubic-bezier(0.4,0,0.2,1) forwards` }}>
          <div className="flip-front spine-shadow-left" dangerouslySetInnerHTML={{ __html: bookSpreads[currentSpread].right }} />
          <div className="flip-back spine-shadow-right" dangerouslySetInnerHTML={{ __html: bookSpreads[currentSpread + 1].left }} />
        </div>
      );
    }
    return (
      <div className="flip-container" style={{ left: 0, transformOrigin: 'right center', animation: `${anim} ${dur} cubic-bezier(0.4,0,0.2,1) forwards` }}>
        <div className="flip-front spine-shadow-right" dangerouslySetInnerHTML={{ __html: bookSpreads[currentSpread].left }} />
        <div className="flip-back spine-shadow-left" dangerouslySetInnerHTML={{ __html: bookSpreads[currentSpread - 1].right }} />
      </div>
    );
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent, dir: 'next' | 'prev') => {
    if (isAnimating) return;
    const sx = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const onMove = (ev: MouseEvent | TouchEvent) => {
      const cx = 'touches' in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX;
      const diff = cx - sx;
      if (dir === 'next' && diff < -50) { cleanup(); executeFlip('next'); }
      if (dir === 'prev' && diff > 50) { cleanup(); executeFlip('prev'); }
    };
    const cleanup = () => {
      document.removeEventListener('mousemove', onMove as any);
      document.removeEventListener('mouseup', cleanup);
      document.removeEventListener('touchmove', onMove as any);
      document.removeEventListener('touchend', cleanup);
    };
    document.addEventListener('mousemove', onMove as any);
    document.addEventListener('mouseup', cleanup);
    document.addEventListener('touchmove', onMove as any, { passive: false } as any);
    document.addEventListener('touchend', cleanup);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') executeFlip('next');
      if (e.key === 'ArrowLeft') executeFlip('prev');
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [executeFlip]);

  return (
    <div className="electronic-view flex flex-col w-full h-[68vh] min-h-[520px]">
      <style dangerouslySetInnerHTML={{ __html: BookCSS }} />
      <div className="flex-1 relative overflow-hidden flex items-center justify-center" ref={bookAreaRef}>
        <div className="stage-container">
          <div className="book-scaler">
            <div className={`book-wrapper ${currentSpread === 0 && !flipState ? 'is-closed' : ''}`}>
              <div className="book-bg" />
              <div className="book-page page-left spine-shadow-right" dangerouslySetInnerHTML={{ __html: flipState ? '' : (currentSpread > 0 ? bookSpreads[currentSpread].left : '') }} />
              <div className="book-page page-right spine-shadow-left" dangerouslySetInnerHTML={{ __html: flipState ? '' : bookSpreads[flipState === 'next' ? currentSpread + 1 : currentSpread]?.right || bookSpreads[currentSpread].right }} />
              <div className="hotspot top-right" onMouseDown={e => startDrag(e, 'next')} onTouchStart={e => startDrag(e, 'next')} />
              <div className="hotspot bottom-right" onMouseDown={e => startDrag(e, 'next')} onTouchStart={e => startDrag(e, 'next')} />
              <div className="hotspot top-left" onMouseDown={e => startDrag(e, 'prev')} onTouchStart={e => startDrag(e, 'prev')} />
              <div className="hotspot bottom-left" onMouseDown={e => startDrag(e, 'prev')} onTouchStart={e => startDrag(e, 'prev')} />
              {renderFlipBlock()}
            </div>
          </div>
        </div>
      </div>
      <div className="h-[56px] border-t border-[#1E293B] bg-[#0B0E14] flex items-center justify-between px-6 shrink-0">
        <button onClick={() => executeFlip('prev')} className="text-white hover:text-[#D4AF37] flex items-center text-sm">Назад</button>
        <div className="flex-1 px-6 flex items-center gap-2">
          <span className="text-[10px] text-[#D4AF37] font-mono">{currentSpread === 0 ? 'Муқова' : `${currentSpread * 2 - 1}-${currentSpread * 2}`}</span>
          <input type="range" min={0} max={totalSpreads} value={currentSpread} onChange={e => setCurrentSpread(parseInt(e.target.value))} className="flex-1" />
        </div>
        <button onClick={() => executeFlip('next')} className="text-white hover:text-[#D4AF37] flex items-center text-sm">Вперёд</button>
      </div>
    </div>
  );
};

export default ElectronicLibraryView;
