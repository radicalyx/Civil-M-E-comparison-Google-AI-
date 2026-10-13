import React, { useState } from 'react';
import {
  LineChart,
  BarChart3,
  SlidersHorizontal,
  Info,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import {
  CatalogueSeries,
  DataObservation,
  NoiseReductionMode,
  NormalisationMode,
  TenderLineItem
} from '../types/index.ts';

interface ChartVisualiserProps {
  catalogue: CatalogueSeries[];
  observationsMap: Record<string, DataObservation[]>;
  selectedSeriesId: string;
  setSelectedSeriesId: (id: string) => void;
  normalisation: NormalisationMode;
  setNormalisation: (mode: NormalisationMode) => void;
  noiseReduction: NoiseReductionMode;
  setNoiseReduction: (mode: NoiseReductionMode) => void;
  items: TenderLineItem[];
  itemResults: any[];
}

export const ChartVisualiser: React.FC<ChartVisualiserProps> = ({
  catalogue,
  observationsMap,
  selectedSeriesId,
  setSelectedSeriesId,
  normalisation,
  setNormalisation,
  noiseReduction,
  setNoiseReduction,
  items,
  itemResults
}) => {
  const [chartType, setChartType] = useState<'SERIES_TREND' | 'TENDER_VS_BENCHMARK' | 'COST_WATERFALL'>('SERIES_TREND');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeSeries = catalogue.find(s => s.id === selectedSeriesId) || catalogue[0];
  const observations = observationsMap[selectedSeriesId] || [];

  // Prepare SVG line chart calculations
  const chartWidth = 720;
  const chartHeight = 260;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };

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

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
      {/* Chart Header & Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
            <LineChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Statistical Analytics &amp; Visualisation Engine
            </h3>
            <p className="text-xs text-slate-500">
              Interactive historical time series, rebased indexing, and cost waterfalls
            </p>
          </div>
        </div>

        {/* Chart View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
          <button
            onClick={() => setChartType('SERIES_TREND')}
            className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
              chartType === 'SERIES_TREND' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Historical Series Trend
          </button>
          <button
            onClick={() => setChartType('TENDER_VS_BENCHMARK')}
            className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
              chartType === 'TENDER_VS_BENCHMARK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tender vs Benchmark Bars
          </button>
          <button
            onClick={() => setChartType('COST_WATERFALL')}
            className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
              chartType === 'COST_WATERFALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cost Breakdown Waterfall
          </button>
        </div>
      </div>

      {/* Control Groups for Normalisation and Noise Reduction */}
      {chartType === 'SERIES_TREND' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
          {/* Series Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Select Series
            </label>
            <select
              value={selectedSeriesId}
              onChange={(e) => setSelectedSeriesId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            >
              {catalogue.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  [{cat.publisher.split(' ')[0]}] {cat.title}
                </option>
              ))}
            </select>
          </div>

          {/* Normalisation Controls */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Normalisation Mode</span>
              {normalisation === 'Z_SCORE' && (
                <span className="text-[10px] text-amber-700 font-normal">Unitless Only</span>
              )}
            </label>
            <select
              value={normalisation}
              onChange={(e) => setNormalisation(e.target.value as NormalisationMode)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="RAW">Raw Published Values (Default)</option>
              <option value="REBASED_100">Rebase to 100 at Common Baseline</option>
              <option value="PERCENT_CHANGE">% Change from Baseline</option>
              <option value="YOY_CHANGE">Year-on-Year % Change</option>
              <option value="Z_SCORE">Z-Score (Unitless Statistical Trend)</option>
            </select>
          </div>

          {/* Noise Reduction Controls */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Noise Reduction (Smoothing)</span>
              {noiseReduction !== 'NONE' && (
                <span className="text-[10px] text-amber-700 font-bold">Lag Introduced</span>
              )}
            </label>
            <select
              value={noiseReduction}
              onChange={(e) => setNoiseReduction(e.target.value as NoiseReductionMode)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="NONE">None (Raw Published Series - Procurement Standard)</option>
              <option value="TRAILING_SMA_3">Trailing SMA (3 Periods / 1-Period Lag)</option>
              <option value="TRAILING_SMA_6">Trailing SMA (6 Periods / 2.5-Period Lag)</option>
              <option value="ROLLING_MEDIAN_3">Trailing Rolling Median (3 Periods)</option>
              <option value="EMA_ALPHA_3">Exponential Moving Average (EMA, α=0.3)</option>
              <option value="FOUR_QUARTER_TRAIL">4-Quarter Trailing Average (For Quarterly Series)</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Chart Area */}
      {chartType === 'SERIES_TREND' && (
        <div className="space-y-2">
          {/* Active Series Metadata Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50/70 p-2 rounded border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{activeSeries.title}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 font-mono text-[11px]">{activeSeries.unit}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 font-mono text-[11px]">{activeSeries.frequency}</span>
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              Latest: {activeSeries.latestPeriod} ({activeSeries.latestValue ?? 'Published'})
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative w-full overflow-x-auto bg-slate-950 rounded-lg p-2 text-slate-100">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-64 sm:h-72 select-none"
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = padding.top + usableHeight * pct;
                const val = yMax - (pct * (yMax - yMin));
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
                      y={y + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {val.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              {observations.length > 1 && (
                <polygon
                  points={`${pointsString} ${getX(observations.length - 1)},${chartHeight - padding.bottom} ${getX(0)},${chartHeight - padding.bottom}`}
                  fill="rgba(56, 189, 248, 0.12)"
                />
              )}

              {/* Trend Line */}
              {observations.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsString}
                />
              )}

              {/* Data points & X-axis labels */}
              {observations.map((obs, idx) => {
                const cx = getX(idx);
                const cy = getY(obs.value);
                const isHovered = hoveredIndex === idx;

                return (
                  <g key={idx}>
                    {/* Period label on bottom (spaced) */}
                    {(idx % Math.ceil(observations.length / 8) === 0 || idx === observations.length - 1) && (
                      <text
                        x={cx}
                        y={chartHeight - padding.bottom + 18}
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {obs.period}
                      </text>
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 5 : 3}
                      fill={isHovered ? '#38bdf8' : '#0f172a'}
                      stroke="#38bdf8"
                      strokeWidth={isHovered ? 2 : 1.5}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />

                    {/* Tooltip on hover */}
                    {isHovered && (
                      <g>
                        <rect
                          x={cx - 50}
                          y={cy - 36}
                          width="100"
                          height="28"
                          rx="4"
                          fill="#0f172a"
                          stroke="#475569"
                          strokeWidth="1"
                        />
                        <text
                          x={cx}
                          y={cy - 22}
                          fill="#f8fafc"
                          fontSize="10"
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
      )}

      {/* Tender vs Benchmark Bar Chart */}
      {chartType === 'TENDER_VS_BENCHMARK' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-600">
            Comparing Current Tender Submission vs Index-Adjusted Baseline Benchmark (All figures in SGD).
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const res = itemResults[idx];
              if (!res) return null;

              const maxCost = Math.max(res.tenderCostSgd, res.benchmarkCostSgd, 1);
              const tenderPct = (res.tenderCostSgd / maxCost) * 100;
              const benchmarkPct = (res.benchmarkCostSgd / maxCost) * 100;
              const isOver = res.varianceSgd > 0;

              return (
                <div key={item.id} className="border border-slate-200 rounded p-3 bg-slate-50/50 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-slate-800">
                    <span className="truncate max-w-md">{item.description}</span>
                    <span className={`font-mono ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isOver ? '+' : ''}SGD {res.varianceSgd.toLocaleString()} ({isOver ? '+' : ''}{res.variancePercent}%)
                    </span>
                  </div>

                  {/* Benchmark bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Index Benchmark</span>
                      <span>SGD {res.benchmarkCostSgd.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${benchmarkPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Tender bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Current Tender ({item.tendererName})</span>
                      <span>SGD {res.tenderCostSgd.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${tenderPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cost Breakdown Waterfall */}
      {chartType === 'COST_WATERFALL' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-600">
            Component Cost Contribution for M&amp;E Composite Packages &amp; Maintenance Contracts.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items
              .filter(i => i.category === 'ME_TRADE' || i.category === 'MAINTENANCE')
              .map((item, idx) => {
                const res = itemResults[items.indexOf(item)];
                const trace = res?.trace;
                const components = trace?.breakdownDetails?.compositeComponents;
                const maintenanceDetails = trace?.breakdownDetails;

                return (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                    <div className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                      {item.description}
                    </div>

                    {/* Composite Trade Components */}
                    {components && components.length > 0 && (
                      <div className="space-y-1.5 text-xs">
                        <div className="text-[11px] text-slate-500 font-semibold uppercase">
                          Composite Cost Distribution
                        </div>
                        {components.map((c: any, cIdx: number) => (
                          <div key={cIdx} className="space-y-0.5">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-700">{c.name} ({c.weight}%)</span>
                              <span className="font-mono text-slate-900">
                                Index factor: {c.componentFactor.toFixed(3)}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full"
                                style={{ width: `${c.weight}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Maintenance Labour vs Non-Labour */}
                    {maintenanceDetails?.labourBaselineSgd !== undefined && (
                      <div className="space-y-2 text-xs">
                        <div className="text-[11px] text-slate-500 font-semibold uppercase">
                          Maintenance Component Split
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <div className="text-[10px] text-slate-500">Labour Component ({item.labourSharePercent || 70}%)</div>
                            <div className="font-mono font-bold text-slate-900 text-xs">
                              SGD {maintenanceDetails.labourAdjustedSgd?.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-blue-600">
                              Escalated via {item.overrideBenchmarkSeriesId || item.benchmarkSeriesId}
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <div className="text-[10px] text-slate-500">Non-Labour Spares ({100 - (item.labourSharePercent || 70)}%)</div>
                            <div className="font-mono font-bold text-slate-900 text-xs">
                              SGD {maintenanceDetails.nonLabourAdjustedSgd?.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Fixed / Factor 1.0
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
