import React from 'react';
import {
  Building2,
  Wrench,
  Clock,
  BookOpen,
  Activity,
  Plus,
  Scale
} from 'lucide-react';
import { FXRate, HealthStatus } from '../types/index.ts';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: HealthStatus | null;
  fxRates: Record<string, FXRate>;
  onOpenHealthModal: () => void;
  onOpenTestRunner: () => void;
  onOpenNewItemModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  health,
  fxRates,
  onOpenHealthModal,
  onOpenTestRunner,
  onOpenNewItemModal
}) => {
  const usdRate = fxRates['USD']?.rateToSgd || 1.345;

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top utility ticker: Government Provenance & MAS FX */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-100 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Singapore Public Indices
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">
            SingStat (DSPI / IPI / ULC) &amp; BCA Monthly Market Prices
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-slate-300">
            <span className="text-slate-400">MAS Exchange Rate:</span>
            <span>1 USD = {usdRate.toFixed(4)} SGD</span>
          </div>

          <button
            onClick={onOpenTestRunner}
            className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 cursor-pointer font-medium"
            title="Verify formulas against Acceptance Test Criteria"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Formula Verification</span>
          </button>

          <button
            onClick={onOpenHealthModal}
            className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer font-medium"
            title="Inspect Data Sources"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{health?.status === 'HEALTHY' ? 'Data Live' : 'Connected'}</span>
          </button>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-amber-400 font-bold text-base shadow-xs">
            SG
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Tender Price Comparator</span>
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-sm">
                Easy Mode
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Check if contractor quotes match official Singapore market price escalation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewItemModal}
            className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded font-medium shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Tender Item</span>
          </button>
        </div>
      </div>

      {/* Service-Specific Separate Tabs (No Combined Mix) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-2 border-t border-slate-100 text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('CIVIL_MATERIALS')}
          className={`py-2.5 px-4 font-semibold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'CIVIL_MATERIALS'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Civil &amp; Structural Materials</span>
        </button>

        <button
          onClick={() => setActiveTab('ME_INSTALLATION')}
          className={`py-2.5 px-4 font-semibold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'ME_INSTALLATION'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>2. M&amp;E Supply &amp; Installation</span>
        </button>

        <button
          onClick={() => setActiveTab('MAINTENANCE')}
          className={`py-2.5 px-4 font-semibold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'MAINTENANCE'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>3. Non-Comprehensive Maintenance</span>
        </button>

        <button
          onClick={() => setActiveTab('BENCHMARKS')}
          className={`py-2.5 px-4 font-semibold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'BENCHMARKS'
              ? 'border-slate-800 text-slate-900 bg-slate-100/60'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>4. Official Price Indices &amp; Sources</span>
        </button>
      </div>
    </header>
  );
};
