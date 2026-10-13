import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Building2, Wrench, Clock, AlertTriangle } from 'lucide-react';
import { CatalogueSeries, FXRate, GstBasis, TenderLineItem } from '../types/index.ts';
import { ME_TRADE_TEMPLATES } from '../server/catalogueData.ts';

interface TenderItemModalProps {
  itemToEdit: TenderLineItem | null;
  catalogue: CatalogueSeries[];
  fxRates: Record<string, FXRate>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: TenderLineItem) => void;
}

export const TenderItemModal: React.FC<TenderItemModalProps> = ({
  itemToEdit,
  catalogue,
  fxRates,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState<'MATERIAL' | 'ME_TRADE' | 'MAINTENANCE'>('MATERIAL');
  const [tendererName, setTendererName] = useState('Shincon Engineering Pte Ltd');
  const [itemCode, setItemCode] = useState('ITM-' + Math.floor(100 + Math.random() * 900));
  const [description, setDescription] = useState('');
  const [specification, setSpecification] = useState('');
  const [scopeDifferencesFlag, setScopeDifferencesFlag] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState(12);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('Lump Sum');
  const [currency, setCurrency] = useState('SGD');
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [gstBasis, setGstBasis] = useState<GstBasis>('EXCLUSIVE');

  const [baselineDate, setBaselineDate] = useState('2021M01');
  const [baselineUnitPrice, setBaselineUnitPrice] = useState(100000);
  const [tenderDate, setTenderDate] = useState('2024M06');
  const [tenderUnitPrice, setTenderUnitPrice] = useState(115000);

  const [benchmarkSeriesId, setBenchmarkSeriesId] = useState('BCA-MAT-STEEL-REBAR');

  // Maintenance fields
  const [contractDurationMonths, setContractDurationMonths] = useState(12);
  const [labourSharePercent, setLabourSharePercent] = useState(70);
  const [technicianHeadcount, setTechnicianHeadcount] = useState(2);
  const [serviceFrequency, setServiceFrequency] = useState('Monthly scheduled servicing');

  // Selected trade template for M&E
  const [selectedTradeTemplate, setSelectedTradeTemplate] = useState('ACMV');

  useEffect(() => {
    if (itemToEdit) {
      setCategory(itemToEdit.category);
      setTendererName(itemToEdit.tendererName);
      setItemCode(itemToEdit.itemCode);
      setDescription(itemToEdit.description);
      setSpecification(itemToEdit.specification);
      setScopeDifferencesFlag(itemToEdit.scopeDifferencesFlag || '');
      setWarrantyMonths(itemToEdit.warrantyPeriodMonths || 12);
      setQuantity(itemToEdit.quantity);
      setUnit(itemToEdit.unit);
      setCurrency(itemToEdit.currency);
      setExchangeRate(itemToEdit.exchangeRateToSgd);
      setGstBasis(itemToEdit.gstBasis);
      setBaselineDate(itemToEdit.baselinePriceDate);
      setBaselineUnitPrice(itemToEdit.baselineUnitPrice);
      setTenderDate(itemToEdit.tenderPriceDate);
      setTenderUnitPrice(itemToEdit.tenderUnitPrice);
      setBenchmarkSeriesId(itemToEdit.overrideBenchmarkSeriesId || itemToEdit.benchmarkSeriesId);
      if (itemToEdit.contractDurationMonths) setContractDurationMonths(itemToEdit.contractDurationMonths);
      if (itemToEdit.labourSharePercent !== undefined) setLabourSharePercent(itemToEdit.labourSharePercent);
      if (itemToEdit.technicianHeadcount) setTechnicianHeadcount(itemToEdit.technicianHeadcount);
      if (itemToEdit.serviceFrequency) setServiceFrequency(itemToEdit.serviceFrequency);
    } else {
      // Reset defaults
      setDescription('Structural Steel Works Supply');
      setSpecification('High-Tensile BS 4449 Standard, Grade B500B delivered to site');
    }
  }, [itemToEdit]);

  // Handle currency change
  const handleCurrencyChange = (newCur: string) => {
    setCurrency(newCur);
    if (newCur === 'SGD') {
      setExchangeRate(1.0);
    } else if (fxRates[newCur]) {
      setExchangeRate(fxRates[newCur].rateToSgd);
    }
  };

  const handleCategoryChange = (newCat: 'MATERIAL' | 'ME_TRADE' | 'MAINTENANCE') => {
    setCategory(newCat);
    if (newCat === 'MATERIAL') {
      setBenchmarkSeriesId('BCA-MAT-STEEL-REBAR');
      setUnit('Metric Tonne');
    } else if (newCat === 'ME_TRADE') {
      setBenchmarkSeriesId('SINGSTAT-IPI-DIV74-PUMPS');
      setUnit('Package');
    } else if (newCat === 'MAINTENANCE') {
      setBenchmarkSeriesId('SINGSTAT-ULC-CONST');
      setUnit('Annual Contract');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let customWeights = itemToEdit?.customCompositeWeights;
    if (category === 'ME_TRADE' && (!customWeights || customWeights.length === 0)) {
      const tmpl = ME_TRADE_TEMPLATES[selectedTradeTemplate] || ME_TRADE_TEMPLATES['ACMV'];
      customWeights = [
        {
          componentName: 'Major Plant Equipment',
          seriesId: tmpl.recommendedSeries.equipmentSeriesId,
          weightPercent: tmpl.defaultWeights.equipment,
          description: 'Equipment component'
        },
        {
          componentName: 'Materials & Piping',
          seriesId: tmpl.recommendedSeries.materialsSeriesId,
          weightPercent: tmpl.defaultWeights.materials,
          description: 'Materials component'
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
          description: 'T&C labour'
        },
        {
          componentName: 'Overhead & Profit',
          seriesId: 'SINGSTAT-ULC-TOTAL',
          weightPercent: tmpl.defaultWeights.overheadProfit,
          description: 'Corporate overhead (factor 1.0)'
        }
      ];
    }

    const newItem: TenderLineItem = {
      id: itemToEdit?.id || 'TND-' + Date.now(),
      tendererName,
      category,
      itemCode,
      description,
      specification,
      scopeDifferencesFlag: scopeDifferencesFlag.trim() ? scopeDifferencesFlag.trim() : undefined,
      warrantyPeriodMonths: warrantyMonths,
      quantity,
      unit,
      currency,
      exchangeRateToSgd: exchangeRate,
      gstBasis,
      baselinePriceDate: baselineDate,
      baselineUnitPrice,
      baselineTotalPrice: baselineUnitPrice * quantity,
      tenderPriceDate: tenderDate,
      tenderUnitPrice,
      tenderTotalPrice: tenderUnitPrice * quantity,
      benchmarkSeriesId,
      customCompositeWeights: customWeights,
      contractDurationMonths: category === 'MAINTENANCE' ? contractDurationMonths : undefined,
      labourSharePercent: category === 'MAINTENANCE' ? labourSharePercent : undefined,
      technicianHeadcount: category === 'MAINTENANCE' ? technicianHeadcount : undefined,
      serviceFrequency: category === 'MAINTENANCE' ? serviceFrequency : undefined
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {itemToEdit ? 'Edit Tender Line Item' : 'Add New Tender Line Item'}
            </h3>
            <p className="text-xs text-slate-500">
              Confidential procurement data remains in browser memory only
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Procurement Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange('MATERIAL')}
                className={`py-2 px-3 rounded border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  category === 'MATERIAL'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Materials</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('ME_TRADE')}
                className={`py-2 px-3 rounded border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  category === 'ME_TRADE'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>M&amp;E Trade</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('MAINTENANCE')}
                className={`py-2 px-3 rounded border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  category === 'MAINTENANCE'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Maintenance</span>
              </button>
            </div>
          </div>

          {/* Tenderer & Item Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tenderer / Contractor Name *
              </label>
              <input
                type="text"
                required
                value={tendererName}
                onChange={(e) => setTendererName(e.target.value)}
                placeholder="e.g. Shincon Engineering Pte Ltd"
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                BOQ Item Code
              </label>
              <input
                type="text"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Description & Specification */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Item Description *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. High-Tensile Reinforcement Steel Bars (25mm BS4449)"
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Detailed Technical Specification &amp; Standards
              </label>
              <textarea
                rows={2}
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                placeholder="Grade B500B, straight 12m lengths, delivered to Tuas depot"
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Scope &amp; Specification Variance Flag</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional</span>
              </label>
              <input
                type="text"
                value={scopeDifferencesFlag}
                onChange={(e) => setScopeDifferencesFlag(e.target.value)}
                placeholder="e.g. Includes offloading craneage +SGD 20/t; Extended 5-year warranty"
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Quantity, Unit & Currency */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Unit</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Metric Tonne / m³ / Package"
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-hidden"
              >
                <option value="SGD">SGD (Singapore Dollar)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
                <option value="JPY">JPY (Japanese Yen)</option>
                <option value="MYR">MYR (Malaysian Ringgit)</option>
                <option value="CNY">CNY (Chinese Yuan)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">FX Rate to SGD</label>
              <input
                type="number"
                step="any"
                disabled={currency === 'SGD'}
                value={exchangeRate}
                onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1.0)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 font-mono disabled:opacity-50 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            {/* Baseline */}
            <div className="space-y-2">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Comparable Baseline
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-0.5">Baseline Period (e.g. 2021M01 / 2021Q1)</label>
                <input
                  type="text"
                  required
                  value={baselineDate}
                  onChange={(e) => setBaselineDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-0.5">Baseline Unit Price ({currency})</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={baselineUnitPrice}
                  onChange={(e) => setBaselineUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 font-mono font-bold"
                />
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Total Baseline: SGD {(baselineUnitPrice * quantity * exchangeRate).toLocaleString()}
              </div>
            </div>

            {/* Current Tender */}
            <div className="space-y-2">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Current Tender Submission
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-0.5">Tender Price Period (e.g. 2024M06 / 2024Q2)</label>
                <input
                  type="text"
                  required
                  value={tenderDate}
                  onChange={(e) => setTenderDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-0.5">Tender Unit Price ({currency})</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={tenderUnitPrice}
                  onChange={(e) => setTenderUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 font-mono font-bold"
                />
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Total Tender: SGD {(tenderUnitPrice * quantity * exchangeRate).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Benchmark Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Primary Official Benchmark Series
            </label>
            <select
              value={benchmarkSeriesId}
              onChange={(e) => setBenchmarkSeriesId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden"
            >
              {catalogue.map(cat => (
                <option key={cat.id} value={cat.id}>
                  [{cat.publisher.split(' ')[0]}] {cat.title} ({cat.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Maintenance Specific Options */}
          {category === 'MAINTENANCE' && (
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-2 text-xs">
              <div className="font-bold text-amber-900 text-[11px] uppercase">
                Maintenance Contract Parameters
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-700 mb-0.5">Contract Duration (Months)</label>
                  <input
                    type="number"
                    value={contractDurationMonths}
                    onChange={(e) => setContractDurationMonths(parseInt(e.target.value, 10) || 12)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-700 mb-0.5">Labour Share (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={labourSharePercent}
                    onChange={(e) => setLabourSharePercent(parseInt(e.target.value, 10) || 70)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{itemToEdit ? 'Save Changes' : 'Add Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
