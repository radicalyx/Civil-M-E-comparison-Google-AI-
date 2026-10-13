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
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Globe,
  Clock
} from 'lucide-react';
import { CatalogueSeries, CompositeWeightItem, DataObservation, TenderLineItem } from '../types/index.ts';
import { ME_TRADE_TEMPLATES } from '../server/catalogueData.ts';
import { calculateItemBenchmark, sanitizeCsvField } from '../utils/calculations.ts';
import { PriceIndexChart } from './PriceIndexChart.tsx';
import { ContractPeriodInput } from './ContractPeriodInput.tsx';

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
  // Reference currency filter state
  const [onlyCurrentReferences, setOnlyCurrentReferences] = useState(true);

  // Filter only M&E items
  const meItems = items.filter(i => i.category === 'ME_TRADE');
  const meIndices = items.map((item, idx) => item.category === 'ME_TRADE' ? idx : -1).filter(idx => idx !== -1);
  const meResults = meIndices.map(idx => itemResults[idx]).filter(Boolean);

  // M&E Series for graph and component mapping - filtered to updated current dates and sorted to favour Asia & Global data
  const meSeries = catalogue
    .filter(c =>
      (!onlyCurrentReferences || c.isUpdatedToCurrentDate !== false) &&
      (
        c.category === 'ME_EQUIPMENT' ||
        c.id.includes('COPPER') ||
        c.id.includes('ALUMINIUM') ||
        c.id.includes('ALUM') ||
        c.id.includes('LABOUR') ||
        c.id.includes('CABLE') ||
        c.id.includes('DIV67') ||
        c.id.includes('DIV74') ||
        c.id.includes('DIV77') ||
        c.id.includes('DIV71') ||
        c.id.includes('ULC') ||
        c.id.includes('MOM-WAGE')
      )
    )
    .sort((a, b) => {
      const getPriority = (s: CatalogueSeries) => {
        if (s.isAsiaRegion || s.geographicScope === 'ASIA' || s.id.includes('-ASIA-')) return 1;
        if (s.isMcpBenchmark || s.geographicScope === 'GLOBAL' || s.id.includes('-GLOBAL-')) return 2;
        return 3;
      };
      const diff = getPriority(a) - getPriority(b);
      if (diff !== 0) return diff;
      return a.title.localeCompare(b.title);
    });

  // Dedicated M&E Totals (Evaluated Separately)
  const totalMeBaseline = meResults.reduce((sum, r) => sum + r.baselineCostSgd, 0);
  const totalMeTender = meResults.reduce((sum, r) => sum + r.tenderCostSgd, 0);
  const totalMeBenchmark = meResults.reduce((sum, r) => sum + r.benchmarkCostSgd, 0);
  const meVarianceSgd = totalMeTender - totalMeBenchmark;
  const meVariancePct = totalMeBenchmark > 0 ? ((totalMeTender / totalMeBenchmark) - 1) * 100 : 0;

  // Layman Quick M&E Checker State - Defaults to Asia Regional Benchmark (Favoured)
  const [quickTrade, setQuickTrade] = useState('ACMV');
  const [selectedChartSeriesId, setSelectedChartSeriesId] = useState('MCP-ASIA-ME-EQUIPMENT');
  const [quickTenderer, setQuickTenderer] = useState('');
  const [quickDesc, setQuickDesc] = useState('Chiller Plant & AHU Replacement');
  const [quickPrevPrice, setQuickPrevPrice] = useState(680000);
  const [quickPrevDate, setQuickPrevDate] = useState('2021M01');
  const [quickPrevDuration, setQuickPrevDuration] = useState(24);
  const [quickNewPrice, setQuickNewPrice] = useState(845000);
  const [quickNewDate, setQuickNewDate] = useState('2026M03');
  const [quickNewDuration, setQuickNewDuration] = useState(24);

  // Trade template defaults
  const currentTemplate = ME_TRADE_TEMPLATES[quickTrade] || ME_TRADE_TEMPLATES['ACMV'];

  // CUSTOM BREAKDOWN COMPOSITION STATE FOR QUICK CHECKER
  const [showBreakdownEditor, setShowBreakdownEditor] = useState(false);
  const [quickWeights, setQuickWeights] = useState<CompositeWeightItem[]>([
    {
      componentName: 'Major Equipment (Chillers / AHUs / Plant)',
      seriesId: currentTemplate.recommendedSeries.equipmentSeriesId,
      weightPercent: currentTemplate.defaultWeights.equipment,
      description: 'Capital equipment imported into Singapore'
    },
    {
      componentName: 'Materials & Containment (Ducts, Piping, Trays)',
      seriesId: currentTemplate.recommendedSeries.materialsSeriesId,
      weightPercent: currentTemplate.defaultWeights.materials,
      description: 'Fabricated materials and containment'
    },
    {
      componentName: 'Site Installation & Assembly Labour',
      seriesId: currentTemplate.recommendedSeries.labourSeriesId,
      weightPercent: currentTemplate.defaultWeights.labour,
      description: 'Trade installation and rigging labour'
    },
    {
      componentName: 'Testing & Commissioning (T&C)',
      seriesId: currentTemplate.recommendedSeries.labourSeriesId,
      weightPercent: currentTemplate.defaultWeights.testingCommissioning,
      description: 'Balancing, calibration and technical inspection'
    },
    {
      componentName: 'Contractor Overhead & Profit Margin',
      seriesId: 'SINGSTAT-ULC-TOTAL',
      weightPercent: currentTemplate.defaultWeights.overheadProfit,
      description: 'Fixed corporate overhead & management margin'
    }
  ]);

  // Modal State for editing breakdown of an existing saved item
  const [editingItemWeights, setEditingItemWeights] = useState<TenderLineItem | null>(null);
  const [modalWeights, setModalWeights] = useState<CompositeWeightItem[]>([]);

  // Calculate sum of weights
  const quickWeightSum = quickWeights.reduce((sum, w) => sum + w.weightPercent, 0);
  const isQuickWeightValid = Math.abs(quickWeightSum - 100) < 0.1;

  // Auto-balance weights function
  const handleAutoBalanceQuickWeights = () => {
    if (quickWeights.length === 0) return;
    const currentSum = quickWeights.reduce((s, w) => s + w.weightPercent, 0);
    if (currentSum <= 0) return;
    const factor = 100 / currentSum;
    let accumulated = 0;
    const balanced = quickWeights.map((w, idx) => {
      if (idx === quickWeights.length - 1) {
        return { ...w, weightPercent: Math.max(0, 100 - accumulated) };
      }
      const rounded = Math.round(w.weightPercent * factor);
      accumulated += rounded;
      return { ...w, weightPercent: rounded };
    });
    setQuickWeights(balanced);
  };

  const handleAddQuickComponent = () => {
    setQuickWeights(prev => [
      ...prev,
      {
        componentName: 'Custom Trade Component',
        seriesId: 'SINGSTAT-IPI-DIV74-PUMPS',
        weightPercent: 0,
        description: 'User-defined M&E component'
      }
    ]);
  };

  const handleDeleteQuickComponent = (indexToDelete: number) => {
    if (quickWeights.length <= 1) return;
    setQuickWeights(prev => prev.filter((_, idx) => idx !== indexToDelete));
  };

  const handleAutoBalanceModalWeights = () => {
    if (modalWeights.length === 0) return;
    const currentSum = modalWeights.reduce((s, w) => s + w.weightPercent, 0);
    if (currentSum <= 0) return;
    const factor = 100 / currentSum;
    let accumulated = 0;
    const balanced = modalWeights.map((w, idx) => {
      if (idx === modalWeights.length - 1) {
        return { ...w, weightPercent: Math.max(0, 100 - accumulated) };
      }
      const rounded = Math.round(w.weightPercent * factor);
      accumulated += rounded;
      return { ...w, weightPercent: rounded };
    });
    setModalWeights(balanced);
  };

  const handleAddModalComponent = () => {
    setModalWeights(prev => [
      ...prev,
      {
        componentName: 'Custom Trade Component',
        seriesId: 'SINGSTAT-IPI-DIV74-PUMPS',
        weightPercent: 0,
        description: 'User-defined M&E component'
      }
    ]);
  };

  const handleDeleteModalComponent = (indexToDelete: number) => {
    if (modalWeights.length <= 1) return;
    setModalWeights(prev => prev.filter((_, idx) => idx !== indexToDelete));
  };

  // Preset breakdown compositions
  const handleApplyPreset = (presetName: string) => {
    if (presetName === 'EQUIPMENT_HEAVY') {
      // 60% Equipment, 15% Materials, 12% Labour, 6% T&C, 7% O&P
      setQuickWeights([
        { componentName: 'Major Equipment', seriesId: currentTemplate.recommendedSeries.equipmentSeriesId, weightPercent: 60, description: 'Capital equipment' },
        { componentName: 'Materials & Containment', seriesId: currentTemplate.recommendedSeries.materialsSeriesId, weightPercent: 15, description: 'Materials' },
        { componentName: 'Installation Labour', seriesId: currentTemplate.recommendedSeries.labourSeriesId, weightPercent: 12, description: 'Labour' },
        { componentName: 'Testing & Commissioning', seriesId: currentTemplate.recommendedSeries.labourSeriesId, weightPercent: 6, description: 'T&C' },
        { componentName: 'Overhead & Profit', seriesId: 'SINGSTAT-ULC-TOTAL', weightPercent: 7, description: 'O&P' }
      ]);
    } else if (presetName === 'LABOUR_HEAVY') {
      // 30% Equipment, 25% Materials, 30% Labour, 8% T&C, 7% O&P
      setQuickWeights([
        { componentName: 'Major Equipment', seriesId: currentTemplate.recommendedSeries.equipmentSeriesId, weightPercent: 30, description: 'Capital equipment' },
        { componentName: 'Materials & Containment', seriesId: currentTemplate.recommendedSeries.materialsSeriesId, weightPercent: 25, description: 'Materials' },
        { componentName: 'Installation Labour', seriesId: currentTemplate.recommendedSeries.labourSeriesId, weightPercent: 30, description: 'Labour' },
        { componentName: 'Testing & Commissioning', seriesId: currentTemplate.recommendedSeries.labourSeriesId, weightPercent: 8, description: 'T&C' },
        { componentName: 'Overhead & Profit', seriesId: 'SINGSTAT-ULC-TOTAL', weightPercent: 7, description: 'O&P' }
      ]);
    } else if (presetName === 'BALANCED') {
      // Standard template default
      setQuickWeights([
        { componentName: 'Major Plant Equipment', seriesId: currentTemplate.recommendedSeries.equipmentSeriesId, weightPercent: currentTemplate.defaultWeights.equipment, description: 'Capital equipment' },
        { componentName: 'Materials & Containment', seriesId: currentTemplate.recommendedSeries.materialsSeriesId, weightPercent: currentTemplate.defaultWeights.materials, description: 'Materials' },
        { componentName: 'Installation Labour', seriesId: currentTemplate.recommendedSeries.labourSeriesId, weightPercent: currentTemplate.defaultWeights.labour, description: 'Labour' },
        { componentName: 'Testing & Commissioning', seriesId: currentTemplate.recommendedSeries.labourSeriesId, weightPercent: currentTemplate.defaultWeights.testingCommissioning, description: 'T&C' },
        { componentName: 'Overhead & Profit', seriesId: 'SINGSTAT-ULC-TOTAL', weightPercent: currentTemplate.defaultWeights.overheadProfit, description: 'O&P' }
      ]);
    } else if (presetName === 'EQUAL_SPLIT') {
      const splitVal = Math.floor(100 / quickWeights.length);
      const rem = 100 - splitVal * quickWeights.length;
      setQuickWeights(prev => prev.map((w, i) => ({
        ...w,
        weightPercent: i === 0 ? splitVal + rem : splitVal
      })));
    }
  };

  // Live test item with custom breakdown
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
    baselineContractDurationMonths: quickPrevDuration,
    baselineContractPeriodLabel: `${quickPrevDate} (${quickPrevDuration} mos contract term)`,
    baselineUnitPrice: quickPrevPrice,
    baselineTotalPrice: quickPrevPrice,
    tenderPriceDate: quickNewDate,
    tenderContractDurationMonths: quickNewDuration,
    tenderContractPeriodLabel: `${quickNewDate} (${quickNewDuration} mos contract term)`,
    tenderUnitPrice: quickNewPrice,
    tenderTotalPrice: quickNewPrice,
    contractDurationMonths: quickNewDuration,
    benchmarkSeriesId: 'COMPOSITE_' + quickTrade,
    customCompositeWeights: quickWeights
  };

  const liveResult = calculateItemBenchmark(testItem, catalogue, observationsMap);
  const isOver = liveResult.varianceSgd > 0;

  const handleAddQuickToTable = () => {
    const newItem: TenderLineItem = {
      ...testItem,
      id: 'ME-' + Date.now(),
      tendererName: quickTenderer.trim() || 'Specialist Contractor',
      itemCode: 'ME-' + quickTrade + '-' + Math.floor(100 + Math.random() * 900),
      baselineContractDurationMonths: quickPrevDuration,
      baselineContractPeriodLabel: `${quickPrevDate} (${quickPrevDuration} mos contract term)`,
      tenderContractDurationMonths: quickNewDuration,
      tenderContractPeriodLabel: `${quickNewDate} (${quickNewDuration} mos contract term)`,
      contractDurationMonths: quickNewDuration
    };
    onAddItem(newItem);
    setQuickTenderer('');
  };

  const handleOpenModalWeights = (item: TenderLineItem) => {
    setEditingItemWeights(item);
    setModalWeights(
      item.customCompositeWeights && item.customCompositeWeights.length > 0
        ? [...item.customCompositeWeights]
        : [
            { componentName: 'Equipment', seriesId: 'SINGSTAT-IPI-DIV74-PUMPS', weightPercent: 45, description: 'Equipment' },
            { componentName: 'Materials', seriesId: 'SINGSTAT-DSPI-DIV68-ALUM', weightPercent: 25, description: 'Materials' },
            { componentName: 'Labour', seriesId: 'SINGSTAT-ULC-CONST', weightPercent: 18, description: 'Labour' },
            { componentName: 'Testing & Commissioning', seriesId: 'SINGSTAT-ULC-CONST', weightPercent: 5, description: 'T&C' },
            { componentName: 'Overhead & Profit', seriesId: 'SINGSTAT-ULC-TOTAL', weightPercent: 7, description: 'O&P' }
          ]
    );
  };

  const handleSaveModalWeights = () => {
    if (!editingItemWeights) return;
    onUpdateWeights(editingItemWeights.id, modalWeights);
    setEditingItemWeights(null);
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
      'Pricing Breakdown Composition',
      'Status'
    ];

    const rows = meItems.map((item) => {
      const origIdx = items.indexOf(item);
      const res = itemResults[origIdx];
      const status = res?.varianceSgd > 0 ? 'Above Benchmark' : 'Within Benchmark';
      const breakdownSummary = (item.customCompositeWeights || [])
        .map(w => `${w.componentName}: ${w.weightPercent}%`)
        .join('; ');

      return [
        sanitizeCsvField(item.itemCode),
        sanitizeCsvField(item.description),
        sanitizeCsvField(item.tendererName),
        sanitizeCsvField(res ? res.baselineCostSgd : 0),
        sanitizeCsvField(res ? res.tenderCostSgd : 0),
        sanitizeCsvField(res ? res.benchmarkCostSgd : 0),
        sanitizeCsvField(res ? res.varianceSgd : 0),
        sanitizeCsvField(res ? res.variancePercent : 0),
        sanitizeCsvField(breakdownSummary),
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
            Customizable pricing breakdown composition across Equipment, Materials, Installation Labour, T&amp;C, and Overhead.
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
        subtitle="Visualise M&E equipment and trade indices with Asia-Pacific regional OEM machinery benchmarks favoured"
        availableSeries={meSeries}
        observationsMap={observationsMap}
        selectedSeriesId={selectedChartSeriesId}
        onSelectSeriesId={setSelectedChartSeriesId}
        highlightBaselinePeriod={quickPrevDate}
        highlightTenderPeriod={quickNewDate}
        colorTheme="indigo"
      />

      {/* QUICK M&E CHECKER WITH CUSTOM BREAKDOWN COMPOSITION */}
      <div className="bg-white border-2 border-indigo-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
              <span>Quick M&amp;E Quote Checker &amp; Cost Breakdown Engine</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select trade, enter prices, and customize the equipment vs labour breakdown composition
            </p>
          </div>

          <button
            onClick={() => setShowBreakdownEditor(!showBreakdownEditor)}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showBreakdownEditor ? 'Hide Breakdown Sliders' : 'Customize Pricing Breakdown (%)'}</span>
            {showBreakdownEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* MAIN STEP 1-2-3 FORM */}
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
                const tmpl = ME_TRADE_TEMPLATES[tr] || ME_TRADE_TEMPLATES['ACMV'];
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

                // Update default weights for this trade
                setQuickWeights([
                  {
                    componentName: 'Major Plant Equipment',
                    seriesId: tmpl.recommendedSeries.equipmentSeriesId,
                    weightPercent: tmpl.defaultWeights.equipment,
                    description: 'Capital equipment'
                  },
                  {
                    componentName: 'Materials & Containment',
                    seriesId: tmpl.recommendedSeries.materialsSeriesId,
                    weightPercent: tmpl.defaultWeights.materials,
                    description: 'Materials & ducts'
                  },
                  {
                    componentName: 'Installation Labour',
                    seriesId: tmpl.recommendedSeries.labourSeriesId,
                    weightPercent: tmpl.defaultWeights.labour,
                    description: 'Trade site labour'
                  },
                  {
                    componentName: 'Testing & Commissioning',
                    seriesId: tmpl.recommendedSeries.labourSeriesId,
                    weightPercent: tmpl.defaultWeights.testingCommissioning,
                    description: 'T&C inspection'
                  },
                  {
                    componentName: 'Overhead & Profit',
                    seriesId: 'SINGSTAT-ULC-TOTAL',
                    weightPercent: tmpl.defaultWeights.overheadProfit,
                    description: 'Contractor margin'
                  }
                ]);
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

          {/* Step 2: Previous Contract vs Current Tender Quote */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Previous Contract vs Current Tender Quote:</span>
            </label>

            {/* Previous Contract Time Period Input */}
            <div className="bg-white p-2.5 rounded border border-slate-200 space-y-2">
              <ContractPeriodInput
                label="Previous Contract Period:"
                period={quickPrevDate}
                onChangePeriod={setQuickPrevDate}
                durationMonths={quickPrevDuration}
                onChangeDuration={setQuickPrevDuration}
                showDuration={true}
              />

              <div className="pt-1">
                <span className="text-[11px] text-slate-600 block mb-0.5">Previous Package Price (SGD):</span>
                <input
                  type="number"
                  value={quickPrevPrice}
                  onChange={(e) => setQuickPrevPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1 font-mono text-xs font-semibold"
                  placeholder="Enter previous contract package price"
                />
              </div>
            </div>

            {/* New Tender Quote Submission Date */}
            <div className="bg-white p-2.5 rounded border border-slate-200 space-y-2">
              <ContractPeriodInput
                label="New Tender Quote Submission Date:"
                period={quickNewDate}
                onChangePeriod={setQuickNewDate}
                durationMonths={quickNewDuration}
                onChangeDuration={setQuickNewDuration}
                showDuration={true}
                isTender={true}
                durationLabel="New Tender Contract Duration:"
              />

              <div className="pt-1">
                <span className="text-[11px] text-slate-600 block mb-0.5">New Tender Quote (SGD):</span>
                <input
                  type="number"
                  value={quickNewPrice}
                  onChange={(e) => setQuickNewPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1 font-mono text-xs font-bold text-slate-900"
                  placeholder="Enter current quotation"
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
                  Step 3: Composite Benchmark Verdict
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
                  Factor: <strong>{liveResult.trace?.indexFactor.toFixed(4)}</strong> based on customized breakdown composition.
                </div>

                {liveResult.trace?.isDurationAdjusted && (
                  <div className="mt-2 p-2 bg-indigo-100 rounded border border-indigo-300 text-[10px] text-indigo-950 flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">⏱️ Duration Factored In ({liveResult.trace?.durationRatio?.toFixed(2)}×):</span> New tender duration is <strong>{liveResult.trace?.tenderDurationMonths} months</strong> vs <strong>{liveResult.trace?.baselineDurationMonths} months</strong> in previous contract. Benchmark scaled to match new tender term (SGD {liveResult.trace?.benchmarkMonthlyRateSgd?.toLocaleString()}/mo benchmark vs SGD {liveResult.trace?.tenderMonthlyRateSgd?.toLocaleString()}/mo tender).
                    </div>
                  </div>
                )}

                {liveResult.trace?.isMcpBridged && (
                  <div className="mt-2 p-2 bg-sky-100 rounded border border-sky-300 text-[10px] text-sky-950 flex items-start gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Global MCP Active:</span> Includes Global Market Clearing Prices (LME Copper/Equipment) normalised to SGD for up-to-date current dates.
                    </div>
                  </div>
                )}
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

        {/* INTERACTIVE BREAKDOWN COMPOSITION SLIDERS (EXPANDABLE) */}
        {showBreakdownEditor && (
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-200/60 pb-3">
              <div>
                <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-700" />
                  <span>Customize Pricing Breakdown Composition for {currentTemplate.tradeName}</span>
                </h4>
                <p className="text-[11px] text-indigo-800 mt-0.5">
                  Adjust component percentages to match your project's Bill of Quantities (BOQ). Weights must total 100%.
                </p>
              </div>

              {/* Total indicator & Balance button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-slate-600">Total:</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    isQuickWeightValid ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {quickWeightSum}% {isQuickWeightValid ? '✓ Valid' : `⚠ (Off by ${100 - quickWeightSum}%)`}
                  </span>
                </div>

                {!isQuickWeightValid && (
                  <button
                    onClick={handleAutoBalanceQuickWeights}
                    className="flex items-center gap-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded cursor-pointer transition shadow-xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Balance to 100%</span>
                  </button>
                )}
              </div>
            </div>

            {/* Presets Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Industry Presets:</span>
                </span>
                <button
                  onClick={() => handleApplyPreset('BALANCED')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-medium text-slate-700 cursor-pointer"
                >
                  Standard Trade Default
                </button>
                <button
                  onClick={() => handleApplyPreset('EQUIPMENT_HEAVY')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-medium text-slate-700 cursor-pointer"
                >
                  Heavy Equipment (60% Eq / 15% Mat)
                </button>
                <button
                  onClick={() => handleApplyPreset('LABOUR_HEAVY')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-medium text-slate-700 cursor-pointer"
                >
                  Labour-Heavy Retrofit (30% Eq / 30% Lab)
                </button>
                <button
                  onClick={() => handleApplyPreset('EQUAL_SPLIT')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-medium text-slate-700 cursor-pointer"
                >
                  Equal Split
                </button>
              </div>

              <button
                onClick={handleAddQuickComponent}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-900 hover:bg-indigo-800 text-white rounded text-[11px] font-bold cursor-pointer transition shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Component</span>
              </button>
            </div>

            {/* Component Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {quickWeights.map((comp, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2 relative">
                  <div className="flex justify-between items-start gap-1 text-xs">
                    <input
                      type="text"
                      value={comp.componentName}
                      onChange={(e) => {
                        const updated = [...quickWeights];
                        updated[idx] = { ...updated[idx], componentName: e.target.value };
                        setQuickWeights(updated);
                      }}
                      className="font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden text-xs w-full mr-1 truncate"
                      title="Click to rename component"
                    />
                    {quickWeights.length > 1 && (
                      <button
                        onClick={() => handleDeleteQuickComponent(idx)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                        title="Delete component"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={comp.weightPercent}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        const updated = [...quickWeights];
                        updated[idx] = { ...updated[idx], weightPercent: val };
                        setQuickWeights(updated);
                      }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex items-center font-mono">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={comp.weightPercent}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          const updated = [...quickWeights];
                          updated[idx] = { ...updated[idx], weightPercent: Math.max(0, Math.min(100, val)) };
                          setQuickWeights(updated);
                        }}
                        className="w-12 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-right font-bold text-indigo-700 text-xs"
                      />
                      <span className="text-[10px] text-slate-500 ml-0.5">%</span>
                    </div>
                  </div>

                  {/* Series Selector for Component */}
                  <div className="pt-1">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                      Mapped Index:
                    </label>
                    <select
                      value={comp.seriesId}
                      onChange={(e) => {
                        const updated = [...quickWeights];
                        updated[idx] = { ...updated[idx], seriesId: e.target.value };
                        setQuickWeights(updated);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-[10px] text-slate-800 font-medium truncate"
                    >
                      {meSeries.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
              Evaluated strictly on M&amp;E composite trade series. Click "Breakdown" to modify component percentages for any item.
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
                <th className="py-2.5 px-3 text-center">Breakdown Composition</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {meItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No M&amp;E packages added yet. Use the Quick M&amp;E Quote Checker above to test a package!
                  </td>
                </tr>
              ) : (
                meItems.map((item) => {
                  const origIdx = items.indexOf(item);
                  const result = itemResults[origIdx];
                  const isItemOver = result?.varianceSgd > 0;
                  const weights = item.customCompositeWeights || [];

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
                        <div className="text-[10px] text-slate-400">
                          {item.baselinePriceDate} {item.baselineContractDurationMonths ? `(${item.baselineContractDurationMonths}m)` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        <div>SGD {result?.tenderCostSgd.toLocaleString()}</div>
                        <div className="flex items-center justify-end gap-1 text-[10px]">
                          <span className="text-slate-400">{item.tenderPriceDate}</span>
                          {item.tenderContractDurationMonths && (
                            <span className="bg-indigo-50 text-indigo-700 px-1 rounded border border-indigo-200 text-[9.5px]">
                              {item.tenderContractDurationMonths}m
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-indigo-900 font-semibold">
                        <div>SGD {result?.benchmarkCostSgd.toLocaleString()}</div>
                        <div className="text-[10px] text-indigo-600">
                          Factor: {result?.trace?.indexFactor.toFixed(3)}
                        </div>
                        {result?.trace?.isDurationAdjusted && (
                          <div className="text-[9.5px] text-indigo-700 font-sans font-semibold flex items-center justify-end gap-0.5" title={`Term scaled by ${result?.trace?.durationRatio?.toFixed(2)}x`}>
                            <Clock className="w-2.5 h-2.5" />
                            <span>{result?.trace?.durationRatio?.toFixed(2)}× term</span>
                          </div>
                        )}
                      </td>

                      <td className={`py-3 px-3 text-right font-mono font-bold ${
                        isItemOver ? 'text-rose-700' : 'text-emerald-700'
                      }`}>
                        <div>{isItemOver ? '+' : ''}SGD {result?.varianceSgd.toLocaleString()}</div>
                        <div className="text-[10px]">
                          {isItemOver ? '+' : ''}{result?.variancePercent.toFixed(1)}%
                        </div>
                      </td>

                      {/* Breakdown composition column with quick edit button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenModalWeights(item)}
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-1 rounded cursor-pointer transition"
                          title="Click to view and edit component weight percentages"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>
                            {weights.length > 0 ? `${weights[0]?.weightPercent}% / ${weights[1]?.weightPercent}% / ${weights[2]?.weightPercent}%...` : 'Edit Weights'}
                          </span>
                        </button>
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

      {/* MODAL TO EDIT BREAKDOWN OF AN EXISTING SAVED ITEM */}
      {editingItemWeights && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Pricing Breakdown Composition
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {editingItemWeights.itemCode} · {editingItemWeights.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingItemWeights(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Total Weight:</span>
                  <span className={`font-mono font-bold px-2.5 py-0.5 rounded text-xs ${
                    Math.abs(modalWeights.reduce((s, w) => s + w.weightPercent, 0) - 100) < 0.1
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {modalWeights.reduce((s, w) => s + w.weightPercent, 0)}% {Math.abs(modalWeights.reduce((s, w) => s + w.weightPercent, 0) - 100) < 0.1 ? '✓' : `(Off by ${100 - modalWeights.reduce((s, w) => s + w.weightPercent, 0)}%)`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {Math.abs(modalWeights.reduce((s, w) => s + w.weightPercent, 0) - 100) >= 0.1 && (
                    <button
                      onClick={handleAutoBalanceModalWeights}
                      className="flex items-center gap-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded cursor-pointer transition shadow-2xs"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Auto-Balance to 100%</span>
                    </button>
                  )}

                  <button
                    onClick={handleAddModalComponent}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-900 bg-white hover:bg-indigo-50 border border-indigo-300 px-2.5 py-1 rounded cursor-pointer transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add Component</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {modalWeights.map((w, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      <input
                        type="text"
                        value={w.componentName}
                        onChange={(e) => {
                          const updated = [...modalWeights];
                          updated[idx] = { ...updated[idx], componentName: e.target.value };
                          setModalWeights(updated);
                        }}
                        className="font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden text-xs flex-1 truncate"
                        title="Click to rename component"
                      />

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 font-mono">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={w.weightPercent}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              const updated = [...modalWeights];
                              updated[idx] = { ...updated[idx], weightPercent: Math.max(0, Math.min(100, val)) };
                              setModalWeights(updated);
                            }}
                            className="w-14 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-right font-bold text-indigo-700 text-xs"
                          />
                          <span className="text-slate-500">%</span>
                        </div>

                        {modalWeights.length > 1 && (
                          <button
                            onClick={() => handleDeleteModalComponent(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                            title="Delete component"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={w.weightPercent}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        const updated = [...modalWeights];
                        updated[idx] = { ...updated[idx], weightPercent: val };
                        setModalWeights(updated);
                      }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Underlying Index:</label>
                      <select
                        value={w.seriesId}
                        onChange={(e) => {
                          const updated = [...modalWeights];
                          updated[idx] = { ...updated[idx], seriesId: e.target.value };
                          setModalWeights(updated);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px] text-slate-800"
                      >
                        {meSeries.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <div className="text-[11px] text-slate-500">
                {Math.abs(modalWeights.reduce((s, w) => s + w.weightPercent, 0) - 100) >= 0.1 ? (
                  <span className="text-rose-600 font-semibold">⚠ Weights must sum to 100% to save</span>
                ) : (
                  <span className="text-emerald-700 font-semibold">✓ Weights total 100%</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingItemWeights(null)}
                  className="px-4 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={Math.abs(modalWeights.reduce((s, w) => s + w.weightPercent, 0) - 100) >= 0.1}
                  onClick={handleSaveModalWeights}
                  className="px-4 py-1.5 bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-bold transition cursor-pointer"
                >
                  Save Breakdown Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
