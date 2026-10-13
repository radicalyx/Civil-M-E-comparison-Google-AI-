import React, { useState } from 'react';
import {
  Wrench,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Download,
  Plus,
  Sliders,
  Edit2,
  Trash2,
  Info,
  LineChart
} from 'lucide-react';
import { CatalogueSeries, CompositeWeightItem, DataObservation, TenderLineItem } from '../types/index.ts';
import { ME_TRADE_TEMPLATES } from '../server/catalogueData.ts';
import { calculateItemBenchmark, sanitizeCsvField } from '../utils/calculations.ts';
import { PriceIndexChart } from './PriceIndexChart.tsx';

interface MeSupplyInstallViewProps {
  items: TenderLineItem[];
  itemResults: any[];
  catalogue: CatalogueSeries[];
  observationsMap: Record<string, DataObservation[]>;
  onInspectTrace: (item: TenderLineItem, result: any) => void;
  onEditItem: (item: TenderLineItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (item: TenderLineItem) => void;
  onUpdateWeights: (itemId: string, newWeights: CompositeWeightItem[]) => void;
}

export const MeSupplyInstallView: React.FC<MeSupplyInstallViewProps> = ({
  items,
  itemResults,
  catalogue,
  observationsMap,
  onInspectTrace,
  onEditItem,
  onDeleteItem,
  onAddItem,
  onUpdateWeights
}) => {
  // Filter only M&E items
  const meItems = items.filter(i => i.category === 'ME_TRADE');
  const meIndices = items.map((item, idx) => item.category === 'ME_TRADE' ? idx : -1).filter(idx => idx !== -1);
  const meResults = meIndices.map(idx => itemResults[idx]).filter(Boolean);

  // M&E Series for graph
  const meSeries = catalogue.filter(c =>
    c.category === 'ME_EQUIPMENT' ||
    c.id === 'SINGSTAT-DSPI-DIV77-CABLE' ||
    c.id === 'SINGSTAT-DSPI-DIV68-ALUM' ||
    c.id === 'SINGSTAT-ULC-CONST'
  );

  // Dedicated M&E Totals (Evaluated Separately)
  const totalMeBaseline = meResults.reduce((sum, r) => sum + r.baselineCostSgd, 0);
  const totalMeTender = meResults.reduce((sum, r) => sum + r.tenderCostSgd, 0);
  const totalMeBenchmark = meResults.reduce((sum, r) => sum + r.benchmarkCostSgd, 0);
  const meVarianceSgd = totalMeTender - totalMeBenchmark;
  const meVariancePct = totalMeBenchmark > 0 ? ((totalMeTender / totalMeBenchmark) - 1) * 100 : 0;

  // Layman Quick M&E Checker State
  const [quickTrade, setQuickTrade] = useState('ACMV');
  const [selectedChartSeriesId, setSelectedChartSeriesId] = useState('SINGSTAT-IPI-DIV74-PUMPS');
  const [quickTenderer, setQuickTenderer] = useState('');
  const [quickDesc, setQuickDesc] = useState('Chiller Plant & AHU Replacement');
  const [quickPrevPrice, setQuickPrevPrice] = useState(680000);
  const [quickPrevDate, setQuickPrevDate] = useState('2021M01');
  const [quickNewPrice, setQuickNewPrice] = useState(845000);
  const [quickNewDate, setQuickNewDate] = useState('2024M06');

  // Trade template
  const currentTemplate = ME_TRADE_TEMPLATES[quickTrade] || ME_TRADE_TEMPLATES['ACMV'];

  // Test item for live verdict
  const testItem: TenderLineItem = {
    id: 'QUICK-ME-TEST',
    tendererName: quickTenderer || 'M&E Contractor',
    category: 'ME_TRADE',
    itemCode: 'ME-TEST',
    description: quickDesc,
    specification: currentTemplate.description,
    quantity: 1,
    unit: 'Package',
    currency: 'SGD',
    exchangeRateToSgd: 1.0,
    gstBasis: 'EXCLUSIVE',
    baselinePriceDate: quickPrevDate,
    baselineUnitPrice: quickPrevPrice,
    baselineTotalPrice: quickPrevPrice,
    tenderPriceDate: quickNewDate,
    tenderUnitPrice: quickNewPrice,
    tenderTotalPrice: quickNewPrice,
    benchmarkSeriesId: 'COMPOSITE_' + quickTrade,
    customCompositeWeights: [
      {
        componentName: 'Major Plant Equipment',
        seriesId: currentTemplate.recommendedSeries.equipmentSeriesId,
        weightPercent: currentTemplate.defaultWeights.equipment,
        description: 'Equipment'
      },
      {
        componentName: 'Ductwork & Materials',
        seriesId: currentTemplate.recommendedSeries.materialsSeriesId,
        weightPercent: currentTemplate.defaultWeights.materials,
        description: 'Materials'
      },
      {
        componentName: 'Installation Labour',
        seriesId: currentTemplate.recommendedSeries.labourSeriesId,
        weightPercent: currentTemplate.defaultWeights.labour,
        description: 'Labour'
      },
      {
        componentName: 'Testing & Commissioning',
        seriesId: currentTemplate.recommendedSeries.labourSeriesId,
        weightPercent: currentTemplate.defaultWeights.testingCommissioning,
        description: 'T&C'
      },
      {
        componentName: 'Overhead & Profit',
        seriesId: 'SINGSTAT-ULC-TOTAL',
        weightPercent: currentTemplate.defaultWeights.overheadProfit,
        description: 'O&P'
      }
    ]
  };

  const liveResult = calculateItemBenchmark(testItem, catalogue, observationsMap);
  const isOver = liveResult.varianceSgd > 0;

  const handleAddQuickToTable = () => {
    const newItem: TenderLineItem = {
      ...testItem,
      id: 'ME-' + Date.now(),
      tendererName: quickTenderer.trim() || 'Specialist Contractor',
      itemCode: 'ME-' + quickTrade + '-' + Math.floor(100 + Math.random() * 900)
    };
    onAddItem(newItem);
    setQuickTenderer('');
  };

  const handleExportMeCsv = () => {
    const headers = [
      'Trade Code',
      'M&E Scope Description',
      'Tenderer',
      'Previous Contract (SGD)',
      'New Tender Quote (SGD)',
      'Composite Benchmark (SGD)',
      'Difference (SGD)',
      'Difference (%)',
      'Status'
    ];

    const rows = meItems.map((item) => {
      const origIdx = items.indexOf(item);
      const res = itemResults[origIdx];
      const status = res?.varianceSgd > 0 ? 'Above Benchmark' : 'Within Benchmark';

      return [
        sanitizeCsvField(item.itemCode),
        sanitizeCsvField(item.description),
        sanitizeCsvField(item.tendererName),
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
    link.download = `ME_Supply_Install_Tender_Evaluation_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-indigo-950 text-white p-4 sm:p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-300" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              M&amp;E Supply &amp; Installation Evaluation
            </h2>
          </div>
          <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
            ACMV, Electrical, Plumbing, Fire Protection, Lifts, and ELV trades evaluated separately via pre-configured equipment, material, and labour weightings.
          </p>
        </div>

        <button
          onClick={handleExportMeCsv}
          className="flex items-center gap-1.5 text-xs bg-white hover:bg-indigo-50 text-indigo-950 font-bold px-3 py-2 rounded-lg shadow-xs transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-indigo-700" />
          <span>Export M&amp;E Report (CSV)</span>
        </button>
      </div>

      {/* DEDICATED PRICE INDEX GRAPH FOR M&E TAB */}
      <PriceIndexChart
        title="M&amp;E Equipment &amp; Trade Price Index Historical Trend"
        subtitle="Visualise SingStat IPI capital equipment and DSPI material indices used in M&E trade composites"
        availableSeries={meSeries}
        observationsMap={observationsMap}
        selectedSeriesId={selectedChartSeriesId}
        onSelectSeriesId={setSelectedChartSeriesId}
        highlightBaselinePeriod={quickPrevDate}
        highlightTenderPeriod={quickNewDate}
        colorTheme="indigo"
      />

      {/* QUICK M&E CHECKER FOR LAYMEN */}
      <div className="bg-white border-2 border-indigo-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
              <span>Quick M&amp;E Quote Checker: Test an M&amp;E Package Quote</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select trade and enter previous package price vs contractor quote
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Step 1: Trade */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Select M&amp;E Trade:</span>
            </label>

            <select
              value={quickTrade}
              onChange={(e) => {
                const tr = e.target.value;
                setQuickTrade(tr);
                if (tr === 'ACMV') {
                  setQuickDesc('Chiller Plant & AHU Replacement');
                  setQuickPrevPrice(680000);
                  setQuickNewPrice(845000);
                  setSelectedChartSeriesId('SINGSTAT-IPI-DIV74-PUMPS');
                } else if (tr === 'ELECTRICAL') {
                  setQuickDesc('Main Switchboard & Cabling Package');
                  setQuickPrevPrice(420000);
                  setQuickNewPrice(535000);
                  setSelectedChartSeriesId('SINGSTAT-IPI-DIV77-SWITCHGEAR');
                } else if (tr === 'FIRE_PROTECTION') {
                  setQuickDesc('Fire Sprinkler & Alarm Reticulation');
                  setQuickPrevPrice(250000);
                  setQuickNewPrice(310000);
                  setSelectedChartSeriesId('SINGSTAT-IPI-DIV74-PUMPS');
                } else if (tr === 'PLUMBING') {
                  setQuickDesc('Domestic Water Pump Sets & Piping');
                  setQuickPrevPrice(180000);
                  setQuickNewPrice(220000);
                  setSelectedChartSeriesId('SINGSTAT-IPI-DIV74-PUMPS');
                } else if (tr === 'GENERATORS_UPS') {
                  setQuickDesc('Standby Diesel Generator & UPS Set');
                  setQuickPrevPrice(350000);
                  setQuickNewPrice(430000);
                  setSelectedChartSeriesId('SINGSTAT-IPI-DIV71-GENERATORS');
                } else if (tr === 'LIFTS_ESCALATORS') {
                  setQuickDesc('Passenger Elevator Modernisation');
                  setQuickPrevPrice(300000);
                  setQuickNewPrice(360000);
                  setSelectedChartSeriesId('SINGSTAT-IPI-DIV74-PUMPS');
                } else {
                  setQuickDesc('BMS & Security Systems Modernisation');
                  setQuickPrevPrice(200000);
                  setQuickNewPrice(245000);
                  setSelectedChartSeriesId('SINGSTAT-IPI-DIV75-BMS-ELV');
                }
              }}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
            >
              <option value="ACMV">ACMV (Chillers, AHUs, Ventilation)</option>
              <option value="ELECTRICAL">Electrical (Switchboards, Transformers, Cabling)</option>
              <option value="FIRE_PROTECTION">Fire Protection (Sprinklers, Pumps, Alarms)</option>
              <option value="PLUMBING">Plumbing &amp; Sanitary (Pumps, Valves, Pipes)</option>
              <option value="GENERATORS_UPS">Generators &amp; Static UPS Systems</option>
              <option value="LIFTS_ESCALATORS">Lifts &amp; Escalators</option>
              <option value="BMS_CONTROLS">BMS &amp; Building Controls</option>
              <option value="ELV_SECURITY">ELV, CCTV &amp; Card Access</option>
            </select>

            <div className="pt-1">
              <span className="text-[11px] text-slate-600">Contractor Name:</span>
              <input
                type="text"
                placeholder="e.g. Carrier / Shincon / Meiden"
                value={quickTenderer}
                onChange={(e) => setQuickTenderer(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
              />
            </div>
          </div>

          {/* Step 2: Prices */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Previous vs Current Tender Quote:</span>
            </label>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Previous Package Price (SGD):</span>
                <span>Date: {quickPrevDate}</span>
              </div>
              <input
                type="number"
                value={quickPrevPrice}
                onChange={(e) => setQuickPrevPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 font-mono text-xs font-semibold"
              />
            </div>

            <div className="pt-1">
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>New Tender Quote (SGD):</span>
                <span>Date: {quickNewDate}</span>
              </div>
              <input
                type="number"
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
                  Step 3: Trade Benchmark Verdict
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  isOver ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'
                }`}>
                  {isOver ? 'Above Composite Benchmark' : 'Within Expected Benchmark'}
                </span>
              </div>

              <div className="mt-2">
                <div className="text-lg font-black font-mono">
                  {isOver ? '+' : ''}SGD {liveResult.varianceSgd.toLocaleString()} ({isOver ? '+' : ''}{liveResult.variancePercent.toFixed(1)}%)
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Composite benchmark: <strong>SGD {liveResult.benchmarkCostSgd.toLocaleString()}</strong>.
                  Calculated from imported equipment index, materials index, and trade labour.
                </div>
              </div>
            </div>

            <button
              onClick={handleAddQuickToTable}
              className="mt-3 w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to M&amp;E Evaluation Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* M&E TOTALS KPI STRIP (EVALUATED SEPARATELY) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            M&amp;E Baseline Total
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-1">
            SGD {totalMeBaseline.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Historical contract costs</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            M&amp;E Current Tender
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-1">
            SGD {totalMeTender.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {meItems.length} packages evaluated
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-indigo-700 uppercase">
            Composite Benchmark Total
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-indigo-900 mt-1">
            SGD {totalMeBenchmark.toLocaleString()}
          </div>
          <div className="text-[11px] text-indigo-600 mt-0.5">Target based on market index</div>
        </div>

        <div className={`border rounded-lg p-3.5 shadow-xs ${
          meVarianceSgd > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="text-[11px] font-semibold text-slate-600 uppercase">
            M&amp;E Net Difference
          </div>
          <div className={`text-base sm:text-lg font-bold font-mono mt-1 ${
            meVarianceSgd > 0 ? 'text-rose-700' : 'text-emerald-700'
          }`}>
            {meVarianceSgd > 0 ? '+' : ''}SGD {meVarianceSgd.toLocaleString()}
          </div>
          <div className={`text-[11px] font-bold ${meVarianceSgd > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {meVariancePct > 0 ? `+${meVariancePct.toFixed(1)}% above benchmark` : `${meVariancePct.toFixed(1)}% below benchmark`}
          </div>
        </div>
      </div>

      {/* M&E EVALUATION TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-2">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              M&amp;E Packages Evaluation Table ({meItems.length} items)
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated strictly on M&amp;E composite trade series. No civil mixing.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Contractor</th>
                <th className="py-2.5 px-3">Trade Scope</th>
                <th className="py-2.5 px-3 text-right">Previous Price</th>
                <th className="py-2.5 px-3 text-right">New Tender Quote</th>
                <th className="py-2.5 px-3 text-right">Composite Benchmark</th>
                <th className="py-2.5 px-3 text-right">Difference (SGD / %)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {meItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No M&amp;E packages added yet. Use the Quick M&amp;E Quote Checker above to test a package!
                  </td>
                </tr>
              ) : (
                meItems.map((item) => {
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

                      <td className="py-3 px-3 text-right font-mono text-indigo-900 font-semibold">
                        <div>SGD {result?.benchmarkCostSgd.toLocaleString()}</div>
                        <div className="text-[10px] text-indigo-600">
                          Factor: {result?.trace?.indexFactor.toFixed(3)}
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
                            className="text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold px-2 py-1 bg-indigo-50 rounded hover:bg-indigo-100 transition cursor-pointer"
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
