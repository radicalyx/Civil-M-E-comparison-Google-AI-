/**
 * Singapore Tender Price Benchmark & Escalation Comparator
 * Core Type Definitions
 */

export type BenchmarkClassification =
  | 'DIRECT_PUBLISHED'       // Directly relevant published series
  | 'BROADER_PROXY'          // Broader industry proxy
  | 'USER_COMPOSITE'         // User-defined weighted composite
  | 'NO_SUITABLE_BENCHMARK'; // No suitable benchmark available

export type FrequencyType = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface DataObservation {
  period: string; // e.g. "2024M01", "2024Q1", "2024"
  date: string;   // ISO date string e.g. "2024-01-01"
  value: number;  // Numeric index or unit rate in SGD
  isProvisional?: boolean;
}

export interface CatalogueSeries {
  id: string;
  publisher: string; // e.g. "SingStat", "BCA", "MOM", "MAS"
  datasetId: string; // e.g. "M212881", "BCA-TPI-2010", "M183421"
  seriesId: string;
  title: string;
  category: 'CONSTRUCTION_MATERIALS' | 'ME_EQUIPMENT' | 'LABOUR_MAINTENANCE' | 'MACRO_TPI';
  applicableTrades?: string[];
  unit: string; // e.g. "Index (2018=100)", "SGD / Tonne", "Index (2015=100)"
  indexBaseYear?: string;
  sourceLink: string;
  methodologyLink: string;
  coverage: string;
  exclusions: string;
  frequency: FrequencyType;
  latestPeriod: string;
  latestReleaseDate: string;
  retrievalTimestamp: string;
  seasonalAdjustment: 'UNADJUSTED' | 'SEASONALLY_ADJUSTED' | 'NOT_APPLICABLE';
  classification: BenchmarkClassification;
  relevanceRationale: string;
  limitations: string;
  isUnitRateDataset: boolean; // true if absolute SGD (e.g. BCA rebar), false if dimensionless index
  latestValue?: number;
  isUpdatedToCurrentDate?: boolean; // verified actively published and updated to current dates
  currencyStatus?: 'CURRENT' | 'OUTDATED';
  isMcpBenchmark?: boolean; // true if series draws global market clearing prices normalised to SGD
  geographicScope?: 'ASIA' | 'GLOBAL' | 'SINGAPORE'; // Geographic data coverage
  isAsiaRegion?: boolean; // True if data is specifically measured for Asia / SE Asia / East Asia region
  globalSourceBenchmark?: string; // e.g. "S&P Global Platts East Asia CFR", "London Metal Exchange (LME)", "World Bank Pink Sheet"
  globalCurrency?: string; // original currency before normalisation, e.g. "USD"
  usdToSgdFxRate?: number; // exchange rate used for SGD normalisation, e.g. 1.3410
  normalisationFormula?: string; // e.g. "Global Price (USD) * 1.3410 = SGD Price"
}

export interface CompositeWeightItem {
  componentName: string;
  seriesId: string;
  weightPercent: number; // must sum to 100% across all components
  description: string;
}

export interface MeTradeTemplate {
  tradeId: string;
  tradeName: string;
  description: string;
  defaultWeights: {
    equipment: number;
    materials: number;
    labour: number;
    testingCommissioning: number;
    overheadProfit: number;
  };
  recommendedSeries: {
    equipmentSeriesId: string;
    materialsSeriesId: string;
    labourSeriesId: string;
  };
  overheadProfitEscalationFactor: number; // default 1.0 (held fixed)
}

export type GstBasis = 'EXCLUSIVE' | 'INCLUSIVE_9' | 'ZERO_RATED';

export interface TenderLineItem {
  id: string;
  tendererName: string;
  category: 'MATERIAL' | 'ME_TRADE' | 'MAINTENANCE';
  itemCode: string;
  description: string;
  specification: string;
  scopeDifferencesFlag?: string;
  warrantyPeriodMonths?: number;
  quantity: number;
  unit: string;
  currency: string; // e.g. "SGD", "USD", "EUR"
  exchangeRateToSgd: number; // 1 foreign = X SGD
  gstBasis: GstBasis;

  // Baseline / Previous Contract
  baselinePriceDate: string; // e.g. "2021M01", "2021Q1"
  baselineContractDurationMonths?: number; // e.g. 12, 24, 36 months
  baselineContractPeriodLabel?: string;    // e.g. "Jan 2021 – Dec 2022 (24 Months)"
  baselineUnitPrice: number; // in original currency
  baselineTotalPrice: number; // baselineUnitPrice * quantity

  // Current Tender
  tenderPriceDate: string; // e.g. "2024M06", "2026M03"
  tenderContractDurationMonths?: number; // e.g. 12, 24, 36 months
  tenderContractPeriodLabel?: string;    // e.g. "Mar 2026 – Feb 2028 (24 Months)"
  tenderUnitPrice: number; // in original currency
  tenderTotalPrice: number; // tenderUnitPrice * quantity

  // Benchmark Assignment
  benchmarkSeriesId: string; // ID of catalogue series or composite ID
  overrideBenchmarkSeriesId?: string;
  customCompositeWeights?: CompositeWeightItem[];

  // For Maintenance
  contractDurationMonths?: number; // e.g. 12, 24, 36
  labourSharePercent?: number;     // e.g. 70
  nonLabourEscalationFactor?: number; // default 1.0
  technicianHeadcount?: number;
  serviceFrequency?: string;       // e.g. "Monthly comprehensive visits"

  // User notes
  notes?: string;
}

export interface CalculationTrace {
  itemId: string;
  itemDescription: string;
  baselinePeriod: string;
  tenderPeriod: string;
  baselineIndex: number;
  currentIndex: number;
  indexChangePercent: number;
  indexFactor: number;

  baselineCostSgd: number;
  tenderCostSgd: number;
  benchmarkCostSgd: number;

  varianceSgd: number;
  variancePercent: number;
  cagrPercent: number;
  elapsedYears: number;

  // Contract Duration Normalization Details
  baselineDurationMonths?: number;
  tenderDurationMonths?: number;
  durationRatio?: number;
  isDurationAdjusted?: boolean;
  baselineMonthlyRateSgd?: number;
  tenderMonthlyRateSgd?: number;
  benchmarkMonthlyRateSgd?: number;

  // Breakdown for M&E or Maintenance
  breakdownDetails?: {
    labourBaselineSgd?: number;
    labourAdjustedSgd?: number;
    labourIndexFactor?: number;
    nonLabourBaselineSgd?: number;
    nonLabourAdjustedSgd?: number;

    compositeComponents?: {
      name: string;
      weight: number;
      baselineIndex: number;
      currentIndex: number;
      componentFactor: number;
      weightedContribution: number;
    }[];
  };

  formulasUsed: {
    benchmarkFormula: string;
    varianceFormula: string;
    substitutedValues: string;
  };

  // MCP Global Normalisation Details (when SingStat/BCA statistics lack current date prices)
  isMcpBridged?: boolean;
  mcpSourceDetails?: {
    globalSource: string;
    globalCurrency: string;
    fxRateToSgd: number;
    normalisationFormula: string;
    note: string;
  };
}

export interface AggregateComparison {
  totalBaselineSgd: number;
  totalTenderSgd: number;
  totalBenchmarkSgd: number;
  totalVarianceSgd: number;
  overallVariancePercent: number;
  overallTenderChangePercent: number;
  overallIndexChangePercent: number;
  coveredItemCount: number;
  totalItemCount: number;
  benchmarkCoveragePercent: number;
  tenderers: string[];
}

export type NormalisationMode = 'RAW' | 'REBASED_100' | 'PERCENT_CHANGE' | 'YOY_CHANGE' | 'Z_SCORE';

export type NoiseReductionMode = 'NONE' | 'TRAILING_SMA_3' | 'TRAILING_SMA_6' | 'ROLLING_MEDIAN_3' | 'EMA_ALPHA_3' | 'FOUR_QUARTER_TRAIL';

export interface FXRate {
  currency: string;
  rateToSgd: number; // SGD per unit of Foreign Currency (e.g. 1 USD = 1.345 SGD)
  date: string;
  provider: string;
  direction: string; // e.g. "1 USD = 1.3450 SGD"
  isManualOverride?: boolean;
}

export interface HealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'CONFIG_ERROR';
  timestamp: string;
  providers: {
    singstatTableBuilder: {
      available: boolean;
      statusCode?: number;
      statusText: string;
      lastChecked: string;
    };
    bcaData: {
      available: boolean;
      statusCode?: number;
      statusText: string;
      lastChecked: string;
    };
    masExchangeRates: {
      available: boolean;
      statusCode?: number;
      statusText: string;
      lastChecked: string;
    };
  };
  environment: {
    mode: string;
    nodeEnv: string;
  };
}
