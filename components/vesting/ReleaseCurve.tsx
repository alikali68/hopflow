import React from 'react';

export interface CurvePoint {
  month: number;
  pct: number;
}

export interface CurveXLabel {
  month: number;
  label: string;
}

interface ReleaseCurveProps {
  points: CurvePoint[];
  months: number;
  xLabels: CurveXLabel[];
  ariaLabel: string;
  tgeLabel: string;
}

const Y_LABELS = [0, 25, 50, 75, 100];

export default function ReleaseCurve({ points, months, xLabels, ariaLabel, tgeLabel }: ReleaseCurveProps) {
  const PAD_L = 44;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;
  const W = 640;
  const H = 260;

  const x = (month: number) => PAD_L + (month / months) * (W - PAD_L - PAD_R);
  const y = (pct: number) => PAD_T + (1 - pct / 100) * (H - PAD_T - PAD_B);

  // Line path points
  const lineD = points.reduce((acc, pt, index) => {
    const cmd = index === 0 ? 'M' : 'L';
    return `${acc} ${cmd} ${x(pt.month)} ${y(pt.pct)}`;
  }, '');

  // Closed area path for gradient fill
  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  const areaD = `${lineD} L ${x(lastPt.month)} ${y(0)} L ${x(firstPt.month)} ${y(0)} Z`;

  const tgePct = points[0]?.pct ?? 0;

  return (
    <div className="relative mt-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full select-none"
        role="img"
        aria-label={ariaLabel}
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
          cy={y(tgePct)}
          r={10}
          fill="#14F195"
          opacity={0.25}
        />
        <circle
          cx={x(0)}
          cy={y(tgePct)}
          r={5}
          fill="#14F195"
        />
        <text
          x={x(0) + 12}
          y={y(tgePct) - 8}
          fill="#14F195"
          fontSize={12}
          fontWeight={700}
          fontFamily="var(--font-space-grotesk), sans-serif"
        >
          {tgeLabel}
        </text>

        {/* X-axis labels */}
        {xLabels.map((item, i) => {
          const isLast = i === xLabels.length - 1;
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
