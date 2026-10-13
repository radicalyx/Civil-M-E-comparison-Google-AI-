import {
  AggregateComparison,
  CalculationTrace,
  CatalogueSeries,
  CompositeWeightItem,
  DataObservation,
  TenderLineItem
} from '../types/index.ts';

/**
 * Currency conversion helper
 * Formula: SGD amount = foreign currency amount * (SGD per unit of foreign currency)
 */
export function convertToSgd(amount: number, exchangeRateToSgd: number): number {
  if (isNaN(amount) || amount === null || amount === undefined) return 0;
  if (!exchangeRateToSgd || exchangeRateToSgd <= 0) return amount;
  return Number((amount * exchangeRateToSgd).toFixed(2));
}

/**
 * Safely parse observation date / period to approximate elapsed years for CAGR
 */
export function calculateElapsedYears(startPeriod: string, endPeriod: string): number {
  const parseYearPeriod = (str: string): number => {
    if (!str) return 2024;
    const yearMatch = str.match(/\b(20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 2024;

    if (str.includes('M')) {
      const mMatch = str.match(/M(\d{2})/);
      const month = mMatch ? parseInt(mMatch[1], 10) : 6;
      return year + (month - 1) / 12;
    } else if (str.includes('Q')) {
      const qMatch = str.match(/Q(\d)/);
      const quarter = qMatch ? parseInt(qMatch[1], 10) : 2;
      return year + (quarter - 1) / 4;
    }
    return year;
  };

  const startVal = parseYearPeriod(startPeriod);
  const endVal = parseYearPeriod(endPeriod);
  const diff = endVal - startVal;
  return diff > 0.05 ? diff : 1.0; // Avoid division by near-zero
}

/**
 * Find the closest observation value for a given series and period code
 */
export function lookupIndexValue(
  observations: DataObservation[] | undefined,
  targetPeriod: string
): { value: number; actualPeriod: string; isExact: boolean } | null {
  if (!observations || observations.length === 0) return null;

  // Exact period match
  const exact = observations.find(o => o.period.toUpperCase() === targetPeriod.toUpperCase());
  if (exact) {
    return { value: exact.value, actualPeriod: exact.period, isExact: true };
  }

  // Fallback match by Year or closest period
  const yearMatch = targetPeriod.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    const yr = yearMatch[1];
    const candidate = observations.find(o => o.period.includes(yr));
    if (candidate) {
      return { value: candidate.value, actualPeriod: candidate.period, isExact: false };
    }
  }

  // Return last available
  const latest = observations[observations.length - 1];
  return { value: latest.value, actualPeriod: latest.period, isExact: false };
}

/**
 * Core calculation for a single tender line item
 */
export function calculateItemBenchmark(
  item: TenderLineItem,
  catalogue: CatalogueSeries[],
  seriesObservationsMap: Record<string, DataObservation[]>
): {
  benchmarkCostSgd: number;
  baselineCostSgd: number;
  tenderCostSgd: number;
  varianceSgd: number;
  variancePercent: number;
  tenderChangePercent: number;
  indexChangePercent: number;
  escalationDifferencePp: number;
  trace: CalculationTrace;
  hasValidBenchmark: boolean;
  benchmarkWarning?: string;
} {
  // Convert currency to SGD
  const fxRate = item.exchangeRateToSgd > 0 ? item.exchangeRateToSgd : 1.0;
  const baselineCostSgd = convertToSgd(item.baselineTotalPrice, fxRate);
  const tenderCostSgd = convertToSgd(item.tenderTotalPrice, fxRate);

  const seriesId = item.overrideBenchmarkSeriesId || item.benchmarkSeriesId;
  const seriesMeta = catalogue.find(s => s.id === seriesId);

  // Check if this item uses a composite
  if (item.category === 'ME_TRADE' && item.customCompositeWeights && item.customCompositeWeights.length > 0) {
    return calculateCompositeMeItem(item, baselineCostSgd, tenderCostSgd, seriesObservationsMap);
  }

  // Check if this is a maintenance contract
  if (item.category === 'MAINTENANCE') {
    return calculateMaintenanceItem(item, baselineCostSgd, tenderCostSgd, seriesObservationsMap);
  }

  // Standard Material / Single Series Benchmark
  const observations = seriesObservationsMap[seriesId];
  const baselineLookup = lookupIndexValue(observations, item.baselinePriceDate);
  const tenderLookup = lookupIndexValue(observations, item.tenderPriceDate);

  if (!baselineLookup || !tenderLookup || baselineLookup.value <= 0) {
    return {
      benchmarkCostSgd: baselineCostSgd,
      baselineCostSgd,
      tenderCostSgd,
      varianceSgd: tenderCostSgd - baselineCostSgd,
      variancePercent: baselineCostSgd > 0 ? ((tenderCostSgd / baselineCostSgd) - 1) * 100 : 0,
      tenderChangePercent: baselineCostSgd > 0 ? ((tenderCostSgd / baselineCostSgd) - 1) * 100 : 0,
      indexChangePercent: 0,
      escalationDifferencePp: 0,
      hasValidBenchmark: false,
      benchmarkWarning: `No published index observations found for ${seriesId}. Displaying unadjusted baseline.`,
      trace: {
        itemId: item.id,
        itemDescription: item.description,
        baselinePeriod: item.baselinePriceDate,
        tenderPeriod: item.tenderPriceDate,
        baselineIndex: 0,
        currentIndex: 0,
        indexChangePercent: 0,
        indexFactor: 1.0,
        baselineCostSgd,
        tenderCostSgd,
        benchmarkCostSgd: baselineCostSgd,
        varianceSgd: tenderCostSgd - baselineCostSgd,
        variancePercent: baselineCostSgd > 0 ? ((tenderCostSgd / baselineCostSgd) - 1) * 100 : 0,
        cagrPercent: 0,
        elapsedYears: 1,
        formulasUsed: {
          benchmarkFormula: 'Unadjusted = Baseline Price SGD',
          varianceFormula: 'Variance SGD = Tender SGD - Benchmark SGD',
          substitutedValues: `Benchmark = SGD ${baselineCostSgd.toLocaleString()}`
        }
      }
    };
  }

  const baselineIndex = baselineLookup.value;
  const currentIndex = tenderLookup.value;
  const indexFactor = currentIndex / baselineIndex;
  const indexChangePercent = (indexFactor - 1) * 100;

  const benchmarkCostSgd = Number((baselineCostSgd * indexFactor).toFixed(2));
  const varianceSgd = Number((tenderCostSgd - benchmarkCostSgd).toFixed(2));
  const variancePercent = benchmarkCostSgd > 0 ? Number((((tenderCostSgd / benchmarkCostSgd) - 1) * 100).toFixed(2)) : 0;
  const tenderChangePercent = baselineCostSgd > 0 ? Number((((tenderCostSgd / baselineCostSgd) - 1) * 100).toFixed(2)) : 0;
  const escalationDifferencePp = Number((tenderChangePercent - indexChangePercent).toFixed(2));

  const elapsedYears = calculateElapsedYears(item.baselinePriceDate, item.tenderPriceDate);
  const cagrPercent = (baselineCostSgd > 0 && tenderCostSgd > 0 && elapsedYears > 0)
    ? Number(((Math.pow(tenderCostSgd / baselineCostSgd, 1 / elapsedYears) - 1) * 100).toFixed(2))
    : 0;

  let warning: string | undefined;
  if (!baselineLookup.isExact || !tenderLookup.isExact) {
    warning = `Index aligned to nearest period: Baseline uses ${baselineLookup.actualPeriod}; Tender uses ${tenderLookup.actualPeriod}.`;
  }
  if (seriesMeta?.classification === 'BROADER_PROXY') {
    warning = (warning ? `${warning} | ` : '') + `Note: Series "${seriesMeta.title}" is a broader proxy. Flagged for scope & specification variance.`;
  }

  return {
    benchmarkCostSgd,
    baselineCostSgd,
    tenderCostSgd,
    varianceSgd,
    variancePercent,
    tenderChangePercent,
    indexChangePercent,
    escalationDifferencePp,
    hasValidBenchmark: true,
    benchmarkWarning: warning,
    trace: {
      itemId: item.id,
      itemDescription: item.description,
      baselinePeriod: baselineLookup.actualPeriod,
      tenderPeriod: tenderLookup.actualPeriod,
      baselineIndex,
      currentIndex,
      indexChangePercent,
      indexFactor,
      baselineCostSgd,
      tenderCostSgd,
      benchmarkCostSgd,
      varianceSgd,
      variancePercent,
      cagrPercent,
      elapsedYears,
      formulasUsed: {
        benchmarkFormula: 'Index-Adjusted Benchmark = Baseline Cost SGD × (Current Index / Baseline Index)',
        varianceFormula: 'Variance SGD = Tender Cost SGD - Benchmark Cost SGD; Variance % = (Tender / Benchmark - 1) × 100',
        substitutedValues: `Benchmark = SGD ${baselineCostSgd.toLocaleString()} × (${currentIndex} / ${baselineIndex}) = SGD ${benchmarkCostSgd.toLocaleString()}`
      }
    }
  };
}

/**
 * M&E Supply & Installation calculation using Weighted Composite formula
 * Composite factor = Σ [baseline cost weight × (current component index / baseline component index)]
 * Overhead/profit escalation treated separately (fixed factor of 1.0 where no escalation assumption is supplied)
 */
function calculateCompositeMeItem(
  item: TenderLineItem,
  baselineCostSgd: number,
  tenderCostSgd: number,
  seriesObservationsMap: Record<string, DataObservation[]>
): any {
  const weights = item.customCompositeWeights || [];
  const totalWeight = weights.reduce((sum, w) => sum + w.weightPercent, 0);

  // Validate weight sum
  const isWeightValid = Math.abs(totalWeight - 100) < 0.1;
  const breakdownComponents: any[] = [];
  let compositeFactor = 0;

  for (const comp of weights) {
    const obs = seriesObservationsMap[comp.seriesId];
    const bLookup = lookupIndexValue(obs, item.baselinePriceDate);
    const cLookup = lookupIndexValue(obs, item.tenderPriceDate);

    const bVal = bLookup ? bLookup.value : 100;
    const cVal = cLookup ? cLookup.value : 100;
    const compFactor = bVal > 0 ? cVal / bVal : 1.0;
    const normalizedWeight = comp.weightPercent / 100;
    const weightedContribution = normalizedWeight * compFactor;

    compositeFactor += weightedContribution;

    breakdownComponents.push({
      name: comp.componentName,
      weight: comp.weightPercent,
      baselineIndex: bVal,
      currentIndex: cVal,
      componentFactor: Number(compFactor.toFixed(4)),
      weightedContribution: Number(weightedContribution.toFixed(4))
    });
  }

  // If weights don't sum to 100, normalize safely
  if (!isWeightValid && totalWeight > 0) {
    compositeFactor = compositeFactor / (totalWeight / 100);
  } else if (weights.length === 0) {
    compositeFactor = 1.0;
  }

  const benchmarkCostSgd = Number((baselineCostSgd * compositeFactor).toFixed(2));
  const varianceSgd = Number((tenderCostSgd - benchmarkCostSgd).toFixed(2));
  const variancePercent = benchmarkCostSgd > 0 ? Number((((tenderCostSgd / benchmarkCostSgd) - 1) * 100).toFixed(2)) : 0;
  const tenderChangePercent = baselineCostSgd > 0 ? Number((((tenderCostSgd / baselineCostSgd) - 1) * 100).toFixed(2)) : 0;
  const indexChangePercent = Number(((compositeFactor - 1) * 100).toFixed(2));
  const escalationDifferencePp = Number((tenderChangePercent - indexChangePercent).toFixed(2));

  const elapsedYears = calculateElapsedYears(item.baselinePriceDate, item.tenderPriceDate);
  const cagrPercent = (baselineCostSgd > 0 && tenderCostSgd > 0 && elapsedYears > 0)
    ? Number(((Math.pow(tenderCostSgd / baselineCostSgd, 1 / elapsedYears) - 1) * 100).toFixed(2))
    : 0;

  return {
    benchmarkCostSgd,
    baselineCostSgd,
    tenderCostSgd,
    varianceSgd,
    variancePercent,
    tenderChangePercent,
    indexChangePercent,
    escalationDifferencePp,
    hasValidBenchmark: true,
    benchmarkWarning: !isWeightValid ? `Composite weights total ${totalWeight}% (Normalized to 100%).` : undefined,
    trace: {
      itemId: item.id,
      itemDescription: item.description,
      baselinePeriod: item.baselinePriceDate,
      tenderPeriod: item.tenderPriceDate,
      baselineIndex: 100,
      currentIndex: Number((compositeFactor * 100).toFixed(2)),
      indexChangePercent,
      indexFactor: Number(compositeFactor.toFixed(4)),
      baselineCostSgd,
      tenderCostSgd,
      benchmarkCostSgd,
      varianceSgd,
      variancePercent,
      cagrPercent,
      elapsedYears,
      breakdownDetails: {
        compositeComponents: breakdownComponents
      },
      formulasUsed: {
        benchmarkFormula: 'Composite Benchmark = Baseline Cost SGD × Σ [Component Weight × (Current Index / Baseline Index)]',
        varianceFormula: 'Variance SGD = Tender Cost SGD - Composite Benchmark SGD',
        substitutedValues: `Composite Factor = ${compositeFactor.toFixed(4)}; Benchmark = SGD ${baselineCostSgd.toLocaleString()} × ${compositeFactor.toFixed(4)} = SGD ${benchmarkCostSgd.toLocaleString()}`
      }
    }
  };
}

/**
 * Non-Comprehensive Maintenance contract calculation:
 * Baseline labour = Baseline contract value × labour share
 * Adjusted labour = Baseline labour × labour index factor
 * Non-labour component held unchanged (factor 1.0) or escalated separately
 * Adjusted Benchmark = Adjusted labour + Adjusted non-labour
 */
function calculateMaintenanceItem(
  item: TenderLineItem,
  baselineCostSgd: number,
  tenderCostSgd: number,
  seriesObservationsMap: Record<string, DataObservation[]>
): any {
  // Labour share percent (default 70% if unstated)
  const labourShare = (item.labourSharePercent !== undefined && item.labourSharePercent >= 0)
    ? item.labourSharePercent / 100
    : 0.70;
  const nonLabourShare = 1 - labourShare;

  const nonLabourFactor = item.nonLabourEscalationFactor !== undefined ? item.nonLabourEscalationFactor : 1.0;

  const baselineLabourSgd = Number((baselineCostSgd * labourShare).toFixed(2));
  const baselineNonLabourSgd = Number((baselineCostSgd * nonLabourShare).toFixed(2));

  // Labour index series (default: SingStat Construction ULC or MOM Tech Wage)
  const labourSeriesId = item.overrideBenchmarkSeriesId || item.benchmarkSeriesId || 'SINGSTAT-ULC-CONST';
  const obs = seriesObservationsMap[labourSeriesId];
  const bLookup = lookupIndexValue(obs, item.baselinePriceDate);
  const cLookup = lookupIndexValue(obs, item.tenderPriceDate);

  const bVal = bLookup ? bLookup.value : 100;
  const cVal = cLookup ? cLookup.value : 100;
  const labourIndexFactor = bVal > 0 ? cVal / bVal : 1.0;

  const adjustedLabourSgd = Number((baselineLabourSgd * labourIndexFactor).toFixed(2));
  const adjustedNonLabourSgd = Number((baselineNonLabourSgd * nonLabourFactor).toFixed(2));

  const benchmarkCostSgd = Number((adjustedLabourSgd + adjustedNonLabourSgd).toFixed(2));
  const varianceSgd = Number((tenderCostSgd - benchmarkCostSgd).toFixed(2));
  const variancePercent = benchmarkCostSgd > 0 ? Number((((tenderCostSgd / benchmarkCostSgd) - 1) * 100).toFixed(2)) : 0;
  const tenderChangePercent = baselineCostSgd > 0 ? Number((((tenderCostSgd / baselineCostSgd) - 1) * 100).toFixed(2)) : 0;

  const effectiveContractIndexFactor = baselineCostSgd > 0 ? benchmarkCostSgd / baselineCostSgd : 1.0;
  const indexChangePercent = Number(((effectiveContractIndexFactor - 1) * 100).toFixed(2));
  const escalationDifferencePp = Number((tenderChangePercent - indexChangePercent).toFixed(2));

  const elapsedYears = calculateElapsedYears(item.baselinePriceDate, item.tenderPriceDate);
  const cagrPercent = (baselineCostSgd > 0 && tenderCostSgd > 0 && elapsedYears > 0)
    ? Number(((Math.pow(tenderCostSgd / baselineCostSgd, 1 / elapsedYears) - 1) * 100).toFixed(2))
    : 0;

  return {
    benchmarkCostSgd,
    baselineCostSgd,
    tenderCostSgd,
    varianceSgd,
    variancePercent,
    tenderChangePercent,
    indexChangePercent,
    escalationDifferencePp,
    hasValidBenchmark: true,
    benchmarkWarning: `Labour share: ${(labourShare * 100).toFixed(0)}% (escalated via ${labourSeriesId}); Non-labour: ${(nonLabourShare * 100).toFixed(0)}% (held fixed at factor ${nonLabourFactor}).`,
    trace: {
      itemId: item.id,
      itemDescription: item.description,
      baselinePeriod: bLookup ? bLookup.actualPeriod : item.baselinePriceDate,
      tenderPeriod: cLookup ? cLookup.actualPeriod : item.tenderPriceDate,
      baselineIndex: bVal,
      currentIndex: cVal,
      indexChangePercent: Number(((labourIndexFactor - 1) * 100).toFixed(2)),
      indexFactor: Number(effectiveContractIndexFactor.toFixed(4)),
      baselineCostSgd,
      tenderCostSgd,
      benchmarkCostSgd,
      varianceSgd,
      variancePercent,
      cagrPercent,
      elapsedYears,
      breakdownDetails: {
        labourBaselineSgd: baselineLabourSgd,
        labourAdjustedSgd: adjustedLabourSgd,
        labourIndexFactor: Number(labourIndexFactor.toFixed(4)),
        nonLabourBaselineSgd: baselineNonLabourSgd,
        nonLabourAdjustedSgd: adjustedNonLabourSgd
      },
      formulasUsed: {
        benchmarkFormula: 'Benchmark = (Baseline × Labour Share × Labour Index Factor) + (Baseline × Non-Labour Share × Non-Labour Factor)',
        varianceFormula: 'Variance SGD = Tender Cost SGD - Maintenance Benchmark SGD',
        substitutedValues: `Labour: SGD ${baselineLabourSgd.toLocaleString()} × ${labourIndexFactor.toFixed(4)} = SGD ${adjustedLabourSgd.toLocaleString()} + Non-Labour: SGD ${adjustedNonLabourSgd.toLocaleString()} = Total Benchmark SGD ${benchmarkCostSgd.toLocaleString()}`
      }
    }
  };
}

/**
 * Aggregate summary across all items
 * CRITICAL: Aggregate variance is calculated from aggregate comparable costs, NOT unweighted average of percentages.
 */
export function calculateAggregateSummary(
  items: TenderLineItem[],
  itemResults: ReturnType<typeof calculateItemBenchmark>[]
): AggregateComparison {
  let totalBaselineSgd = 0;
  let totalTenderSgd = 0;
  let totalBenchmarkSgd = 0;
  let coveredItemCount = 0;
  const tendererSet = new Set<string>();

  items.forEach((item, idx) => {
    const res = itemResults[idx];
    tendererSet.add(item.tendererName);

    totalBaselineSgd += res.baselineCostSgd;
    totalTenderSgd += res.tenderCostSgd;
    totalBenchmarkSgd += res.benchmarkCostSgd;

    if (res.hasValidBenchmark) {
      coveredItemCount++;
    }
  });

  const totalVarianceSgd = Number((totalTenderSgd - totalBenchmarkSgd).toFixed(2));
  const overallVariancePercent = totalBenchmarkSgd > 0
    ? Number((((totalTenderSgd / totalBenchmarkSgd) - 1) * 100).toFixed(2))
    : 0;

  const overallTenderChangePercent = totalBaselineSgd > 0
    ? Number((((totalTenderSgd / totalBaselineSgd) - 1) * 100).toFixed(2))
    : 0;

  const overallIndexChangePercent = totalBaselineSgd > 0
    ? Number((((totalBenchmarkSgd / totalBaselineSgd) - 1) * 100).toFixed(2))
    : 0;

  const totalItemCount = items.length;
  const benchmarkCoveragePercent = totalItemCount > 0
    ? Number(((coveredItemCount / totalItemCount) * 100).toFixed(1))
    : 0;

  return {
    totalBaselineSgd: Number(totalBaselineSgd.toFixed(2)),
    totalTenderSgd: Number(totalTenderSgd.toFixed(2)),
    totalBenchmarkSgd: Number(totalBenchmarkSgd.toFixed(2)),
    totalVarianceSgd,
    overallVariancePercent,
    overallTenderChangePercent,
    overallIndexChangePercent,
    coveredItemCount,
    totalItemCount,
    benchmarkCoveragePercent,
    tenderers: Array.from(tendererSet)
  };
}

/**
 * Formula injection protection for CSV export
 * Prefixes cells starting with '=', '+', '-', '@' with a single apostrophe "'"
 */
export function sanitizeCsvField(field: any): string {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
  let clean = str;
  if (dangerousPrefixes.some(prefix => str.startsWith(prefix))) {
    clean = `'${str}`;
  }
  // Escape double quotes
  return `"${clean.replace(/"/g, '""')}"`;
}
