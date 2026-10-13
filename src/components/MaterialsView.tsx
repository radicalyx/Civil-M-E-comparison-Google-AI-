import React, { useState } from 'react';
import {
  Building2,
  Calculator,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  Download,
  Plus,
  HelpCircle,
  Edit2,
  Trash2,
  ArrowRight,
  LineChart
} from 'lucide-react';
import { CatalogueSeries, DataObservation, TenderLineItem } from '../types/index.ts';
import { calculateItemBenchmark, sanitizeCsvField } from '../utils/calculations.ts';
import { PriceIndexChart } from './PriceIndexChart.tsx';

interface MaterialsViewProps {
  items: TenderLineItem[];
  itemResults: any[];
  catalogue: CatalogueSeries[];
  observationsMap: Record<string, DataObservation[]>;
  onInspectTrace: (item: TenderLineItem, result: any) => void;
  onEditItem: (item: TenderLineItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (item: TenderLineItem) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  items,
  itemResults,
  catalogue,
  observationsMap,
  onInspectTrace,
  onEditItem,
  onDeleteItem,
  onAddItem
}) => {
  // Filter only Civil items
  const civilItems = items.filter(i => i.category === 'MATERIAL');
  const civilIndices = items.map((item, idx) => item.category === 'MATERIAL' ? idx : -1).filter(idx => idx !== -1);
  const civilResults = civilIndices.map(idx => itemResults[idx]).filter(Boolean);

  // Civil Catalogue Series for chart
  const civilSeries = catalogue.filter(c => c.category === 'CONSTRUCTION_MATERIALS');

  // Dedicated Civil Totals
  const totalCivilBaseline = civilResults.reduce((sum, r) => sum + r.baselineCostSgd, 0);
  const totalCivilTender = civilResults.reduce((sum, r) => sum + r.tenderCostSgd, 0);
  const totalCivilBenchmark = civilResults.reduce((sum, r) => sum + r.benchmarkCostSgd, 0);
  const civilVarianceSgd = totalCivilTender - totalCivilBenchmark;
  const civilVariancePct = totalCivilBenchmark > 0 ? ((totalCivilTender / totalCivilBenchmark) - 1) * 100 : 0;

  // Layman Quick Check Form State
  const [quickMaterial, setQuickMaterial] = useState('BCA-MAT-STEEL-REBAR');
  const [selectedChartSeriesId, setSelectedChartSeriesId] = useState('BCA-MAT-STEEL-REBAR');
  const [quickTenderer, setQuickTenderer] = useState('');
  const [quickQty, setQuickQty] = useState(100);
  const [quickPrevPrice, setQuickPrevPrice] = useState(880);
  const [quickPrevDate, setQuickPrevDate] = useState('2021M01');
  const [quickNewPrice, setQuickNewPrice] = useState(1040);
  const [quickNewDate, setQuickNewDate] = useState('2024M06');

  // Compute live test verdict
  const testItem: TenderLineItem = {
    id: 'QUICK-TEST',
    tendererName: quickTenderer || 'Tenderer',
    category: 'MATERIAL',
    itemCode: 'CIVIL-CHECK',
    description: catalogue.find(c => c.id === quickMaterial)?.title || 'Selected Material',
    specification: 'Standard specification',
    quantity: quickQty,
    unit: catalogue.find(c => c.id === quickMaterial)?.unit?.split('/')[1]?.trim() || 'Tonne',
    currency: 'SGD',
    exchangeRateToSgd: 1.0,
    gstBasis: 'EXCLUSIVE',
    baselinePriceDate: quickPrevDate,
    baselineUnitPrice: quickPrevPrice,
    baselineTotalPrice: quickPrevPrice * quickQty,
    tenderPriceDate: quickNewDate,
    tenderUnitPrice: quickNewPrice,
    tenderTotalPrice: quickNewPrice * quickQty,
    benchmarkSeriesId: quickMaterial
  };

  const liveResult = calculateItemBenchmark(testItem, catalogue, observationsMap);
  const isOver = liveResult.varianceSgd > 0;

  const handleAddQuickToTable = () => {
    const selectedMeta = catalogue.find(c => c.id === quickMaterial);
    const newItem: TenderLineItem = {
      id: 'CIVIL-' + Date.now(),
      tendererName: quickTenderer.trim() || 'Tenderer A',
      category: 'MATERIAL',
      itemCode: 'CIV-' + Math.floor(100 + Math.random() * 900),
      description: selectedMeta?.title || 'Civil Material',
      specification: selectedMeta?.coverage || 'Standard Singapore specification',
      quantity: quickQty,
      unit: selectedMeta?.unit?.includes('/') ? selectedMeta.unit.split('/')[1].trim() : 'Unit',
      currency: 'SGD',
      exchangeRateToSgd: 1.0,
      gstBasis: 'EXCLUSIVE',
      baselinePriceDate: quickPrevDate,
      baselineUnitPrice: quickPrevPrice,
      baselineTotalPrice: quickPrevPrice * quickQty,
      tenderPriceDate: quickNewDate,
      tenderUnitPrice: quickNewPrice,
      tenderTotalPrice: quickNewPrice * quickQty,
      benchmarkSeriesId: quickMaterial
    };
    onAddItem(newItem);
    setQuickTenderer('');
  };

  const handleExportCivilCsv = () => {
    const headers = [
      'Material Code',
      'Material Description',
      'Tenderer',
      'Quantity',
      'Unit',
      'Previous Rate (SGD)',
      'Previous Total (SGD)',
      'Tender Rate (SGD)',
      'Tender Total (SGD)',
      'Official Benchmark Total (SGD)',
      'Difference (SGD)',
      'Difference (%)',
      'Verdict'
    ];

    const rows = civilItems.map((item) => {
      const origIdx = items.indexOf(item);
      const res = itemResults[origIdx];
      const verdict = res?.varianceSgd > 0
        ? `Above benchmark by +SGD ${res?.varianceSgd.toLocaleString()}`
        : 'Reasonable / Within expected benchmark';

      return [
        sanitizeCsvField(item.itemCode),
        sanitizeCsvField(item.description),
        sanitizeCsvField(item.tendererName),
        sanitizeCsvField(item.quantity),
        sanitizeCsvField(item.unit),
        sanitizeCsvField(item.baselineUnitPrice),
        sanitizeCsvField(res ? res.baselineCostSgd : 0),
        sanitizeCsvField(item.tenderUnitPrice),
        sanitizeCsvField(res ? res.tenderCostSgd : 0),
        sanitizeCsvField(res ? res.benchmarkCostSgd : 0),
        sanitizeCsvField(res ? res.varianceSgd : 0),
        sanitizeCsvField(res ? res.variancePercent : 0),
        sanitizeCsvField(verdict)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Civil_Materials_Tender_Evaluation_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Tab Explainer Banner */}
      <div className="bg-blue-900 text-white p-4 sm:p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-300" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Civil &amp; Structural Materials Evaluation
            </h2>
          </div>
          <p className="text-xs text-blue-200 mt-1 max-w-2xl">
            Evaluate concrete, rebar, cement, sand, granite, and structural steel tenders against official BCA market unit rates and SingStat wholesale indices.
          </p>
        </div>

        <button
          onClick={handleExportCivilCsv}
          className="flex items-center gap-1.5 text-xs bg-white hover:bg-blue-50 text-blue-950 font-bold px-3 py-2 rounded-lg shadow-xs transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-blue-700" />
          <span>Export Civil Report (CSV)</span>
        </button>
      </div>

      {/* DEDICATED PRICE INDEX GRAPH FOR CIVIL TAB */}
      <PriceIndexChart
        title="Civil &amp; Structural Price Index Historical Trend"
        subtitle="Visualise Singapore market movements for reinforcement steel, ready-mixed concrete, and structural steel"
        availableSeries={civilSeries}
        observationsMap={observationsMap}
        selectedSeriesId={selectedChartSeriesId}
        onSelectSeriesId={setSelectedChartSeriesId}
        highlightBaselinePeriod={quickPrevDate}
        highlightTenderPeriod={quickNewDate}
        colorTheme="blue"
      />

      {/* STEP 1-2-3 EASY CALCULATOR FOR LAYMEN */}
      <div className="bg-white border-2 border-blue-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
              <span>Quick Quote Checker: Test a Material Price in 10 Seconds</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your previous contract price and what the contractor quoted to see if it is reasonable
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Step 1: Material */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Pick Material &amp; Quantity:</span>
            </label>
            <div>
              <select
                value={quickMaterial}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuickMaterial(val);
                  setSelectedChartSeriesId(val);
                  if (val.includes('REBAR')) {
                    setQuickPrevPrice(880);
                    setQuickNewPrice(1040);
                  } else if (val.includes('CONCRETE')) {
                    setQuickPrevPrice(95);
                    setQuickNewPrice(125);
                  } else if (val.includes('CEMENT')) {
                    setQuickPrevPrice(88);
                    setQuickNewPrice(112);
                  } else if (val.includes('SAND')) {
                    setQuickPrevPrice(25);
                    setQuickNewPrice(33);
                  } else if (val.includes('GRANITE')) {
                    setQuickPrevPrice(21);
                    setQuickNewPrice(26);
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="BCA-MAT-STEEL-REBAR">Steel Rebar 16-32mm (BCA Market Rate)</option>
                <option value="BCA-MAT-CONCRETE-G40">Ready-Mixed Concrete Grade 40 (BCA)</option>
                <option value="BCA-MAT-CEMENT-BULK">Ordinary Portland Cement Bulk (BCA)</option>
                <option value="BCA-MAT-SAND">Concreting Sand (BCA)</option>
                <option value="BCA-MAT-GRANITE">Granite Aggregate 20mm (BCA)</option>
                <option value="SINGSTAT-DSPI-DIV67">Structural Steel Sections (SingStat DSPI)</option>
                <option value="SINGSTAT-DSPI-DIV77-CABLE">Insulated Wire &amp; Cables (SingStat DSPI)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[11px] text-slate-600">Quantity:</span>
                <input
                  type="number"
                  min="1"
                  value={quickQty}
                  onChange={(e) => setQuickQty(parseFloat(e.target.value) || 1)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-600">Contractor Name:</span>
                <input
                  type="text"
                  placeholder="e.g. Supplier A"
                  value={quickTenderer}
                  onChange={(e) => setQuickTenderer(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Previous Price vs Current Quote */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Previous vs Current Rate:</span>
            </label>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Previous Price / Rate (SGD):</span>
                <span>Date: {quickPrevDate}</span>
              </div>
              <input
                type="number"
                step="any"
                value={quickPrevPrice}
                onChange={(e) => setQuickPrevPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 font-mono text-xs font-semibold text-slate-800"
              />
            </div>

            <div className="pt-1">
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>New Tender Quote Rate (SGD):</span>
                <span>Date: {quickNewDate}</span>
              </div>
              <input
                type="number"
                step="any"
                value={quickNewPrice}
                onChange={(e) => setQuickNewPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 font-mono text-xs font-bold text-slate-900"
              />
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
                  Step 3: Instant Market Verdict
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  isOver ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'
                }`}>
                  {isOver ? 'Above Index Benchmark' : 'Within Expected Benchmark'}
                </span>
              </div>

              <div className="mt-2">
                <div className="text-lg font-black font-mono">
                  {isOver ? '+' : ''}SGD {liveResult.varianceSgd.toLocaleString()} ({isOver ? '+' : ''}{liveResult.variancePercent.toFixed(1)}%)
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Official index benchmark: <strong>SGD {liveResult.benchmarkCostSgd.toLocaleString()}</strong>.
                  {isOver
                    ? ' Contractor quote escalated faster than the official market benchmark.'
                    : ' Contractor quote is well-supported by official market movements.'}
                </div>
              </div>
            </div>

            <button
              onClick={handleAddQuickToTable}
              className="mt-3 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Civil Evaluation Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* CIVIL TOTALS KPI STRIP (EVALUATED SEPARATELY) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            Civil Baseline Total
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-1">
            SGD {totalCivilBaseline.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Historical contract costs</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            Civil Current Tender
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-1">
            SGD {totalCivilTender.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {civilItems.length} items evaluated
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-blue-700 uppercase">
            BCA/SingStat Benchmark
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-blue-900 mt-1">
            SGD {totalCivilBenchmark.toLocaleString()}
          </div>
          <div className="text-[11px] text-blue-600 mt-0.5">Market-adjusted target</div>
        </div>

        <div className={`border rounded-lg p-3.5 shadow-xs ${
          civilVarianceSgd > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="text-[11px] font-semibold text-slate-600 uppercase">
            Civil Net Difference
          </div>
          <div className={`text-base sm:text-lg font-bold font-mono mt-1 ${
            civilVarianceSgd > 0 ? 'text-rose-700' : 'text-emerald-700'
          }`}>
            {civilVarianceSgd > 0 ? '+' : ''}SGD {civilVarianceSgd.toLocaleString()}
          </div>
          <div className={`text-[11px] font-bold ${civilVarianceSgd > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {civilVariancePct > 0 ? `+${civilVariancePct.toFixed(1)}% above benchmark` : `${civilVariancePct.toFixed(1)}% below benchmark`}
          </div>
        </div>
      </div>

      {/* CIVIL TENDER EVALUATION TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-2">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Civil Materials Comparison Table ({civilItems.length} items)
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated strictly on civil indices. Click "Explain Math" to see formulas and source links.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Contractor</th>
                <th className="py-2.5 px-3">Material &amp; Specification</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Previous Price</th>
                <th className="py-2.5 px-3 text-right">New Tender Quote</th>
                <th className="py-2.5 px-3 text-right">Official Benchmark</th>
                <th className="py-2.5 px-3 text-right">Difference (SGD / %)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {civilItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No civil materials added yet. Use the Quick Quote Checker above to test an item!
                  </td>
                </tr>
              ) : (
                civilItems.map((item) => {
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

                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {item.quantity.toLocaleString()} {item.unit}
                      </td>

                      <td className="py-3 px-3 text-right font-mono">
                        <div className="font-semibold text-slate-900">
                          SGD {result?.baselineCostSgd.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          SGD {item.baselineUnitPrice.toLocaleString()}/{item.unit}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        <div>SGD {result?.tenderCostSgd.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400">
                          SGD {item.tenderUnitPrice.toLocaleString()}/{item.unit}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-blue-900 font-semibold">
                        <div>SGD {result?.benchmarkCostSgd.toLocaleString()}</div>
                        <div className="text-[10px] text-blue-600">
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
                            className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition cursor-pointer"
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
