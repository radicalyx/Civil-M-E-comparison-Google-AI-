import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, Check, Edit3, HelpCircle } from 'lucide-react';

interface ContractPeriodInputProps {
  label: string;
  sublabel?: string;
  period: string; // e.g. "2021M01", "2020Q1", "2024M06"
  onChangePeriod: (newPeriod: string) => void;
  durationMonths?: number;
  onChangeDuration?: (months: number) => void;
  showDuration?: boolean;
  isTender?: boolean;
  variant?: 'compact' | 'standard';
}

const COMMON_MONTHS = [
  { value: '01', label: 'Jan (Month 01)' },
  { value: '02', label: 'Feb (Month 02)' },
  { value: '03', label: 'Mar (Month 03)' },
  { value: '04', label: 'Apr (Month 04)' },
  { value: '05', label: 'May (Month 05)' },
  { value: '06', label: 'Jun (Month 06)' },
  { value: '07', label: 'Jul (Month 07)' },
  { value: '08', label: 'Aug (Month 08)' },
  { value: '09', label: 'Sep (Month 09)' },
  { value: '10', label: 'Oct (Month 10)' },
  { value: '11', label: 'Nov (Month 11)' },
  { value: '12', label: 'Dec (Month 12)' }
];

const COMMON_YEARS = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];

export const ContractPeriodInput: React.FC<ContractPeriodInputProps> = ({
  label,
  sublabel,
  period,
  onChangePeriod,
  durationMonths = 12,
  onChangeDuration,
  showDuration = false,
  isTender = false,
  variant = 'standard'
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [rawText, setRawText] = useState(period);

  // Parse current period into Year and Month/Quarter
  const isQuarterly = period.includes('Q');
  const yearMatch = period.match(/\b(20\d{2})\b/);
  const currentYear = yearMatch ? yearMatch[1] : '2021';

  let currentMonth = '01';
  if (period.includes('M')) {
    const mMatch = period.match(/M(\d{2})/);
    if (mMatch) currentMonth = mMatch[1];
  } else if (period.includes('Q')) {
    const qMatch = period.match(/Q([1-4])/);
    if (qMatch) {
      const q = parseInt(qMatch[1], 10);
      currentMonth = String((q - 1) * 3 + 1).padStart(2, '0');
    }
  }

  // Synchronize rawText if period changes externally
  useEffect(() => {
    setRawText(period);
  }, [period]);

  const handleYearChange = (newYear: string) => {
    if (isQuarterly) {
      const qMatch = period.match(/Q([1-4])/);
      const q = qMatch ? qMatch[1] : '1';
      onChangePeriod(`${newYear}Q${q}`);
    } else {
      onChangePeriod(`${newYear}M${currentMonth}`);
    }
  };

  const handleMonthChange = (newMonth: string) => {
    onChangePeriod(`${currentYear}M${newMonth}`);
  };

  const handleQuarterChange = (newQuarter: string) => {
    onChangePeriod(`${currentYear}Q${newQuarter}`);
  };

  const handleApplyCustomText = () => {
    if (!rawText.trim()) return;
    const clean = rawText.trim().toUpperCase();
    onChangePeriod(clean);
    setIsCustomMode(false);
  };

  // Human friendly display format (e.g. "January 2021")
  const getReadablePeriod = (p: string) => {
    if (p.includes('M')) {
      const parts = p.split('M');
      const y = parts[0];
      const mIdx = parseInt(parts[1], 10) - 1;
      const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${mNames[mIdx] || 'M' + parts[1]} ${y}`;
    }
    if (p.includes('Q')) {
      return `${p} (Quarterly series)`;
    }
    return p;
  };

  // Calculate contract end period based on duration
  const getContractWindowText = () => {
    if (!showDuration || !durationMonths) return null;
    const readableStart = getReadablePeriod(period);
    const years = durationMonths >= 12 ? `${(durationMonths / 12).toFixed(durationMonths % 12 === 0 ? 0 : 1)} yr` : '';
    return `${readableStart} (${durationMonths} mos / ${years || durationMonths + ' months'} contract term)`;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <label className="font-bold text-slate-800 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{label}</span>
        </label>

        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {period}
          </span>
          <button
            type="button"
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
          >
            {isCustomMode ? 'Easy Pick' : 'Edit Code'}
          </button>
        </div>
      </div>

      {sublabel && (
        <div className="text-[10px] text-slate-500">
          {sublabel}
        </div>
      )}

      {isCustomMode ? (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="e.g. 2021M01 or 2021Q1"
            className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold"
          />
          <button
            type="button"
            onClick={handleApplyCustomText}
            className="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded hover:bg-slate-800 cursor-pointer"
          >
            Apply
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {/* Year selector */}
          <div>
            <select
              value={currentYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
            >
              {COMMON_YEARS.map(yr => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Month or Quarter selector */}
          <div>
            {isQuarterly ? (
              <select
                value={period.includes('Q') ? period.split('Q')[1] : '1'}
                onChange={(e) => handleQuarterChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              >
                <option value="1">Quarter 1 (Jan-Mar)</option>
                <option value="2">Quarter 2 (Apr-Jun)</option>
                <option value="3">Quarter 3 (Jul-Sep)</option>
                <option value="4">Quarter 4 (Oct-Dec)</option>
              </select>
            ) : (
              <select
                value={currentMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              >
                {COMMON_MONTHS.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Contract Duration Option (for previous contracts or maintenance) */}
      {showDuration && onChangeDuration && (
        <div className="pt-1.5 border-t border-slate-200/60 mt-1.5 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Contract Duration:</span>
            </span>
            <span className="font-mono font-bold text-slate-800">
              {durationMonths} Months {durationMonths >= 12 ? `(${(durationMonths / 12).toFixed(durationMonths % 12 === 0 ? 0 : 1)} yrs)` : ''}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {[12, 24, 36, 60].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => onChangeDuration(m)}
                className={`py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                  durationMonths === m
                    ? 'bg-indigo-600 text-white border-indigo-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {m === 12 ? '1 Year' : m === 24 ? '2 Years' : m === 36 ? '3 Years' : '5 Years'}
              </button>
            ))}
          </div>

          {getContractWindowText() && (
            <div className="text-[10px] text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-200 font-medium">
              {getContractWindowText()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
