import React, { useState, useMemo } from 'react';
import { LineChart, Calendar, TrendingUp, Info, Globe, Shield, ArrowRight, CheckCircle2, Sliders, Layers } from 'lucide-react';
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

type GeographicFilter = 'ASIA_PREFERRED' | 'ASIA_ONLY' | 'GLOBAL_ONLY' | 'DOMESTIC_ONLY' | 'ALL';

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
  const [geoFilter, setGeoFilter] = useState<GeographicFilter>('ASIA_PREFERRED');
  const [showDomesticOverlay, setShowDomesticOverlay] = useState<boolean>(true);

  // Classify and sort series to heavily favour Asia & Global data
  const sortedSeries = useMemo(() => {
    return [...availableSeries].sort((a, b) => {
      const getPriority = (s: CatalogueSeries) => {
        if (s.isAsiaRegion || s.geographicScope === 'ASIA' || s.id.includes('-ASIA-')) return 1;
        if (s.isMcpBenchmark || s.geographicScope === 'GLOBAL' || s.id.includes('-GLOBAL-')) return 2;
        return 3; // Domestic SingStat / BCA
      };
      const pA = getPriority(a);
      const pB = getPriority(b);
      if (pA !== pB) return pA - pB;
      return a.title.localeCompare(b.title);
    });
  }, [availableSeries]);

  // Filtered series based on geographic preference
  const displaySeries = useMemo(() => {
    switch (geoFilter) {
      case 'ASIA_ONLY':
        return sortedSeries.filter(s => s.isAsiaRegion || s.geographicScope === 'ASIA' || s.id.includes('-ASIA-'));
      case 'GLOBAL_ONLY':
        return sortedSeries.filter(s => (s.isMcpBenchmark || s.geographicScope === 'GLOBAL') && !s.isAsiaRegion && !s.id.includes('-ASIA-'));
      case 'DOMESTIC_ONLY':
        return sortedSeries.filter(s => !s.isMcpBenchmark && !s.isAsiaRegion && !s.id.includes('-ASIA-') && !s.id.includes('-GLOBAL-'));
      case 'ASIA_PREFERRED':
      default:
        // Shows Asia first, then Global, then Domestic
        return sortedSeries;
    }
  }, [sortedSeries, geoFilter]);

  // Ensure active series is valid; if selected series is domestic but Asia is available and user hasn't explicitly locked it,
  // we still display the selected one or the highest priority series in displaySeries
  const activeSeries = availableSeries.find(s => s.id === selectedSeriesId) || displaySeries[0] || availableSeries[0];
  const observations = activeSeries ? (observationsMap[activeSeries.id] || []) : [];

  // Find equivalent domestic series for overlay comparison if active is Asia/Global
  const companionDomesticSeries = useMemo(() => {
    if (!activeSeries) return null;
    const isMcpOrAsia = activeSeries.isMcpBenchmark || activeSeries.isAsiaRegion || activeSeries.id.includes('MCP-');
    if (!isMcpOrAsia) return null;

    // Map to domestic counterpart
    if (activeSeries.id.includes('STEEL') || activeSeries.id.includes('REBAR')) {
      return availableSeries.find(s => s.id === 'BCA-MAT-STEEL-REBAR') || availableSeries.find(s => s.id === 'SINGSTAT-DSPI-DIV67');
    }
    if (activeSeries.id.includes('CONCRETE')) {
      return availableSeries.find(s => s.id === 'BCA-MAT-CONCRETE-G40');
    }
    if (activeSeries.id.includes('COPPER')) {
      return availableSeries.find(s => s.id === 'SINGSTAT-DSPI-DIV68-COPPER');
    }
    if (activeSeries.id.includes('ALUM')) {
      return availableSeries.find(s => s.id === 'SINGSTAT-DSPI-DIV68-ALUM');
    }
    if (activeSeries.id.includes('STRUCTURAL')) {
      return availableSeries.find(s => s.id === 'SINGSTAT-DSPI-DIV67');
    }
    if (activeSeries.id.includes('EQUIPMENT') || activeSeries.id.includes('MACHINERY')) {
      return availableSeries.find(s => s.id === 'SINGSTAT-IPI-DIV74-PUMPS');
    }
    if (activeSeries.id.includes('SWITCHGEAR')) {
      return availableSeries.find(s => s.id === 'SINGSTAT-IPI-DIV77-SWITCHGEAR');
    }
    if (activeSeries.id.includes('GENERATOR')) {
      return availableSeries.find(s => s.id === 'SINGSTAT-IPI-DIV71-GENERATORS');
    }
    if (activeSeries.id.includes('ELEVATOR')) {
      return availableSeries.find(s => s.id === 'SINGSTAT-IPI-DIV74-LIFTS');
    }
    if (activeSeries.id.includes('LABOUR') || activeSeries.id.includes('MAINTENANCE')) {
      return availableSeries.find(s => s.id === 'SINGSTAT-ULC-CONST') || availableSeries.find(s => s.id === 'MOM-WAGE-TECH-ME');
    }
    return null;
  }, [activeSeries, availableSeries]);

  const companionObservations = companionDomesticSeries ? (observationsMap[companionDomesticSeries.id] || []) : [];

  // Theme configuration
  const themes = {
    blue: {
      border: 'border-blue-200',
      activeTab: 'bg-blue-600 text-white',
      lineStroke: '#2563eb',
      areaFill: 'rgba(37, 99, 235, 0.12)',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    indigo: {
      border: 'border-indigo-200',
      activeTab: 'bg-indigo-600 text-white',
      lineStroke: '#4f46e5',
      areaFill: 'rgba(79, 70, 229, 0.12)',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    },
    emerald: {
      border: 'border-emerald-200',
      activeTab: 'bg-emerald-600 text-white',
      lineStroke: '#059669',
      areaFill: 'rgba(5, 150, 105, 0.12)',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    slate: {
      border: 'border-slate-200',
      activeTab: 'bg-slate-900 text-white',
      lineStroke: '#0f172a',
      areaFill: 'rgba(15, 23, 42, 0.10)',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300'
    }
  };

  const theme = themes[colorTheme] || themes.blue;

  // Chart dimensions
  const chartWidth = 760;
  const chartHeight = 230;
  const padding = { top: 25, right: 35, bottom: 35, left: 65 };

  const usableWidth = chartWidth - padding.left - padding.right;
  const usableHeight = chartHeight - padding.top - padding.bottom;

  // Calculate combined min/max across primary series (and overlay series if enabled and compatible unit)
  const isCompatibleUnit = companionDomesticSeries && (
    (activeSeries?.isUnitRateDataset === companionDomesticSeries.isUnitRateDataset) ||
    (!activeSeries?.isUnitRateDataset && !companionDomesticSeries.isUnitRateDataset)
  );

  const primaryValues = observations.map(o => o.value);
  const overlayValues = (showDomesticOverlay && isCompatibleUnit) ? companionObservations.map(o => o.value) : [];
  const allValues = [...primaryValues, ...overlayValues];

  const minVal = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxVal = allValues.length > 0 ? Math.max(...allValues) : 100;
  const range = maxVal - minVal > 0 ? maxVal - minVal : 1;
  const yMin = Math.floor(minVal - range * 0.08);
  const yMax = Math.ceil(maxVal + range * 0.08);

  const getX = (idx: number, totalLen: number) => {
    if (totalLen <= 1) return padding.left;
    return padding.left + (idx / (totalLen - 1)) * usableWidth;
  };

  const getY = (val: number) => {
    const denom = yMax - yMin > 0 ? yMax - yMin : 1;
    return padding.top + usableHeight - ((val - yMin) / denom) * usableHeight;
  };

  const pointsString = observations
    .map((obs, idx) => `${getX(idx, observations.length)},${getY(obs.value)}`)
    .join(' ');

  // Look up baseline & tender points for delta annotation
  const baseObs = observations.find(o => o.period === highlightBaselinePeriod);
  const tenderObs = observations.find(o => o.period === highlightTenderPeriod);
  const indexEscalationPct = (baseObs && tenderObs && baseObs.value > 0)
    ? (((tenderObs.value / baseObs.value) - 1) * 100).toFixed(1)
    : null;

  // Active series classification tag
  const isAsia = activeSeries?.isAsiaRegion || activeSeries?.geographicScope === 'ASIA' || activeSeries?.id.includes('-ASIA-');
  const isGlobal = !isAsia && (activeSeries?.isMcpBenchmark || activeSeries?.geographicScope === 'GLOBAL' || activeSeries?.id.includes('-GLOBAL-'));

  return (
    <div className={`bg-white border ${theme.border} rounded-xl p-4 sm:p-5 shadow-xs space-y-4`}>
      {/* Header, Geographic Source Selector & Favoured Callout */}
      <div className="space-y-3 border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isAsia ? 'bg-emerald-100 text-emerald-800' : isGlobal ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
              <LineChart className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {title}
                </h3>
                {indexEscalationPct && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${theme.badgeBg}`}>
                    +{indexEscalationPct}% Escalation in Period
                  </span>
                )}
                {/* Priority Source Badge */}
                {isAsia && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <Globe className="w-3 h-3 text-emerald-700" />
                    <span>🌏 Asia Region Benchmark (Favoured)</span>
                  </span>
                )}
                {isGlobal && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                    <Globe className="w-3 h-3 text-blue-700" />
                    <span>🌐 Global Benchmark (Favoured)</span>
                  </span>
                )}
                {!isAsia && !isGlobal && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    <span>🇸🇬 Domestic SingStat / BCA</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Source Geographic Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setGeoFilter('ASIA_PREFERRED')}
              className={`px-2.5 py-1 rounded text-[11px] transition cursor-pointer flex items-center gap-1 ${
                geoFilter === 'ASIA_PREFERRED' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Favour Asia-Pacific regional data and global benchmarks first"
            >
              <span>🌏 Asia Preferred</span>
            </button>
            <button
              onClick={() => setGeoFilter('ASIA_ONLY')}
              className={`px-2.5 py-1 rounded text-[11px] transition cursor-pointer ${
                geoFilter === 'ASIA_ONLY' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Asia Only</span>
            </button>
            <button
              onClick={() => setGeoFilter('GLOBAL_ONLY')}
              className={`px-2.5 py-1 rounded text-[11px] transition cursor-pointer ${
                geoFilter === 'GLOBAL_ONLY' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Global</span>
            </button>
            <button
              onClick={() => setGeoFilter('DOMESTIC_ONLY')}
              className={`px-2.5 py-1 rounded text-[11px] transition cursor-pointer ${
                geoFilter === 'DOMESTIC_ONLY' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>SingStat / BCA</span>
            </button>
            <button
              onClick={() => setGeoFilter('ALL')}
              className={`px-2 py-1 rounded text-[11px] transition cursor-pointer ${
                geoFilter === 'ALL' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All</span>
            </button>
          </div>
        </div>

        {/* Series Selection Pills - Sorted to prioritize Asia and Global data */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
            <span>Select Series:</span>
          </span>
          {displaySeries.map((s) => {
            const isSeriesAsia = s.isAsiaRegion || s.geographicScope === 'ASIA' || s.id.includes('-ASIA-');
            const isSeriesGlobal = !isSeriesAsia && (s.isMcpBenchmark || s.geographicScope === 'GLOBAL' || s.id.includes('-GLOBAL-'));
            const isSelected = activeSeries?.id === s.id;

            return (
              <button
                key={s.id}
                onClick={() => onSelectSeriesId(s.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? (isSeriesAsia ? 'bg-emerald-700 text-white shadow-xs' : isSeriesGlobal ? 'bg-blue-600 text-white shadow-xs' : theme.activeTab)
                    : isSeriesAsia
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : isSeriesGlobal
                    ? 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isSeriesAsia && <span>🌏</span>}
                {isSeriesGlobal && <span>🌐</span>}
                {!isSeriesAsia && !isSeriesGlobal && <span className="text-[10px] text-slate-400">🇸🇬</span>}
                <span>{s.title.length > 32 ? s.title.slice(0, 30) + '...' : s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Series Metadata Strip & Normalisation Formula */}
      {activeSeries && (
        <div className="space-y-2">
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
                <span>Continuously Updated: {activeSeries.latestPeriod}</span>
              </span>
              <span className="text-slate-500 text-[10px]">
                (Released: {activeSeries.latestReleaseDate})
              </span>
            </div>
          </div>

          {/* MCP SGD-Normalisation Explanation banner if Asia/Global */}
          {(activeSeries.isMcpBenchmark || activeSeries.isAsiaRegion) && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-emerald-50/80 border border-emerald-200 rounded-lg px-3 py-2 text-emerald-950">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>{isAsia ? 'Asia Regional Market Clearing Price' : 'Global Market Clearing Price'}:</strong>{' '}
                  {activeSeries.normalisationFormula || 'Drawn from international trade clearing contracts and normalised to SGD.'}
                </span>
              </div>

              {/* Overlay Toggle with Companion Domestic series */}
              {companionDomesticSeries && isCompatibleUnit && (
                <button
                  onClick={() => setShowDomesticOverlay(!showDomesticOverlay)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition border ${
                    showDomesticOverlay
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>{showDomesticOverlay ? 'Hide Domestic Baseline Overlay' : 'Overlay SingStat/BCA Baseline'}</span>
                </button>
              )}
            </div>
          )}

          {/* Switch prompt if user selected a domestic SingStat/BCA series */}
          {!activeSeries.isMcpBenchmark && !activeSeries.isAsiaRegion && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-900">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Viewing domestic statutory series. SingStat and BCA publications typically lag by 1 to 3 months.
                </span>
              </div>
              {sortedSeries.find(s => s.isAsiaRegion || s.isMcpBenchmark) && (
                <button
                  onClick={() => {
                    const topAsia = sortedSeries.find(s => s.isAsiaRegion) || sortedSeries.find(s => s.isMcpBenchmark);
                    if (topAsia) onSelectSeriesId(topAsia.id);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-700 text-white px-2.5 py-1 rounded cursor-pointer hover:bg-amber-800 shadow-xs"
                >
                  <span>🌏 Switch to Asia Regional Market Benchmark</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Responsive SVG Chart */}
      <div className="relative w-full overflow-x-auto bg-slate-950 rounded-xl p-3 text-slate-100 shadow-inner">
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono border-b border-slate-800 pb-2 mb-2 px-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-200">
              <span className="w-3 h-0.5 rounded" style={{ backgroundColor: isAsia ? '#10b981' : isGlobal ? '#3b82f6' : theme.lineStroke }}></span>
              <strong>{isAsia ? '🌏 Asia Regional MCP (Primary)' : isGlobal ? '🌐 Global MCP (Primary)' : '🇸🇬 Domestic Index (Primary)'}</strong>
            </span>
            {showDomesticOverlay && companionDomesticSeries && isCompatibleUnit && (
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-0.5 border-t border-dashed border-slate-400"></span>
                <span>🇸🇬 {companionDomesticSeries.title.slice(0, 24)}... (Domestic Baseline)</span>
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400">
            Current Date Prices Normalised to SGD
          </div>
        </div>

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

          {/* Shaded Area under the primary line */}
          {observations.length > 1 && (
            <polygon
              points={`${pointsString} ${getX(observations.length - 1, observations.length)},${chartHeight - padding.bottom} ${getX(0, observations.length)},${chartHeight - padding.bottom}`}
              fill={isAsia ? 'rgba(16, 185, 129, 0.15)' : isGlobal ? 'rgba(59, 130, 246, 0.15)' : theme.areaFill}
            />
          )}

          {/* Companion domestic overlay line (dashed) if active */}
          {showDomesticOverlay && companionDomesticSeries && isCompatibleUnit && companionObservations.length > 1 && (
            <g>
              <polyline
                fill="none"
                stroke="#64748b"
                strokeWidth="1.8"
                strokeDasharray="4 3"
                points={companionObservations
                  .map((obs, idx) => `${getX(idx, companionObservations.length)},${getY(obs.value)}`)
                  .join(' ')}
              />
            </g>
          )}

          {/* Main primary trend line */}
          {observations.length > 1 && (
            <polyline
              fill="none"
              stroke={isAsia ? '#10b981' : isGlobal ? '#3b82f6' : theme.lineStroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
            />
          )}

          {/* Observations, markers and X labels */}
          {observations.map((obs, idx) => {
            const cx = getX(idx, observations.length);
            const cy = getY(obs.value);
            const isHovered = hoveredIndex === idx;
            const isBaseline = obs.period === highlightBaselinePeriod;
            const isTender = obs.period === highlightTenderPeriod;
            const pointStroke = isAsia ? '#10b981' : isGlobal ? '#3b82f6' : theme.lineStroke;

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
                      stroke={pointStroke}
                      strokeWidth="2"
                    />
                    <text
                      x={cx}
                      y={padding.top - 6}
                      fill={isAsia ? '#34d399' : '#38bdf8'}
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
                    fill={isTender ? (isAsia ? '#34d399' : '#38bdf8') : isBaseline ? '#f8fafc' : '#94a3b8'}
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
                  fill={isTender ? (isAsia ? '#34d399' : '#38bdf8') : isHovered ? '#ffffff' : '#0f172a'}
                  stroke={pointStroke}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Hover Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={Math.max(10, Math.min(chartWidth - 130, cx - 65))}
                      y={Math.max(10, cy - 38)}
                      width="130"
                      height="30"
                      rx="4"
                      fill="#0f172a"
                      stroke="#475569"
                      strokeWidth="1"
                    />
                    <text
                      x={Math.max(10, Math.min(chartWidth - 130, cx - 65)) + 65}
                      y={Math.max(10, cy - 38) + 19}
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
