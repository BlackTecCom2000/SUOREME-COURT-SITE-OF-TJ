import React from 'react';

interface JudicialDataFlowProps {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  glowColor?: string;
}

export const JudicialDataFlow: React.FC<JudicialDataFlowProps> = ({
  orientation = 'vertical',
  className = '',
  glowColor = '#c5a059',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none relative overflow-hidden ${className}`}
    >
      <style>{`
        @keyframes flowPulse {
          0% {
            stroke-dashoffset: 200;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      {orientation === 'vertical' ? (
        <svg
          viewBox="0 0 40 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-full max-h-96 mx-auto opacity-50"
        >
          {/* Background rail line */}
          <line
            x1="20"
            y1="0"
            x2="20"
            y2="400"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
          {/* Animated data pulses */}
          <line
            x1="20"
            y1="0"
            x2="20"
            y2="400"
            stroke={glowColor}
            strokeWidth="2"
            strokeDasharray="20 180"
            style={{
              animation: 'flowPulse 4s linear infinite',
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
          {/* Periodic node dots */}
          <circle cx="20" cy="50" r="3" fill="#ffffff" opacity="0.6" />
          <circle cx="20" cy="200" r="4" fill={glowColor} />
          <circle cx="20" cy="350" r="3" fill="#ffffff" opacity="0.6" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 800 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-8 opacity-50"
        >
          <line
            x1="0"
            y1="20"
            x2="800"
            y2="20"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="20"
            x2="800"
            y2="20"
            stroke={glowColor}
            strokeWidth="2"
            strokeDasharray="30 250"
            style={{
              animation: 'flowPulse 6s linear infinite',
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
          <circle cx="100" cy="20" r="3" fill="#ffffff" opacity="0.6" />
          <circle cx="400" cy="20" r="4" fill={glowColor} />
          <circle cx="700" cy="20" r="3" fill="#ffffff" opacity="0.6" />
        </svg>
      )}
    </div>
  );
};
