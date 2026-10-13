import React, { useState } from 'react';
import {
  ShieldCheck,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Layers,
  Search,
  BookOpen,
  LineChart,
  Globe,
  Sparkles
} from 'lucide-react';
import { CatalogueSeries, DataObservation } from '../types/index.ts';
import { PriceIndexChart } from './PriceIndexChart.tsx';

interface BenchmarkMappingTableProps {
  catalogue: CatalogueSeries[];
  observationsMap: Record<string, DataObservation[]>;
}

export const BenchmarkMappingTable: React.FC<BenchmarkMappingTableProps> = ({
  catalogue,
  observationsMap
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedChartSeriesId, setSelectedChartSeriesId] = useState<string>('SINGSTAT-DSPI-DIV67');
  const [onlyCurrentDates, setOnlyCurrentDates] = useState(true);

  const filtered = catalogue.filter((series) => {
    const matchesSearch =
      series.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      series.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      series.coverage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      series.datasetId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || series.category === selectedCategory;
    const matchesCurrency =
      !onlyCurrentDates || series.isUpdatedToCurrentDate !== false;
    return matchesSearch && matchesCategory && matchesCurrency;
  });

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'DIRECT_PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Direct Published Series
          </span>
        );
      case 'BROADER_PROXY':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Broader Industry Proxy
          </span>
        );
      case 'USER_COMPOSITE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-sm">
            <Layers className="w-3 h-3 text-indigo-600" />
            User-Defined Composite
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-sm">
            <HelpCircle className="w-3 h-3 text-slate-500" />
            No Suitable Benchmark
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Taxonomy Guidance */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">
              Official Price Indices &amp; Source Catalogue
            </h2>
            <p className="text-xs text-slate-300">
              Direct verification links and methodologies for SingStat TableBuilder, BCA, MOM, and MAS series
            </p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE PRICE INDEX CHART FOR BENCHMARKS */}
      <PriceIndexChart
        title="Official Singapore Price Indices Comparison Chart"
        subtitle="Explore verified historical time-series curves across all categories"
        availableSeries={catalogue}
        observationsMap={observationsMap}
        selectedSeriesId={selectedChartSeriesId}
        onSelectSeriesId={setSelectedChartSeriesId}
        colorTheme="slate"
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search series title, publisher, or dataset ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden w-64 sm:w-80"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setOnlyCurrentDates(!onlyCurrentDates)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border ${
              onlyCurrentDates
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${onlyCurrentDates ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            <span>Only References Updated to Current Dates ({filtered.length})</span>
          </button>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            <option value="CONSTRUCTION_MATERIALS">Construction Materials</option>
            <option value="ME_EQUIPMENT">M&amp;E Equipment</option>
            <option value="LABOUR_MAINTENANCE">Labour &amp; Maintenance</option>
            <option value="MACRO_TPI">BCA Tender Price Index</option>
          </select>
        </div>
      </div>

      {/* Series Cards */}
      <div className="space-y-3">
        {filtered.map((series) => (
          <div
            key={series.id}
            className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition space-y-3"
          >
            {/* Top row: Title, Publisher, Classification Badge */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {series.datasetId} / {series.seriesId}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {series.publisher}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {series.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {series.isMcpBenchmark && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-300 px-2 py-0.5 rounded">
                    <Globe className="w-3 h-3 text-sky-600" />
                    <span>Global MCP (SGD-Normalised)</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Updated: {series.latestPeriod}</span>
                </span>
                <button
                  onClick={() => setSelectedChartSeriesId(series.id)}
                  className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1"
                >
                  <LineChart className="w-3.5 h-3.5" />
                  <span>Plot on Graph</span>
                </button>
                {getClassificationBadge(series.classification)}
              </div>
            </div>

            {/* Global MCP Normalisation Formula Banner */}
            {series.isMcpBenchmark && series.normalisationFormula && (
              <div className="bg-sky-50 border border-sky-200 rounded p-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="text-[11px] text-sky-900 font-mono">
                    <strong>Normalisation to SGD:</strong> {series.normalisationFormula}
                  </span>
                </div>
                <span className="text-[10px] text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200 font-semibold shrink-0">
                  MAS FX Rate: 1 USD = {series.usdToSgdFxRate || 1.3410} SGD
                </span>
              </div>
            )}

            {/* Scope, Inclusions and Exclusions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 bg-slate-50 p-3 rounded border border-slate-200">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Coverage &amp; Scope
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {series.coverage}
                </p>
              </div>

              <div className="space-y-1 bg-rose-50/50 p-3 rounded border border-rose-200">
                <div className="font-bold text-rose-800 text-[11px] uppercase tracking-wider">
                  Strict Exclusions
                </div>
                <p className="text-rose-700 leading-relaxed text-[11px]">
                  {series.exclusions}
                </p>
              </div>
            </div>

            {/* Rationale and Limitations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="font-semibold text-slate-800 text-[11px]">Relevance Rationale: </span>
                <span className="text-slate-600 text-[11px]">{series.relevanceRationale}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-800 text-[11px]">Analytical Limitations: </span>
                <span className="text-slate-600 text-[11px]">{series.limitations}</span>
              </div>
            </div>

            {/* Bottom Metadata Audit Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 border-t border-slate-100 pt-3 font-mono">
              <div className="flex flex-wrap items-center gap-3">
                <span>Unit: <strong>{series.unit}</strong></span>
                <span>·</span>
                <span>Freq: <strong>{series.frequency}</strong></span>
                <span>·</span>
                <span>Latest: <strong>{series.latestPeriod}</strong></span>
                <span>·</span>
                <span>Released: <strong>{series.latestReleaseDate}</strong></span>
                <span>·</span>
                <span>Seasonal: <strong>{series.seasonalAdjustment}</strong></span>
              </div>

              <div className="flex items-center gap-3 font-sans">
                <a
                  href={series.sourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium"
                >
                  <span>Official Dataset</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={series.methodologyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium"
                >
                  <span>Methodology</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
