import React, { useState } from 'react';
import { LineChart, Calendar, TrendingUp, Info } from 'lucide-react';
import { CatalogueSeries, DataObservation } from '../types/index.ts';

interface PriceIndexChartProps {
  title: string;
  subtitle: string;
  availableSeries: CatalogueSeries[];
  observationsMap: Record<string, DataObservation[]>;
  selectedSeriesId: string;
  onSelectSeriesId: (id: string) => void;
  highlightBaselinePeriod?: string;
  highlightTenderPeriod?: string;
  colorTheme?: 'blue' | 'indigo' | 'emerald' | 'slate';
}

export const PriceIndexChart: React.FC<PriceIndexChartProps> = ({
  title,
  subtitle,
  availableSeries,
  observationsMap,
  selectedSeriesId,
  onSelectSeriesId,
  highlightBaselinePeriod,
  highlightTenderPeriod,
  colorTheme = 'blue'
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeSeries = availableSeries.find(s => s.id === selectedSeriesId) || availableSeries[0];
  const observations = activeSeries ? (observationsMap[activeSeries.id] || []) : [];

  // Theme configuration
  const themes = {
    blue: {
      border: 'border-blue-200',
      activeTab: 'bg-blue-600 text-white',
      lineStroke: '#2563eb',
      areaFill: 'rgba(37, 99, 235, 0.12)',
      pointStroke: '#2563eb',
      pointFill: '#1d4ed8',
      markerBaseline: '#475569',
      markerTender: '#2563eb',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    indigo: {
      border: 'border-indigo-200',
      activeTab: 'bg-indigo-600 text-white',
      lineStroke: '#4f46e5',
      areaFill: 'rgba(79, 70, 229, 0.12)',
      pointStroke: '#4f46e5',
      pointFill: '#4338ca',
      markerBaseline: '#475569',
      markerTender: '#4f46e5',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    },
    emerald: {
      border: 'border-emerald-200',
      activeTab: 'bg-emerald-600 text-white',
      lineStroke: '#059669',
      areaFill: 'rgba(5, 150, 105, 0.12)',
      pointStroke: '#059669',
      pointFill: '#047857',
      markerBaseline: '#475569',
      markerTender: '#059669',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    slate: {
      border: 'border-slate-200',
      activeTab: 'bg-slate-900 text-white',
      lineStroke: '#0f172a',
      areaFill: 'rgba(15, 23, 42, 0.10)',
      pointStroke: '#0f172a',
      pointFill: '#020617',
      markerBaseline: '#475569',
      markerTender: '#0f172a',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300'
    }
  };

  const theme = themes[colorTheme] || themes.blue;

  // Chart dimensions
  const chartWidth = 760;
  const chartHeight = 220;
  const padding = { top: 25, right: 35, bottom: 35, left: 65 };

  const usableWidth = chartWidth - padding.left - padding.right;
  const usableHeight = chartHeight - padding.top - padding.bottom;

  const values = observations.map(o => o.value);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 100;
  const range = maxVal - minVal > 0 ? maxVal - minVal : 1;
  const yMin = Math.floor(minVal - range * 0.08);
  const yMax = Math.ceil(maxVal + range * 0.08);

  const getX = (idx: number) => {
    if (observations.length <= 1) return padding.left;
    return padding.left + (idx / (observations.length - 1)) * usableWidth;
  };

  const getY = (val: number) => {
    const denom = yMax - yMin > 0 ? yMax - yMin : 1;
    return padding.top + usableHeight - ((val - yMin) / denom) * usableHeight;
  };

  const pointsString = observations
    .map((obs, idx) => `${getX(idx)},${getY(obs.value)}`)
    .join(' ');

  // Look up baseline & tender points for delta annotation
  const baseObs = observations.find(o => o.period === highlightBaselinePeriod);
  const tenderObs = observations.find(o => o.period === highlightTenderPeriod);
  const indexEscalationPct = (baseObs && tenderObs && baseObs.value > 0)
    ? (((tenderObs.value / baseObs.value) - 1) * 100).toFixed(1)
    : null;

  return (
    <div className={`bg-white border ${theme.border} rounded-xl p-4 sm:p-5 shadow-xs space-y-4`}>
      {/* Header and Series Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
            <LineChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{title}</span>
              {indexEscalationPct && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${theme.badgeBg}`}>
                  +{indexEscalationPct}% Escalation in Period
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Quick series pills */}
        <div className="flex flex-wrap gap-1.5 text-xs max-w-full">
          {availableSeries.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSeriesId(s.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                activeSeries?.id === s.id
                  ? theme.activeTab
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.title.length > 28 ? s.title.slice(0, 26) + '...' : s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Series Metadata strip */}
      {activeSeries && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900">{activeSeries.title}</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-slate-600 text-[11px]">{activeSeries.unit}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500 text-[11px]">{activeSeries.publisher}</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Updated to Current Date: {activeSeries.latestPeriod}</span>
            </span>
            <span className="text-slate-500 text-[10px]">
              (Released: {activeSeries.latestReleaseDate})
            </span>
          </div>
        </div>
      )}

      {/* Responsive SVG Chart */}
      <div className="relative w-full overflow-x-auto bg-slate-950 rounded-xl p-3 text-slate-100 shadow-inner">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-56 sm:h-64 select-none"
        >
          {/* Horizontal grid lines and Y-axis values */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padding.top + usableHeight * pct;
            const val = yMax - pct * (yMax - yMin);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val.toFixed(val > 100 ? 0 : 1)}
                </text>
              </g>
            );
          })}

          {/* Shaded Area under the line */}
          {observations.length > 1 && (
            <polygon
              points={`${pointsString} ${getX(observations.length - 1)},${chartHeight - padding.bottom} ${getX(0)},${chartHeight - padding.bottom}`}
              fill={theme.areaFill}
            />
          )}

          {/* Main trend line */}
          {observations.length > 1 && (
            <polyline
              fill="none"
              stroke={theme.lineStroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
            />
          )}

          {/* Observations, markers and X labels */}
          {observations.map((obs, idx) => {
            const cx = getX(idx);
            const cy = getY(obs.value);
            const isHovered = hoveredIndex === idx;
            const isBaseline = obs.period === highlightBaselinePeriod;
            const isTender = obs.period === highlightTenderPeriod;

            return (
              <g key={idx}>
                {/* Vertical marker for Baseline Period */}
                {isBaseline && (
                  <g>
                    <line
                      x1={cx}
                      y1={padding.top}
                      x2={cx}
                      y2={chartHeight - padding.bottom}
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={cx}
                      y={padding.top - 6}
                      fill="#cbd5e1"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      Baseline
                    </text>
                  </g>
                )}

                {/* Vertical marker for Tender Period */}
                {isTender && (
                  <g>
                    <line
                      x1={cx}
                      y1={padding.top}
                      x2={cx}
                      y2={chartHeight - padding.bottom}
                      stroke={theme.lineStroke}
                      strokeWidth="2"
                    />
                    <text
                      x={cx}
                      y={padding.top - 6}
                      fill="#38bdf8"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      Tender
                    </text>
                  </g>
                )}

                {/* X axis periodic labels */}
                {(idx % Math.ceil(observations.length / 8) === 0 || idx === observations.length - 1 || isBaseline || isTender) && (
                  <text
                    x={cx}
                    y={chartHeight - padding.bottom + 16}
                    fill={isTender ? '#38bdf8' : isBaseline ? '#f8fafc' : '#94a3b8'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight={isTender || isBaseline ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {obs.period}
                  </text>
                )}

                {/* Interactive Point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isTender || isBaseline ? 5 : isHovered ? 4.5 : 3}
                  fill={isTender ? '#38bdf8' : isHovered ? '#ffffff' : '#0f172a'}
                  stroke={theme.lineStroke}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Hover Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={Math.max(10, Math.min(chartWidth - 110, cx - 55))}
                      y={Math.max(10, cy - 36)}
                      width="110"
                      height="28"
                      rx="4"
                      fill="#0f172a"
                      stroke="#475569"
                      strokeWidth="1"
                    />
                    <text
                      x={Math.max(10, Math.min(chartWidth - 110, cx - 55)) + 55}
                      y={Math.max(10, cy - 36) + 18}
                      fill="#ffffff"
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {obs.period}: {obs.value}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
