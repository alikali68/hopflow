import React from 'react';
import {
  CURVE_POINTS,
  CURVE_MONTHS,
  X_LABELS,
  Y_LABELS,
} from './previewData';

export default function ReleaseCurve() {
  const PAD_L = 44;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;
  const W = 640;
  const H = 260;

  const x = (month: number) => PAD_L + (month / CURVE_MONTHS) * (W - PAD_L - PAD_R);
  const y = (pct: number) => PAD_T + (1 - pct / 100) * (H - PAD_T - PAD_B);

  // Line path points
  const lineD = CURVE_POINTS.reduce((acc, pt, index) => {
    const cmd = index === 0 ? 'M' : 'L';
    return `${acc} ${cmd} ${x(pt.month)} ${y(pt.pct)}`;
  }, '');

  // Closed area path for gradient fill
  const firstPt = CURVE_POINTS[0];
  const lastPt = CURVE_POINTS[CURVE_POINTS.length - 1];
  const areaD = `${lineD} L ${x(lastPt.month)} ${y(0)} L ${x(firstPt.month)} ${y(0)} Z`;

  return (
    <div className="relative mt-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full select-none"
        role="img"
        aria-label="Release curve: 10 percent unlocked at TGE, flat during the 3-month cliff, then monthly releases to 100 percent by February 2029"
      >
        <defs>
          <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9945FF" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#14F195" stopOpacity={0.05} />
          </linearGradient>

          <linearGradient
            id="curveStroke"
            gradientUnits="userSpaceOnUse"
            x1={PAD_L}
            y1="0"
            x2={W - PAD_R}
            y2="0"
          >
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#14F195" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines & Y labels */}
        {Y_LABELS.map((pct) => (
          <g key={pct}>
            <line
              x1={PAD_L}
              y1={y(pct)}
              x2={W - PAD_R}
              y2={y(pct)}
              stroke="#262637"
              strokeWidth={1}
            />
            <text
              x={PAD_L - 8}
              y={y(pct) + 4}
              textAnchor="end"
              fill="#9A9AB0"
              fontSize={11}
              fontFamily="var(--font-inter), sans-serif"
            >
              {pct}%
            </text>
          </g>
        ))}

        {/* Shaded Area */}
        <path d={areaD} fill="url(#curveFill)" />

        {/* Curve Stroke */}
        <path
          d={lineD}
          fill="none"
          stroke="url(#curveStroke)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* TGE Indicator Node */}
        <circle
          cx={x(0)}
          cy={y(10)}
          r={10}
          fill="#14F195"
          opacity={0.25}
        />
        <circle
          cx={x(0)}
          cy={y(10)}
          r={5}
          fill="#14F195"
        />
        <text
          x={x(0) + 12}
          y={y(10) - 8}
          fill="#14F195"
          fontSize={12}
          fontWeight={700}
          fontFamily="var(--font-space-grotesk), sans-serif"
        >
          TGE 10%
        </text>

        {/* X-axis labels */}
        {X_LABELS.map((item, i) => {
          const isLast = i === X_LABELS.length - 1;
          return (
            <text
              key={item.label}
              x={isLast ? W - 4 : x(item.month)}
              y={H - 8}
              textAnchor={isLast ? 'end' : 'middle'}
              fill="#9A9AB0"
              fontSize={11}
              fontFamily="var(--font-inter), sans-serif"
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
