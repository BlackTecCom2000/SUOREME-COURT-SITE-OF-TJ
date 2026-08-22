import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

export const BlueprintBackgroundCircuits: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden transition-opacity duration-700"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="circuitCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#00e5ff' : '#0284c7'} stopOpacity="0.4" />
          <stop offset="100%" stopColor={isDark ? '#00e5ff' : '#0284c7'} stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="circuitGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#dfbe7e' : '#b88a24'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={isDark ? '#dfbe7e' : '#b88a24'} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Outer Border Frame with Tech Corner Accents */}
      <rect
        x="15"
        y="15"
        width="1890"
        height="1050"
        fill="none"
        stroke={isDark ? '#dfbe7e' : '#cbd5e1'}
        strokeWidth="1"
        strokeOpacity={isDark ? 0.25 : 0.6}
        rx="8"
      />
      <rect
        x="20"
        y="20"
        width="1880"
        height="1040"
        fill="none"
        stroke={isDark ? '#00e5ff' : '#94a3b8'}
        strokeWidth="0.5"
        strokeOpacity={isDark ? 0.15 : 0.4}
        rx="6"
      />

      {/* Top Left Corner Tech Bracket */}
      <path d="M 15 60 L 15 15 L 60 15" fill="none" stroke={isDark ? '#dfbe7e' : '#ca8a04'} strokeWidth="2.5" />
      <path d="M 30 75 L 30 30 L 75 30" fill="none" stroke={isDark ? '#00e5ff' : '#0284c7'} strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="65" cy="15" r="3" fill={isDark ? '#dfbe7e' : '#ca8a04'} />
      <circle cx="15" cy="65" r="3" fill={isDark ? '#dfbe7e' : '#ca8a04'} />

      {/* Top Right Corner Tech Bracket */}
      <path d="M 1905 60 L 1905 15 L 1860 15" fill="none" stroke={isDark ? '#dfbe7e' : '#ca8a04'} strokeWidth="2.5" />
      <path d="M 1890 75 L 1890 30 L 1845 30" fill="none" stroke={isDark ? '#00e5ff' : '#0284c7'} strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="1855" cy="15" r="3" fill={isDark ? '#dfbe7e' : '#ca8a04'} />
      <circle cx="1905" cy="65" r="3" fill={isDark ? '#dfbe7e' : '#ca8a04'} />

      {/* Bottom Left Corner Tech Bracket */}
      <path d="M 15 1020 L 15 1065 L 60 1065" fill="none" stroke={isDark ? '#dfbe7e' : '#ca8a04'} strokeWidth="2.5" />
      <path d="M 30 1005 L 30 1050 L 75 1050" fill="none" stroke={isDark ? '#00e5ff' : '#0284c7'} strokeWidth="1" strokeOpacity="0.5" />

      {/* Bottom Right Corner Tech Bracket */}
      <path d="M 1905 1020 L 1905 1065 L 1860 1065" fill="none" stroke={isDark ? '#dfbe7e' : '#ca8a04'} strokeWidth="2.5" />
      <path d="M 1890 1005 L 1890 1050 L 1845 1050" fill="none" stroke={isDark ? '#00e5ff' : '#0284c7'} strokeWidth="1" strokeOpacity="0.5" />

      {/* Left Margin Circuit Traces */}
      <g stroke={isDark ? '#00e5ff' : '#0284c7'} strokeWidth="1" strokeOpacity={isDark ? 0.2 : 0.3} fill="none">
        <path d="M 25 120 L 50 145 L 50 350 L 70 370 L 70 580" />
        <circle cx="50" cy="145" r="2" fill={isDark ? '#00e5ff' : '#0284c7'} />
        <circle cx="70" cy="370" r="2" fill={isDark ? '#00e5ff' : '#0284c7'} />
        <path d="M 35 700 L 55 720 L 55 900 L 35 920" />
        <circle cx="55" cy="720" r="2" fill={isDark ? '#00e5ff' : '#0284c7'} />
      </g>

      {/* Right Margin Circuit Traces */}
      <g stroke={isDark ? '#00e5ff' : '#0284c7'} strokeWidth="1" strokeOpacity={isDark ? 0.2 : 0.3} fill="none">
        <path d="M 1895 120 L 1870 145 L 1870 350 L 1850 370 L 1850 580" />
        <circle cx="1870" cy="145" r="2" fill={isDark ? '#00e5ff' : '#0284c7'} />
        <circle cx="1850" cy="370" r="2" fill={isDark ? '#00e5ff' : '#0284c7'} />
        <path d="M 1885 700 L 1865 720 L 1865 900 L 1885 920" />
        <circle cx="1865" cy="720" r="2" fill={isDark ? '#00e5ff' : '#0284c7'} />
      </g>

      {/* Top Header Background Circuit Traces */}
      <g stroke={isDark ? '#dfbe7e' : '#ca8a04'} strokeWidth="1" strokeOpacity={isDark ? 0.18 : 0.25} fill="none">
        <path d="M 300 25 L 340 45 L 550 45" />
        <circle cx="340" cy="45" r="2" fill={isDark ? '#dfbe7e' : '#ca8a04'} />
        <path d="M 1620 25 L 1580 45 L 1370 45" />
        <circle cx="1580" cy="45" r="2" fill={isDark ? '#dfbe7e' : '#ca8a04'} />
      </g>
    </svg>
  );
};
