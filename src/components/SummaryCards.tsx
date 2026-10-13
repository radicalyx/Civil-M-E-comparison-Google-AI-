import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Info
} from 'lucide-react';
import { AggregateComparison, NoiseReductionMode, NormalisationMode } from '../types/index.ts';

interface SummaryCardsProps {
  summary: AggregateComparison;
  normalisation: NormalisationMode;
  noiseReduction: NoiseReductionMode;
  onOpenTestRunner: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  normalisation,
  noiseReduction,
  onOpenTestRunner
}) => {
  const isPremium = summary.totalVarianceSgd > 0;
  const isDiscount = summary.totalVarianceSgd < 0;

  return (
    <div className="space-y-4">
      {/* Test Runner Banner & Noise Reduction warning if active */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>SingStat/BCA Procurement Standard:</strong> All evaluations compare current tender submissions against index-adjusted baseline prices in SGD.
          </span>
          {noiseReduction !== 'NONE' && (
            <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm font-medium">
              Analytical Scenario Mode Active ({noiseReduction.replace(/_/g, ' ')})
            </span>
          )}
        </div>

        <button
          onClick={onOpenTestRunner}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded font-medium transition cursor-pointer shadow-xs"
        >
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          <span>Run Acceptance Criteria Verification</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Baseline Price */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Total Baseline
          </div>
          <div className="mt-1 font-mono text-base sm:text-xl font-bold text-slate-900 truncate">
            SGD {summary.totalBaselineSgd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Historical contract rates
          </div>
        </div>

        {/* 2. Tender Submission */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Current Tender
          </div>
          <div className="mt-1 font-mono text-base sm:text-xl font-bold text-slate-900 truncate">
            SGD {summary.totalTenderSgd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="mt-1 text-[11px] text-slate-600 font-medium flex items-center gap-1">
            <span>Tender rise:</span>
            <span className={summary.overallTenderChangePercent >= 0 ? 'text-amber-600' : 'text-emerald-600'}>
              {summary.overallTenderChangePercent >= 0 ? '+' : ''}{summary.overallTenderChangePercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 3. Index-Adjusted Benchmark */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Adjusted Benchmark
          </div>
          <div className="mt-1 font-mono text-base sm:text-xl font-bold text-blue-900 truncate">
            SGD {summary.totalBenchmarkSgd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="mt-1 text-[11px] text-slate-600 font-medium flex items-center gap-1">
            <span>Index rise:</span>
            <span className="text-blue-700">
              {summary.overallIndexChangePercent >= 0 ? '+' : ''}{summary.overallIndexChangePercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 4. Variance SGD */}
        <div className={`border rounded-lg p-3 sm:p-4 shadow-xs ${
          isPremium
            ? 'bg-rose-50/60 border-rose-200'
            : isDiscount
            ? 'bg-emerald-50/60 border-emerald-200'
            : 'bg-white border-slate-200'
        }`}>
          <div className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">
            Benchmark Variance
          </div>
          <div className={`mt-1 font-mono text-base sm:text-xl font-bold truncate ${
            isPremium ? 'text-rose-700' : isDiscount ? 'text-emerald-700' : 'text-slate-900'
          }`}>
            {isPremium ? '+' : ''}SGD {summary.totalVarianceSgd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="mt-1 text-[11px] font-semibold flex items-center gap-1">
            {isPremium ? (
              <span className="text-rose-700 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {summary.overallVariancePercent > 0 ? `+${summary.overallVariancePercent.toFixed(1)}% above benchmark` : ''}
              </span>
            ) : isDiscount ? (
              <span className="text-emerald-700 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {summary.overallVariancePercent.toFixed(1)}% below benchmark
              </span>
            ) : (
              <span className="text-slate-600">Aligned with benchmark</span>
            )}
          </div>
        </div>

        {/* 5. Escalation Difference (pp) */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Escalation Gap
          </div>
          <div className="mt-1 font-mono text-base sm:text-xl font-bold text-slate-900 truncate">
            {(summary.overallTenderChangePercent - summary.overallIndexChangePercent) >= 0 ? '+' : ''}
            {(summary.overallTenderChangePercent - summary.overallIndexChangePercent).toFixed(1)} pp
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Tender % minus Index %
          </div>
        </div>

        {/* 6. Benchmark Coverage */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Benchmark Coverage
          </div>
          <div className="mt-1 font-mono text-base sm:text-xl font-bold text-slate-900 flex items-center gap-1.5">
            <span>{summary.benchmarkCoveragePercent}%</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {summary.coveredItemCount} of {summary.totalItemCount} items matched
          </div>
        </div>
      </div>
    </div>
  );
};
