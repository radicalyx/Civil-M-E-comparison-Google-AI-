import React from 'react';
import { X, Calculator, ArrowRight, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import { CalculationTrace, TenderLineItem } from '../types/index.ts';

interface CalculationTraceModalProps {
  item: TenderLineItem | null;
  result: any | null;
  onClose: () => void;
}

export const CalculationTraceModal: React.FC<CalculationTraceModalProps> = ({
  item,
  result,
  onClose
}) => {
  if (!item || !result) return null;

  const trace: CalculationTrace = result.trace;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 text-slate-900 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Mathematical Calculation Audit &amp; Trace
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Item: {item.itemCode} · {item.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 text-xs">
          {/* Key Result Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 font-mono">
            <div>
              <div className="text-[10px] text-slate-500 font-sans font-semibold uppercase">Baseline (SGD)</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                SGD {trace.baselineCostSgd.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">{trace.baselinePeriod}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-sans font-semibold uppercase">Current Tender (SGD)</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                SGD {trace.tenderCostSgd.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">{trace.tenderPeriod}</div>
            </div>

            <div>
              <div className="text-[10px] text-blue-700 font-sans font-semibold uppercase">Benchmark (SGD)</div>
              <div className="text-sm font-bold text-blue-900 mt-0.5">
                SGD {trace.benchmarkCostSgd.toLocaleString()}
              </div>
              <div className="text-[10px] text-blue-600">Factor: {trace.indexFactor.toFixed(4)}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-sans font-semibold uppercase">Variance (SGD / %)</div>
              <div className={`text-sm font-bold mt-0.5 ${trace.varianceSgd >= 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                {trace.varianceSgd >= 0 ? '+' : ''}SGD {trace.varianceSgd.toLocaleString()}
              </div>
              <div className={`text-[10px] font-bold ${trace.variancePercent >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {trace.variancePercent >= 0 ? '+' : ''}{trace.variancePercent.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Mathematical Formulas Used */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-700" />
              <span>Exact Statutory Procurement Formulas</span>
            </h4>

            {/* Formula 1: Index Factor */}
            <div className="p-3 bg-slate-900 text-slate-100 rounded-lg space-y-1 font-mono text-[11px]">
              <div className="text-amber-400 font-sans text-xs font-bold">1. Index Movement &amp; Escalation Factor:</div>
              <div>Index Change % = ((Current Index / Baseline Index) - 1) × 100</div>
              <div className="text-slate-300">
                Substituted: (({trace.currentIndex} / {trace.baselineIndex}) - 1) × 100 = <strong>{trace.indexChangePercent.toFixed(2)}%</strong> (Factor = <strong>{trace.indexFactor.toFixed(4)}</strong>)
              </div>
            </div>

            {/* Formula 2: Index-Adjusted Benchmark */}
            <div className="p-3 bg-slate-900 text-slate-100 rounded-lg space-y-1 font-mono text-[11px]">
              <div className="text-amber-400 font-sans text-xs font-bold">2. Index-Adjusted Baseline Benchmark (SGD):</div>
              <div>Benchmark SGD = Comparable Baseline Price SGD × Index Factor</div>
              <div className="text-slate-300">
                Substituted: SGD {trace.baselineCostSgd.toLocaleString()} × {trace.indexFactor.toFixed(4)} = <strong>SGD {trace.benchmarkCostSgd.toLocaleString()}</strong>
              </div>
            </div>

            {/* Formula 3: Variance & Premium */}
            <div className="p-3 bg-slate-900 text-slate-100 rounded-lg space-y-1 font-mono text-[11px]">
              <div className="text-amber-400 font-sans text-xs font-bold">3. Tender Variance &amp; Premium/Discount %:</div>
              <div>Variance SGD = Current Tender SGD - Benchmark SGD</div>
              <div>Variance % = ((Current Tender SGD / Benchmark SGD) - 1) × 100</div>
              <div className="text-slate-300">
                Substituted: SGD {trace.tenderCostSgd.toLocaleString()} - SGD {trace.benchmarkCostSgd.toLocaleString()} = <strong>SGD {trace.varianceSgd.toLocaleString()}</strong> ({trace.variancePercent.toFixed(2)}%)
              </div>
            </div>

            {/* Formula 4: Compound Annual Growth Rate (CAGR) */}
            <div className="p-3 bg-slate-900 text-slate-100 rounded-lg space-y-1 font-mono text-[11px]">
              <div className="text-amber-400 font-sans text-xs font-bold">4. Compound Annual Escalation Rate (CAGR):</div>
              <div>CAGR = ((Current Tender / Baseline Price)^(1 / Elapsed Years) - 1) × 100</div>
              <div className="text-slate-300">
                Substituted: ((SGD {trace.tenderCostSgd.toLocaleString()} / SGD {trace.baselineCostSgd.toLocaleString()})^(1 / {trace.elapsedYears.toFixed(2)} yrs) - 1) × 100 = <strong>{trace.cagrPercent.toFixed(2)}% p.a.</strong>
              </div>
            </div>
          </div>

          {/* Breakdown details if Composite or Maintenance */}
          {trace.breakdownDetails?.compositeComponents && (
            <div className="space-y-2 border-t border-slate-200 pt-3">
              <h5 className="font-bold text-slate-900">Composite Components Breakdown:</h5>
              <div className="space-y-1 font-mono text-[11px]">
                {trace.breakdownDetails.compositeComponents.map((c, idx) => (
                  <div key={idx} className="flex justify-between p-1.5 bg-slate-50 rounded border border-slate-200">
                    <span>{c.name} ({c.weight}%)</span>
                    <span>Index: {c.baselineIndex} → {c.currentIndex} (Weight contrib: {c.weightedContribution})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trace.breakdownDetails?.labourBaselineSgd !== undefined && (
            <div className="space-y-2 border-t border-slate-200 pt-3">
              <h5 className="font-bold text-slate-900">Maintenance Labour vs Spares Decomposition:</h5>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-sans">Labour ({item.labourSharePercent || 70}%)</div>
                  <div className="font-bold text-blue-900">
                    SGD {trace.breakdownDetails.labourAdjustedSgd?.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-blue-600">Escalated via Labour Series</div>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-sans">Non-Labour Spares ({100 - (item.labourSharePercent || 70)}%)</div>
                  <div className="font-bold text-slate-900">
                    SGD {trace.breakdownDetails.nonLabourAdjustedSgd?.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">Unchanged (Factor 1.0)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Close Audit Trace
          </button>
        </div>
      </div>
    </div>
  );
};
