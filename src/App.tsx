/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Wrench,
  Clock,
  BookOpen,
  Plus
} from 'lucide-react';
import {
  CatalogueSeries,
  CompositeWeightItem,
  DataObservation,
  FXRate,
  HealthStatus,
  TenderLineItem
} from './types/index.ts';
import { CATALOGUE_SERIES } from './server/catalogueData.ts';
import { HISTORICAL_OBSERVATIONS } from './server/historicalData.ts';
import { VERIFIED_MAS_FX_RATES } from './server/fxData.ts';
import { SAMPLE_TENDER_ITEMS } from './utils/sampleData.ts';
import { calculateItemBenchmark } from './utils/calculations.ts';

import { Navbar } from './components/Navbar.tsx';
import { MaterialsView } from './components/MaterialsView.tsx';
import { MeSupplyInstallView } from './components/MeSupplyInstallView.tsx';
import { MaintenanceView } from './components/MaintenanceView.tsx';
import { BenchmarkMappingTable } from './components/BenchmarkMappingTable.tsx';
import { CalculationTraceModal } from './components/CalculationTraceModal.tsx';
import { TenderItemModal } from './components/TenderItemModal.tsx';
import { HealthModal } from './components/HealthModal.tsx';
import { AcceptanceTestRunnerModal } from './components/AcceptanceTestRunnerModal.tsx';

export default function App() {
  // State: Default tab is Civil Materials (Separated Procurement Services)
  const [activeTab, setActiveTab] = useState<string>('CIVIL_MATERIALS');
  const [items, setItems] = useState<TenderLineItem[]>(SAMPLE_TENDER_ITEMS);
  const [catalogue, setCatalogue] = useState<CatalogueSeries[]>(CATALOGUE_SERIES);
  const [observationsMap, setObservationsMap] = useState<Record<string, DataObservation[]>>(HISTORICAL_OBSERVATIONS);
  const [fxRates, setFxRates] = useState<Record<string, FXRate>>(VERIFIED_MAS_FX_RATES);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  // Modals
  const [traceItem, setTraceItem] = useState<{ item: TenderLineItem; result: any } | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<TenderLineItem | null>(null);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);

  // Fetch verified backend datasets
  const fetchBackendData = async () => {
    try {
      const catRes = await fetch('/api/catalogue');
      if (catRes.ok) {
        const catJson = await catRes.json();
        if (catJson.series && catJson.series.length > 0) {
          setCatalogue(catJson.series);
        }
      }

      const fxRes = await fetch('/api/fx');
      if (fxRes.ok) {
        const fxJson = await fxRes.json();
        if (fxJson.rates) {
          setFxRates(fxJson.rates);
        }
      }

      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        const healthJson = await healthRes.json();
        setHealth(healthJson);
      }
    } catch (err) {
      console.warn('Backend API loaded from local bundle fallback', err);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  // Compute Line Item Benchmarks
  const itemResults = useMemo(() => {
    return items.map(item => calculateItemBenchmark(item, catalogue, observationsMap));
  }, [items, catalogue, observationsMap]);

  // Handlers
  const handleSaveItem = (item: TenderLineItem) => {
    if (itemToEdit) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [item, ...prev]);
    }
    setItemToEdit(null);
  };

  const handleAddItem = (item: TenderLineItem) => {
    setItems(prev => [item, ...prev]);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleUpdateCompositeWeights = (itemId: string, newWeights: CompositeWeightItem[]) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, customCompositeWeights: newWeights } : i));
  };

  const handleUpdateLabourShare = (itemId: string, newShare: number) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, labourSharePercent: newShare } : i));
  };

  const handleUpdateLabourSeries = (itemId: string, newSeriesId: string) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, overrideBenchmarkSeriesId: newSeriesId } : i));
  };

  const handleRefreshHealth = async () => {
    setIsRefreshingHealth(true);
    await fetchBackendData();
    setIsRefreshingHealth(false);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Navbar with 3 Separated Procurement Services & Reference tab */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        fxRates={fxRates}
        onOpenHealthModal={() => setIsHealthModalOpen(true)}
        onOpenTestRunner={() => setIsTestRunnerOpen(true)}
        onOpenNewItemModal={() => {
          setItemToEdit(null);
          setIsItemModalOpen(true);
        }}
      />

      {/* Main Content Area - Completely Separated Services */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* SERVICE TAB 1: CIVIL & STRUCTURAL MATERIALS */}
        {activeTab === 'CIVIL_MATERIALS' && (
          <MaterialsView
            items={items}
            itemResults={itemResults}
            catalogue={catalogue}
            observationsMap={observationsMap}
            onInspectTrace={(item, result) => setTraceItem({ item, result })}
            onEditItem={(item) => {
              setItemToEdit(item);
              setIsItemModalOpen(true);
            }}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
          />
        )}

        {/* SERVICE TAB 2: M&E SUPPLY & INSTALLATION */}
        {activeTab === 'ME_INSTALLATION' && (
          <MeSupplyInstallView
            items={items}
            itemResults={itemResults}
            catalogue={catalogue}
            observationsMap={observationsMap}
            onInspectTrace={(item, result) => setTraceItem({ item, result })}
            onEditItem={(item) => {
              setItemToEdit(item);
              setIsItemModalOpen(true);
            }}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            onUpdateWeights={handleUpdateCompositeWeights}
          />
        )}

        {/* SERVICE TAB 3: NON-COMPREHENSIVE MAINTENANCE */}
        {activeTab === 'MAINTENANCE' && (
          <MaintenanceView
            items={items}
            itemResults={itemResults}
            catalogue={catalogue}
            observationsMap={observationsMap}
            onInspectTrace={(item, result) => setTraceItem({ item, result })}
            onEditItem={(item) => {
              setItemToEdit(item);
              setIsItemModalOpen(true);
            }}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            onUpdateLabourShare={handleUpdateLabourShare}
            onUpdateLabourSeries={handleUpdateLabourSeries}
          />
        )}

        {/* SERVICE TAB 4: OFFICIAL PRICE INDICES & SOURCES */}
        {activeTab === 'BENCHMARKS' && (
          <BenchmarkMappingTable
            catalogue={catalogue}
            observationsMap={observationsMap}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-500 text-xs py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-800">
              Singapore Tender Price Benchmark &amp; Escalation Comparator
            </span>
            <span className="text-slate-400 mx-2">·</span>
            <span>SingStat, BCA &amp; MOM Public Series</span>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Civil, M&amp;E, and Maintenance evaluated independently
          </div>
        </div>
      </footer>

      {/* Modals */}
      {traceItem && (
        <CalculationTraceModal
          item={traceItem.item}
          result={traceItem.result}
          onClose={() => setTraceItem(null)}
        />
      )}

      <TenderItemModal
        itemToEdit={itemToEdit}
        catalogue={catalogue}
        fxRates={fxRates}
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveItem}
      />

      <HealthModal
        health={health}
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        onRefresh={handleRefreshHealth}
        isRefreshing={isRefreshingHealth}
      />

      <AcceptanceTestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />
    </div>
  );
}
