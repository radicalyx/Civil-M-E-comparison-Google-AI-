import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, Sparkles, AlertCircle } from 'lucide-react';

interface ContractPeriodInputProps {
  label: string;
  sublabel?: string;
  period: string; // e.g. "2021M01", "2024-06", "2025M01", "2026-03"
  onChangePeriod: (newPeriod: string) => void;
  durationMonths?: number;
  onChangeDuration?: (months: number) => void;
  showDuration?: boolean;
  isTender?: boolean;
  variant?: 'compact' | 'standard';
  placeholder?: string;
}

/**
 * Intelligent Date Normalizer
 * Accepts: "2024-05", "2024-05-15", "2024M05", "2025Q1", "May 2024", "05/2024", "2026-03", etc.
 * Converts to canonical period string: e.g. "2024M05", "2025Q1", or "2026M03"
 */
export function normalizeDateInput(input: string): { period: string; readable: string; isCurrentDate: boolean } {
  const clean = input.trim();
  if (!clean) {
    return { period: '2024M06', readable: 'June 2024', isCurrentDate: false };
  }

  const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths: Record<string, string> = {
    jan: '01', january: '01',
    feb: '02', february: '02',
    mar: '03', march: '03',
    apr: '04', april: '04',
    may: '05',
    jun: '06', june: '06',
    jul: '07', july: '07',
    aug: '08', august: '08',
    sep: '09', september: '09',
    oct: '10', october: '10',
    nov: '11', november: '11',
    dec: '12', december: '12'
  };

  // Case 1: Standard YYYY-MM or YYYY-MM-DD (from date/month picker)
  const isoMatch = clean.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (isoMatch) {
    const yr = isoMatch[1];
    const mo = isoMatch[2].padStart(2, '0');
    const mIdx = Math.max(0, Math.min(11, parseInt(mo, 10) - 1));
    const isCurrentDate = parseInt(yr, 10) >= 2025 || (parseInt(yr, 10) === 2024 && parseInt(mo, 10) > 6);
    return {
      period: `${yr}M${mo}`,
      readable: `${mNames[mIdx]} ${yr}`,
      isCurrentDate
    };
  }

  // Case 2: Standard Period code YYYYMxx (e.g. 2021M01, 2024M06)
  const codeMatch = clean.match(/^(\d{4})M(\d{1,2})$/i);
  if (codeMatch) {
    const yr = codeMatch[1];
    const mo = codeMatch[2].padStart(2, '0');
    const mIdx = Math.max(0, Math.min(11, parseInt(mo, 10) - 1));
    const isCurrentDate = parseInt(yr, 10) >= 2025 || (parseInt(yr, 10) === 2024 && parseInt(mo, 10) > 6);
    return {
      period: `${yr}M${mo}`,
      readable: `${mNames[mIdx]} ${yr}`,
      isCurrentDate
    };
  }

  // Case 3: Quarterly code YYYYQx (e.g. 2022Q3)
  const qMatch = clean.match(/^(\d{4})Q([1-4])$/i);
  if (qMatch) {
    const yr = qMatch[1];
    const q = qMatch[2];
    const isCurrentDate = parseInt(yr, 10) >= 2025 || (parseInt(yr, 10) === 2024 && parseInt(q, 10) >= 3);
    return {
      period: `${yr}Q${q}`,
      readable: `Q${q} ${yr}`,
      isCurrentDate
    };
  }

  // Case 4: Text format like "May 2024" or "January 2025"
  const textMatch = clean.match(/^([a-zA-Z]+)[\s,-]+(\d{4})$/);
  if (textMatch) {
    const mWord = textMatch[1].toLowerCase();
    const yr = textMatch[2];
    if (fullMonths[mWord]) {
      const mo = fullMonths[mWord];
      const mIdx = parseInt(mo, 10) - 1;
      const isCurrentDate = parseInt(yr, 10) >= 2025;
      return {
        period: `${yr}M${mo}`,
        readable: `${mNames[mIdx]} ${yr}`,
        isCurrentDate
      };
    }
  }

  // Case 5: Slash format MM/YYYY or MM/YY
  const slashMatch = clean.match(/^(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const mo = slashMatch[1].padStart(2, '0');
    let yr = slashMatch[2];
    if (yr.length === 2) yr = '20' + yr;
    const mIdx = Math.max(0, Math.min(11, parseInt(mo, 10) - 1));
    const isCurrentDate = parseInt(yr, 10) >= 2025;
    return {
      period: `${yr}M${mo}`,
      readable: `${mNames[mIdx]} ${yr}`,
      isCurrentDate
    };
  }

  // Fallback: extract year if present
  const yOnly = clean.match(/\b(20\d{2})\b/);
  if (yOnly) {
    const yr = yOnly[1];
    return {
      period: `${yr}M06`,
      readable: `Mid-${yr}`,
      isCurrentDate: parseInt(yr, 10) >= 2025
    };
  }

  return { period: clean.toUpperCase(), readable: clean, isCurrentDate: false };
}

/**
 * Convert canonical period "2024M05" to HTML month input value "2024-05"
 */
function periodToMonthInput(period: string): string {
  if (period.includes('M')) {
    const parts = period.split('M');
    return `${parts[0]}-${parts[1].padStart(2, '0')}`;
  }
  if (period.includes('Q')) {
    const parts = period.split('Q');
    const yr = parts[0];
    const q = parseInt(parts[1], 10);
    const m = String((q - 1) * 3 + 1).padStart(2, '0');
    return `${yr}-${m}`;
  }
  const yMatch = period.match(/\b(20\d{2})\b/);
  if (yMatch) return `${yMatch[1]}-06`;
  return '2024-06';
}

export const ContractPeriodInput: React.FC<ContractPeriodInputProps> = ({
  label,
  sublabel,
  period,
  onChangePeriod,
  durationMonths = 12,
  onChangeDuration,
  showDuration = false,
  isTender = false,
  variant = 'standard',
  placeholder = 'e.g. 2024-05, 2025-01, 2026-03'
}) => {
  // Direct text input value
  const [inputText, setInputText] = useState(() => {
    if (period.includes('M')) {
      const parts = period.split('M');
      return `${parts[0]}-${parts[1]}`;
    }
    return period;
  });

  // Keep internal text state synchronized with incoming period prop
  useEffect(() => {
    if (period.includes('M')) {
      const parts = period.split('M');
      setInputText(`${parts[0]}-${parts[1]}`);
    } else {
      setInputText(period);
    }
  }, [period]);

  const parsed = normalizeDateInput(inputText || period);

  const handleTextChange = (val: string) => {
    setInputText(val);
    const norm = normalizeDateInput(val);
    if (val.trim().length >= 4) {
      onChangePeriod(norm.period);
    }
  };

  const handleDirectDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // e.g. "2025-02"
    if (val) {
      setInputText(val);
      const norm = normalizeDateInput(val);
      onChangePeriod(norm.period);
    }
  };

  const handleApplyPreset = (presetVal: string) => {
    setInputText(presetVal);
    const norm = normalizeDateInput(presetVal);
    onChangePeriod(norm.period);
  };

  // Human friendly window for contract
  const getContractWindowText = () => {
    if (!showDuration || !durationMonths) return null;
    const years = durationMonths >= 12 ? `${(durationMonths / 12).toFixed(durationMonths % 12 === 0 ? 0 : 1)} yr` : '';
    return `${parsed.readable} + ${durationMonths} Months duration (${years || durationMonths + ' months'} contract window)`;
  };

  return (
    <div className="space-y-1.5">
      {/* Header Label and Status */}
      <div className="flex items-center justify-between text-[11px]">
        <label className="font-bold text-slate-800 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{label}</span>
        </label>

        {/* Live Parsed Date Badge */}
        <div className="flex items-center gap-1">
          <span className="font-semibold text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {parsed.readable}
          </span>
          {parsed.isCurrentDate && (
            <span className="bg-sky-100 text-sky-800 border border-sky-300 px-1.5 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-0.5" title="Date is beyond official SingStat/BCA publication date. Global MCP benchmark is active.">
              <Sparkles className="w-2.5 h-2.5 text-sky-600" />
              <span>Current Date</span>
            </span>
          )}
        </div>
      </div>

      {sublabel && (
        <div className="text-[10px] text-slate-500">
          {sublabel}
        </div>
      )}

      {/* Primary Direct Date Input (Text & Date Picker) */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-hidden pr-20"
        />

        {/* Native Browser Month/Date Picker Trigger Icon */}
        <div className="absolute right-1 flex items-center gap-1">
          <div className="relative overflow-hidden w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 cursor-pointer border border-slate-200 bg-slate-50" title="Click calendar to select month and year directly">
            <Calendar className="w-3.5 h-3.5 text-slate-600 pointer-events-none" />
            <input
              type="month"
              value={periodToMonthInput(period)}
              onChange={handleDirectDatePick}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Pick date/month"
            />
          </div>
          <span className="text-[9.5px] font-mono text-slate-400 pr-1">
            {parsed.period}
          </span>
        </div>
      </div>

      {/* Instant 1-Click Date Quick-Picks (No dropdowns needed!) */}
      <div className="flex flex-wrap items-center gap-1 pt-0.5">
        <span className="text-[9.5px] text-slate-400 font-medium mr-0.5">Quick fill:</span>
        {isTender ? (
          <>
            <button
              type="button"
              onClick={() => handleApplyPreset('2026-03')}
              className="text-[9.5px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-semibold cursor-pointer transition"
            >
              Current (2026-03)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('2025-06')}
              className="text-[9.5px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-semibold cursor-pointer transition"
            >
              2025-06
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('2024-06')}
              className="text-[9.5px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-semibold cursor-pointer transition"
            >
              2024-06 (SingStat)
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => handleApplyPreset('2023-01')}
              className="text-[9.5px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-semibold cursor-pointer transition"
            >
              2023-01 (1-2 yrs ago)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('2022-01')}
              className="text-[9.5px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-semibold cursor-pointer transition"
            >
              2022-01 (3 yrs ago)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('2021-01')}
              className="text-[9.5px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-semibold cursor-pointer transition"
            >
              2021-01 (Pre-inflation)
            </button>
          </>
        )}
      </div>

      {/* Contract Duration Option (Direct Input + Quick Buttons) */}
      {showDuration && onChangeDuration && (
        <div className="pt-2 border-t border-slate-200/70 mt-2 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-700">
            <span className="flex items-center gap-1 font-semibold">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Contract Duration:</span>
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max="120"
                value={durationMonths}
                onChange={(e) => onChangeDuration(Math.max(1, parseInt(e.target.value, 10) || 12))}
                className="w-14 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-mono font-bold text-xs text-slate-900"
              />
              <span className="text-[10px] text-slate-500 font-medium">Months</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {[12, 24, 36, 60].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => onChangeDuration(m)}
                className={`py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                  durationMonths === m
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {m === 12 ? '1 Year (12m)' : m === 24 ? '2 Years (24m)' : m === 36 ? '3 Years (36m)' : '5 Years (60m)'}
              </button>
            ))}
          </div>

          {getContractWindowText() && (
            <div className="text-[10px] text-indigo-800 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 font-medium">
              {getContractWindowText()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
