import React, { useState } from 'react';
import {
  Clock,
  Calculator,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  Download,
  Plus,
  Sliders,
  Edit2,
  Trash2,
  HelpCircle,
  LineChart,
  Globe
} from 'lucide-react';
import { CatalogueSeries, DataObservation, TenderLineItem } from '../types/index.ts';
import { calculateItemBenchmark, sanitizeCsvField } from '../utils/calculations.ts';
import { PriceIndexChart } from './PriceIndexChart.tsx';
import { ContractPeriodInput } from './ContractPeriodInput.tsx';

interface MaintenanceViewProps {
  items: TenderLineItem[];
  itemResults: any[];
  catalogue: CatalogueSeries[];
  observationsMap: Record<string, DataObservation[]>;
  onInspectTrace: (item: TenderLineItem, result: any) => void;
  onEditItem: (item: TenderLineItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (item: TenderLineItem) => void;
  onUpdateLabourShare: (itemId: string, newShare: number) => void;
  onUpdateLabourSeries: (itemId: string, newSeriesId: string) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  items,
  itemResults,
  catalogue,
  observationsMap,
  onInspectTrace,
  onEditItem,
  onDeleteItem,
  onAddItem,
  onUpdateLabourShare,
  onUpdateLabourSeries
}) => {
  // Reference currency filter state
  const [onlyCurrentReferences, setOnlyCurrentReferences] = useState(true);

  // Filter only Maintenance items
  const maintenanceItems = items.filter(i => i.category === 'MAINTENANCE');
  const mntIndices = items.map((item, idx) => item.category === 'MAINTENANCE' ? idx : -1).filter(idx => idx !== -1);
  const mntResults = mntIndices.map(idx => itemResults[idx]).filter(Boolean);

  // Labour series for graph - filtered to updated current dates
  const labourSeries = catalogue.filter(c =>
    c.category === 'LABOUR_MAINTENANCE' &&
    (!onlyCurrentReferences || c.isUpdatedToCurrentDate !== false)
  );

  // Dedicated Maintenance Totals (Evaluated Separately)
  const totalMntBaseline = mntResults.reduce((sum, r) => sum + r.baselineCostSgd, 0);
  const totalMntTender = mntResults.reduce((sum, r) => sum + r.tenderCostSgd, 0);
  const totalMntBenchmark = mntResults.reduce((sum, r) => sum + r.benchmarkCostSgd, 0);
  const mntVarianceSgd = totalMntTender - totalMntBenchmark;
  const mntVariancePct = totalMntBenchmark > 0 ? ((totalMntTender / totalMntBenchmark) - 1) * 100 : 0;

  // Layman Quick Maintenance Checker State
  const [quickService, setQuickService] = useState('ACMV Servicing');
  const [selectedChartSeriesId, setSelectedChartSeriesId] = useState('SINGSTAT-ULC-CONST');
  const [quickTenderer, setQuickTenderer] = useState('');
  const [quickDuration, setQuickDuration] = useState(12);
  const [quickLabourShare, setQuickLabourShare] = useState(70);
  const [quickPrevPrice, setQuickPrevPrice] = useState(100000);
  const [quickPrevDate, setQuickPrevDate] = useState('2020Q1');
  const [quickNewPrice, setQuickNewPrice] = useState(115000);
  const [quickNewDate, setQuickNewDate] = useState('2021Q1');

  // Test item for live verdict
  const testItem: TenderLineItem = {
    id: 'QUICK-MNT-TEST',
    tendererName: quickTenderer || 'Maintenance Contractor',
    category: 'MAINTENANCE',
    itemCode: 'MNT-TEST',
    description: quickService,
    specification: 'Routine scheduled maintenance servicing',
    quantity: 1,
    unit: quickDuration + '-Month Contract',
    currency: 'SGD',
    exchangeRateToSgd: 1.0,
    gstBasis: 'EXCLUSIVE',
    baselinePriceDate: quickPrevDate,
    baselineContractDurationMonths: quickDuration,
    baselineContractPeriodLabel: `${quickPrevDate} (${quickDuration} mos contract term)`,
    baselineUnitPrice: quickPrevPrice,
    baselineTotalPrice: quickPrevPrice,
    tenderPriceDate: quickNewDate,
    tenderUnitPrice: quickNewPrice,
    tenderTotalPrice: quickNewPrice,
    benchmarkSeriesId: selectedChartSeriesId,
    contractDurationMonths: quickDuration,
    labourSharePercent: quickLabourShare,
    nonLabourEscalationFactor: 1.0
  };

  const liveResult = calculateItemBenchmark(testItem, catalogue, observationsMap);
  const isOver = liveResult.varianceSgd > 0;

  const handleAddQuickToTable = () => {
    const newItem: TenderLineItem = {
      ...testItem,
      id: 'MNT-' + Date.now(),
      tendererName: quickTenderer.trim() || 'Facility Services Pte Ltd',
      itemCode: 'MNT-' + Math.floor(100 + Math.random() * 900),
      baselineContractDurationMonths: quickDuration,
      baselineContractPeriodLabel: `${quickPrevDate} (${quickDuration} mos contract term)`
    };
    onAddItem(newItem);
    setQuickTenderer('');
  };

  const handleExportMntCsv = () => {
    const headers = [
      'Item Code',
      'Service Description',
      'Tenderer',
      'Contract Duration',
      'Labour Share %',
      'Previous Contract (SGD)',
      'New Tender Quote (SGD)',
      'Official Benchmark (SGD)',
      'Difference (SGD)',
      'Difference (%)',
      'Status'
    ];

    const rows = maintenanceItems.map((item) => {
      const origIdx = items.indexOf(item);
      const res = itemResults[origIdx];
      const status = res?.varianceSgd > 0 ? 'Above Benchmark' : 'Within Benchmark';

      return [
        sanitizeCsvField(item.itemCode),
        sanitizeCsvField(item.description),
        sanitizeCsvField(item.tendererName),
        sanitizeCsvField(item.contractDurationMonths || 12),
        sanitizeCsvField(item.labourSharePercent || 70),
        sanitizeCsvField(res ? res.baselineCostSgd : 0),
        sanitizeCsvField(res ? res.tenderCostSgd : 0),
        sanitizeCsvField(res ? res.benchmarkCostSgd : 0),
        sanitizeCsvField(res ? res.varianceSgd : 0),
        sanitizeCsvField(res ? res.variancePercent : 0),
        sanitizeCsvField(status)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Maintenance_Contracts_Tender_Evaluation_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-emerald-950 text-white p-4 sm:p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-300" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Non-Comprehensive Maintenance Contracts Evaluation
            </h2>
          </div>
          <p className="text-xs text-emerald-200 mt-1 max-w-2xl">
            Evaluates servicing contracts separately from construction. Uses SingStat Unit Labour Cost and MOM technician wages to escalate labour, while keeping minor spares and consumables fixed.
          </p>
        </div>

        <button
          onClick={handleExportMntCsv}
          className="flex items-center gap-1.5 text-xs bg-white hover:bg-emerald-50 text-emerald-950 font-bold px-3 py-2 rounded-lg shadow-xs transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <span>Export Maintenance Report (CSV)</span>
        </button>
      </div>

      {/* DEDICATED PRICE INDEX GRAPH FOR MAINTENANCE LABOUR TAB */}
      <PriceIndexChart
        title="Construction Labour &amp; Technician Wage Index Trend"
        subtitle="Visualise SingStat Unit Labour Cost Index (Table M183421) and MOM Occupational Technician Wage series"
        availableSeries={labourSeries}
        observationsMap={observationsMap}
        selectedSeriesId={selectedChartSeriesId}
        onSelectSeriesId={setSelectedChartSeriesId}
        highlightBaselinePeriod={quickPrevDate}
        highlightTenderPeriod={quickNewDate}
        colorTheme="emerald"
      />

      {/* QUICK MAINTENANCE CHECKER FOR LAYMEN */}
      <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
              <span>Quick Maintenance Checker: Test a Servicing Renewal Quote</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter previous contract price vs new contractor quote to check fair labour escalation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Step 1: Service details */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Contract Service Type:</span>
            </label>

            <select
              value={quickService}
              onChange={(e) => setQuickService(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="ACMV & Chiller Servicing">ACMV &amp; Chiller Preventive Servicing</option>
              <option value="Electrical Distribution Servicing">Electrical HT/LT Maintenance Servicing</option>
              <option value="Lift & Escalator Maintenance">Lift &amp; Escalator Routine Servicing</option>
              <option value="Fire Alarm & Pump Servicing">Fire Protection System Servicing</option>
              <option value="Plumbing & Sanitary Servicing">Plumbing &amp; Water Booster Servicing</option>
            </select>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[11px] text-slate-600">Contract Months:</span>
                <input
                  type="number"
                  min="1"
                  value={quickDuration}
                  onChange={(e) => setQuickDuration(parseInt(e.target.value, 10) || 12)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-xs"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-600">Contractor Name:</span>
                <input
                  type="text"
                  placeholder="e.g. FacilityTech"
                  value={quickTenderer}
                  onChange={(e) => setQuickTenderer(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                />
              </div>
            </div>

            <div className="pt-1">
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Labour Share Assumption:</span>
                <strong className="text-slate-900">{quickLabourShare}%</strong>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                step="5"
                value={quickLabourShare}
                onChange={(e) => setQuickLabourShare(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">
                Remaining {100 - quickLabourShare}% is minor spares/consumables (held fixed).
              </span>
            </div>
          </div>

          {/* Step 2: Previous Contract vs Renewal Quote */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Previous Contract vs Renewal Quote:</span>
            </label>

            {/* Previous Contract Time Period Input */}
            <div className="bg-white p-2.5 rounded border border-slate-200 space-y-2">
              <ContractPeriodInput
                label="Previous Contract Period:"
                period={quickPrevDate}
                onChangePeriod={setQuickPrevDate}
                durationMonths={quickDuration}
                onChangeDuration={setQuickDuration}
                showDuration={true}
              />

              <div className="pt-1">
                <span className="text-[11px] text-slate-600 block mb-0.5">Previous Contract Total (SGD):</span>
                <input
                  type="number"
                  value={quickPrevPrice}
                  onChange={(e) => setQuickPrevPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1 font-mono text-xs font-semibold"
                  placeholder="Enter previous contract total"
                />
              </div>
            </div>

            {/* Renewal Tender Quote Submission Date */}
            <div className="bg-white p-2.5 rounded border border-slate-200 space-y-2">
              <ContractPeriodInput
                label="New Renewal Quote Date:"
                period={quickNewDate}
                onChangePeriod={setQuickNewDate}
                isTender={true}
              />

              <div className="pt-1">
                <span className="text-[11px] text-slate-600 block mb-0.5">New Renewal Quote (SGD):</span>
                <input
                  type="number"
                  value={quickNewPrice}
                  onChange={(e) => setQuickNewPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1 font-mono text-xs font-bold text-slate-900"
                  placeholder="Enter renewal quotation"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Instant Verdict & Save */}
          <div className={`p-4 rounded-lg border flex flex-col justify-between ${
            isOver
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Step 3: Fair Escalation Verdict
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  isOver ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'
                }`}>
                  {isOver ? 'Above Fair Escalation' : 'Within Expected Benchmark'}
                </span>
              </div>

              <div className="mt-2">
                <div className="text-lg font-black font-mono">
                  {isOver ? '+' : ''}SGD {liveResult.varianceSgd.toLocaleString()} ({isOver ? '+' : ''}{liveResult.variancePercent.toFixed(1)}%)
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Fair benchmark: <strong>SGD {liveResult.benchmarkCostSgd.toLocaleString()}</strong>.
                  (Labour component: SGD {liveResult.trace?.breakdownDetails?.labourAdjustedSgd?.toLocaleString()} + Spares: SGD {liveResult.trace?.breakdownDetails?.nonLabourAdjustedSgd?.toLocaleString()}).
                </div>

                {liveResult.trace?.isMcpBridged && (
                  <div className="mt-2 p-2 bg-sky-100 rounded border border-sky-300 text-[10px] text-sky-950 flex items-start gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Global MCP Active:</span> Using Technical Labour Market Clearing Price index updated to current dates (2026).
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleAddQuickToTable}
              className="mt-3 w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Maintenance Evaluation Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAINTENANCE TOTALS KPI STRIP (EVALUATED SEPARATELY) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            Maintenance Previous Total
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-1">
            SGD {totalMntBaseline.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Historical contract costs</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            Current Maintenance Tender
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-1">
            SGD {totalMntTender.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {maintenanceItems.length} contracts evaluated
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase">
            Adjusted Labour Benchmark
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-emerald-900 mt-1">
            SGD {totalMntBenchmark.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Fair benchmark target</div>
        </div>

        <div className={`border rounded-lg p-3.5 shadow-xs ${
          mntVarianceSgd > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="text-[11px] font-semibold text-slate-600 uppercase">
            Maintenance Net Difference
          </div>
          <div className={`text-base sm:text-lg font-bold font-mono mt-1 ${
            mntVarianceSgd > 0 ? 'text-rose-700' : 'text-emerald-700'
          }`}>
            {mntVarianceSgd > 0 ? '+' : ''}SGD {mntVarianceSgd.toLocaleString()}
          </div>
          <div className={`text-[11px] font-bold ${mntVarianceSgd > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {mntVariancePct > 0 ? `+${mntVariancePct.toFixed(1)}% above benchmark` : `${mntVariancePct.toFixed(1)}% below benchmark`}
          </div>
        </div>
      </div>

      {/* MAINTENANCE CONTRACTS EVALUATION TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-2">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Maintenance Contracts Evaluation Table ({maintenanceItems.length} items)
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated strictly on Singapore construction labour indices.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Contractor</th>
                <th className="py-2.5 px-3">Service Scope</th>
                <th className="py-2.5 px-3 text-center">Duration</th>
                <th className="py-2.5 px-3 text-center">Labour %</th>
                <th className="py-2.5 px-3 text-right">Previous Price</th>
                <th className="py-2.5 px-3 text-right">New Tender Quote</th>
                <th className="py-2.5 px-3 text-right">Adjusted Benchmark</th>
                <th className="py-2.5 px-3 text-right">Difference (SGD / %)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {maintenanceItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No maintenance contracts added yet. Use the Quick Maintenance Checker above to test a renewal quote!
                  </td>
                </tr>
              ) : (
                maintenanceItems.map((item) => {
                  const origIdx = items.indexOf(item);
                  const result = itemResults[origIdx];
                  const isItemOver = result?.varianceSgd > 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {item.tendererName}
                        <div className="text-[10px] text-slate-400 font-normal">{item.itemCode}</div>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-bold text-slate-900 text-xs">{item.description}</div>
                        <div className="text-[11px] text-slate-500 truncate">{item.specification}</div>
                        {item.scopeDifferencesFlag && (
                          <div className="mt-0.5 text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 inline-block">
                            {item.scopeDifferencesFlag}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-mono">
                        {item.contractDurationMonths || 12}M
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-semibold">
                        {item.labourSharePercent || 70}%
                      </td>

                      <td className="py-3 px-3 text-right font-mono">
                        <div className="font-semibold text-slate-900">
                          SGD {result?.baselineCostSgd.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">{item.baselinePriceDate}</div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        <div>SGD {result?.tenderCostSgd.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400">{item.tenderPriceDate}</div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-emerald-900 font-semibold">
                        <div>SGD {result?.benchmarkCostSgd.toLocaleString()}</div>
                        <div className="text-[10px] text-emerald-700">
                          Rise: {result?.indexChangePercent >= 0 ? '+' : ''}{result?.indexChangePercent.toFixed(1)}%
                        </div>
                      </td>

                      <td className={`py-3 px-3 text-right font-mono font-bold ${
                        isItemOver ? 'text-rose-700' : 'text-emerald-700'
                      }`}>
                        <div>{isItemOver ? '+' : ''}SGD {result?.varianceSgd.toLocaleString()}</div>
                        <div className="text-[10px]">
                          {isItemOver ? '+' : ''}{result?.variancePercent.toFixed(1)}%
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isItemOver ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isItemOver ? 'Above Index' : 'Reasonable'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onInspectTrace(item, result)}
                            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold px-2 py-1 bg-emerald-50 rounded hover:bg-emerald-100 transition cursor-pointer"
                          >
                            Explain Math
                          </button>
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
