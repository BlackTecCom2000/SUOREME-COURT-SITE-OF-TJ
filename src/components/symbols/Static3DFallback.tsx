import { DigitalThemis } from './DigitalThemis';
import { DigitalJusticeScales } from './DigitalJusticeScales';
import { DigitalJudicialHammer } from './DigitalJudicialHammer';

export const Static3DFallback = ({ symbol, fallbackPath }: { symbol: string, fallbackPath: string }) => {
  const fallbackContent = () => {
    switch (symbol) {
      case 'themis':
        return <DigitalThemis />;
      case 'scales':
        return <DigitalJusticeScales />;
      case 'hammer':
        return <DigitalJudicialHammer />;
      default:
        return (
          <img
            src={fallbackPath}
            alt={`${symbol} 3D Fallback`}
            className="w-3/4 max-w-[320px] h-auto object-contain opacity-85 scale-95 transition-transform duration-700 ease-in-out"
            loading="lazy"
          />
        );
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/5">
      {fallbackContent()}
    </div>
  );
};
