import React from "react";

interface SlidingNumberProps {
  value: number | string;
  className?: string;
  duration?: number;
  stagger?: number;
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const DigitColumn: React.FC<{ digit: number; duration: number; delay: number }> = ({ digit, duration, delay }) => (
  <span className="inline-block overflow-hidden h-[1em] leading-[1em] align-baseline" aria-hidden="true">
    <span
      className="flex flex-col" style={{ transform: "translateY(-" + digit + "em)", transitionProperty: "transform", transitionDuration: duration + "ms", transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)", transitionDelay: delay + "ms" }}>
      {DIGITS.map((d) => (
        <span key={d} className="h-[1em] leading-[1em] flex items-center justify-center">{d}</span>
      ))}
    </span>
  </span>
);

export const SlidingNumber: React.FC<SlidingNumberProps> = ({ value, className = "", duration = 700, stagger = 45 }) => {
  const chars = String(value).split("");
  let digitIndex = 0;
  return (
    <span className={"inline-flex items-baseline tabular-nums leading-none " + className} aria-label={String(value)}>
      {chars.map((ch, i) => {
        const d = parseInt(ch, 10);
        if (Number.isNaN(d)) {
          return (<span key={i} className="inline-block h-[1em] leading-[1em]">{ch}</span>);
        }
        const delay = digitIndex * stagger;
        digitIndex += 1;
        return <DigitColumn key={i} digit={d} duration={duration} delay={delay} />;
      })}
    </span>
  );
};

export default SlidingNumber;
