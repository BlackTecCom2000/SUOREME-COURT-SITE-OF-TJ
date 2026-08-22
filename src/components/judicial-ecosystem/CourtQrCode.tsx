import React from 'react';

interface CourtQrCodeProps {
  url?: string;
  value?: string;
  domain?: string;
  size?: number;
  className?: string;
}

export const CourtQrCode: React.FC<CourtQrCodeProps> = ({
  url,
  value,
  domain,
  size = 120,
  className = '',
}) => {
  const targetUrl = url || value || 'http://sud.tj';
  const seedDomain = domain || targetUrl;

  // Deterministic pseudo-random pattern based on domain string to generate realistic QR matrix
  const getMatrixPattern = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const matrix: boolean[][] = Array(21).fill(false).map(() => Array(21).fill(false));

    // Fill finder patterns (top-left, top-right, bottom-left)
    const setFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 || r === 6 || c === 0 || c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[startY + r][startX + c] = true;
          }
        }
      }
    };

    setFinder(0, 0);
    setFinder(14, 0);
    setFinder(0, 14);

    // Fill alignment & timing patterns
    for (let i = 8; i < 13; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    // Fill data area pseudo-deterministically
    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c > 12) ||
          (r > 12 && c < 8)
        ) {
          continue;
        }
        if (matrix[r][c]) continue;
        const val = ((hash ^ (r * 31 + c * 17)) & 0xff);
        matrix[r][c] = (val % 3 === 0 || val % 5 === 0);
      }
    }

    return matrix;
  };

  const matrix = getMatrixPattern(seedDomain);

  return (
    <div
      className={`inline-flex flex-col items-center justify-center p-2 rounded-lg bg-white ${className}`}
      style={{ width: size + 16, height: size + 16 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 21 21"
        className="shape-rendering-crispEdges select-none"
      >
        {matrix.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                fill="#000000"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};
