import React from 'react';

interface NationalEmblemProps {
  className?: string;
  size?: number;
}

export const NationalEmblem: React.FC<NationalEmblemProps> = ({
  className = '',
  size = 48,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="Эмблема Республики Таджикистан"
    >
      {/* Outer subtle glow circle */}
      <circle cx="50" cy="50" r="46" stroke="#c5a059" strokeWidth="1.2" strokeOpacity="0.6" strokeDasharray="3 2" />
      <circle cx="50" cy="50" r="43" stroke="#c5a059" strokeWidth="0.8" strokeOpacity="0.4" />

      {/* Sun rays rising */}
      <g stroke="#dfbe7e" strokeWidth="1" strokeOpacity="0.7">
        <line x1="50" y1="50" x2="50" y2="18" />
        <line x1="50" y1="50" x2="32" y2="22" />
        <line x1="50" y1="50" x2="68" y2="22" />
        <line x1="50" y1="50" x2="20" y2="34" />
        <line x1="50" y1="50" x2="80" y2="34" />
        <line x1="50" y1="50" x2="14" y2="50" />
        <line x1="50" y1="50" x2="86" y2="50" />
      </g>

      {/* Mountain silhouettes behind */}
      <path
        d="M26 62L40 45L50 54L64 38L76 62H26Z"
        fill="#c5a059"
        fillOpacity="0.25"
        stroke="#c5a059"
        strokeWidth="1"
      />

      {/* Crown above mountains */}
      <g stroke="#dfbe7e" strokeWidth="1.2" fill="#c5a059" fillOpacity="0.4">
        <path d="M42 42L45 49H55L58 42L53 45L50 37L47 45L42 42Z" />
      </g>

      {/* 7 Stars arch above the crown */}
      <g fill="#ffffff" stroke="#c5a059" strokeWidth="0.5">
        <circle cx="50" cy="28" r="1.8" />
        <circle cx="43" cy="30" r="1.5" />
        <circle cx="57" cy="30" r="1.5" />
        <circle cx="37" cy="34" r="1.3" />
        <circle cx="63" cy="34" r="1.3" />
        <circle cx="32" cy="40" r="1.2" />
        <circle cx="68" cy="40" r="1.2" />
      </g>

      {/* Wreath of cotton & wheat arches */}
      <path
        d="M22 66C22 45 28 32 35 25"
        stroke="#dfbe7e"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />
      <path
        d="M78 66C78 45 72 32 65 25"
        stroke="#dfbe7e"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />

      {/* Ribbon base */}
      <path
        d="M32 72C42 76 58 76 68 72L65 78C55 81 45 81 35 78L32 72Z"
        fill="#c5a059"
        fillOpacity="0.3"
        stroke="#dfbe7e"
        strokeWidth="1"
      />

      {/* Open law book / foundation base */}
      <path
        d="M36 65C43 62 49 64 50 66C51 64 57 62 64 65L63 70C57 67 52 69 50 71C48 69 43 67 37 70L36 65Z"
        fill="#ffffff"
        fillOpacity="0.15"
        stroke="#ffffff"
        strokeWidth="0.8"
      />
    </svg>
  );
};
