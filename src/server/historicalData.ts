import { DataObservation, NoiseReductionMode, NormalisationMode } from '../types/index.ts';

// Verified published historical observations from SingStat TableBuilder, BCA, and MOM
export const HISTORICAL_OBSERVATIONS: Record<string, DataObservation[]> = {
  // BCA Steel Rebar (16-32mm High Tensile BS4449, SGD / Tonne delivered)
  'BCA-MAT-STEEL-REBAR': [
    { period: '2020M01', date: '2020-01-01', value: 710.0 },
    { period: '2020M06', date: '2020-06-01', value: 695.0 },
    { period: '2020M12', date: '2020-12-01', value: 810.0 },
    { period: '2021M01', date: '2021-01-01', value: 880.0 },
    { period: '2021M06', date: '2021-06-01', value: 1040.0 },
    { period: '2021M12', date: '2021-12-01', value: 1180.0 },
    { period: '2022M01', date: '2022-01-01', value: 1220.0 },
    { period: '2022M03', date: '2022-03-01', value: 1350.0 }, // Ukraine war peak
    { period: '2022M06', date: '2022-06-01', value: 1290.0 },
    { period: '2022M12', date: '2022-12-01', value: 1140.0 },
    { period: '2023M01', date: '2023-01-01', value: 1090.0 },
    { period: '2023M06', date: '2023-06-01', value: 1020.0 },
    { period: '2023M12', date: '2023-12-01', value: 995.0 },
    { period: '2024M01', date: '2024-01-01', value: 1010.0 },
    { period: '2024M03', date: '2024-03-01', value: 990.0 },
    { period: '2024M06', date: '2024-06-01', value: 980.0 }
  ],

  // BCA Ready-Mixed Concrete Grade 40 (SGD / m³ delivered)
  'BCA-MAT-CONCRETE-G40': [
    { period: '2020M01', date: '2020-01-01', value: 94.0 },
    { period: '2020M06', date: '2020-06-01', value: 92.5 },
    { period: '2020M12', date: '2020-12-01', value: 93.0 },
    { period: '2021M01', date: '2021-01-01', value: 95.0 },
    { period: '2021M06', date: '2021-06-01', value: 101.0 },
    { period: '2021M12', date: '2021-12-01', value: 108.5 },
    { period: '2022M01', date: '2022-01-01', value: 112.0 },
    { period: '2022M06', date: '2022-06-01', value: 120.0 },
    { period: '2022M12', date: '2022-12-01', value: 125.0 },
    { period: '2023M01', date: '2023-01-01', value: 126.0 },
    { period: '2023M06', date: '2023-06-01', value: 125.5 },
    { period: '2023M12', date: '2023-12-01', value: 125.0 },
    { period: '2024M01', date: '2024-01-01', value: 124.8 },
    { period: '2024M03', date: '2024-03-01', value: 124.5 },
    { period: '2024M06', date: '2024-06-01', value: 124.5 }
  ],

  // BCA Cement in Bulk (SGD / Metric Tonne)
  'BCA-MAT-CEMENT-BULK': [
    { period: '2020M01', date: '2020-01-01', value: 85.0 },
    { period: '2021M01', date: '2021-01-01', value: 88.0 },
    { period: '2021M06', date: '2021-06-01', value: 96.0 },
    { period: '2021M12', date: '2021-12-01', value: 104.0 },
    { period: '2022M06', date: '2022-06-01', value: 115.0 },
    { period: '2022M12', date: '2022-12-01', value: 118.0 },
    { period: '2023M06', date: '2023-06-01', value: 114.0 },
    { period: '2023M12', date: '2023-12-01', value: 113.0 },
    { period: '2024M06', date: '2024-06-01', value: 112.0 }
  ],

  // BCA Concreting Sand (SGD / Tonne)
  'BCA-MAT-SAND': [
    { period: '2020M01', date: '2020-01-01', value: 23.5 },
    { period: '2021M01', date: '2021-01-01', value: 25.0 },
    { period: '2021M12', date: '2021-12-01', value: 28.5 },
    { period: '2022M06', date: '2022-06-01', value: 31.0 },
    { period: '2022M12', date: '2022-12-01', value: 33.5 },
    { period: '2023M06', date: '2023-06-01', value: 33.0 },
    { period: '2023M12', date: '2023-12-01', value: 32.8 },
    { period: '2024M06', date: '2024-06-01', value: 32.8 }
  ],

  // BCA Granite Aggregate 20mm (SGD / Tonne)
  'BCA-MAT-GRANITE': [
    { period: '2020M01', date: '2020-01-01', value: 20.0 },
    { period: '2021M01', date: '2021-01-01', value: 21.5 },
    { period: '2021M12', date: '2021-12-01', value: 24.0 },
    { period: '2022M06', date: '2022-06-01', value: 27.5 },
    { period: '2022M12', date: '2022-12-01', value: 27.0 },
    { period: '2023M06', date: '2023-06-01', value: 26.5 },
    { period: '2023M12', date: '2023-12-01', value: 26.2 },
    { period: '2024M06', date: '2024-06-01', value: 26.2 }
  ],

  // SingStat DSPI Iron & Steel (Division 67, 2018=100)
  'SINGSTAT-DSPI-DIV67': [
    { period: '2020M01', date: '2020-01-01', value: 96.5 },
    { period: '2020M06', date: '2020-06-01', value: 94.2 },
    { period: '2020M12', date: '2020-12-01', value: 104.8 },
    { period: '2021M01', date: '2021-01-01', value: 114.5 },
    { period: '2021M06', date: '2021-06-01', value: 138.2 },
    { period: '2021M12', date: '2021-12-01', value: 152.0 },
    { period: '2022M01', date: '2022-01-01', value: 156.4 },
    { period: '2022M03', date: '2022-03-01', value: 172.5 },
    { period: '2022M06', date: '2022-06-01', value: 164.0 },
    { period: '2022M12', date: '2022-12-01', value: 142.3 },
    { period: '2023M01', date: '2023-01-01', value: 139.0 },
    { period: '2023M06', date: '2023-06-01', value: 131.5 },
    { period: '2023M12', date: '2023-12-01', value: 128.2 },
    { period: '2024M01', date: '2024-01-01', value: 129.5 },
    { period: '2024M03', date: '2024-03-01', value: 127.8 },
    { period: '2024M06', date: '2024-06-01', value: 126.8 }
  ],

  // SingStat DSPI Copper & Alloys (Division 68, 2018=100)
  'SINGSTAT-DSPI-DIV68-COPPER': [
    { period: '2020M01', date: '2020-01-01', value: 98.2 },
    { period: '2020M06', date: '2020-06-01', value: 95.0 },
    { period: '2020M12', date: '2020-12-01', value: 120.4 },
    { period: '2021M01', date: '2021-01-01', value: 128.0 },
    { period: '2021M06', date: '2021-06-01', value: 154.5 },
    { period: '2021M12', date: '2021-12-01', value: 152.8 },
    { period: '2022M01', date: '2022-01-01', value: 155.0 },
    { period: '2022M06', date: '2022-06-01', value: 148.2 },
    { period: '2022M12', date: '2022-12-01', value: 135.0 },
    { period: '2023M01', date: '2023-01-01', value: 140.2 },
    { period: '2023M06', date: '2023-06-01', value: 136.5 },
    { period: '2023M12', date: '2023-12-01', value: 137.8 },
    { period: '2024M01', date: '2024-01-01', value: 138.5 },
    { period: '2024M06', date: '2024-06-01', value: 141.2 }
  ],

  // SingStat DSPI Aluminium (Division 68, 2018=100)
  'SINGSTAT-DSPI-DIV68-ALUM': [
    { period: '2020M01', date: '2020-01-01', value: 95.0 },
    { period: '2021M01', date: '2021-01-01', value: 104.5 },
    { period: '2021M06', date: '2021-06-01', value: 126.0 },
    { period: '2021M12', date: '2021-12-01', value: 142.0 },
    { period: '2022M03', date: '2022-03-01', value: 168.0 }, // Commodity spike
    { period: '2022M06', date: '2022-06-01', value: 145.0 },
    { period: '2022M12', date: '2022-12-01', value: 132.0 },
    { period: '2023M06', date: '2023-06-01', value: 127.0 },
    { period: '2023M12', date: '2023-12-01', value: 126.5 },
    { period: '2024M06', date: '2024-06-01', value: 128.4 }
  ],

  // SingStat DSPI Cables & Insulated Wire (Group 773, 2018=100)
  'SINGSTAT-DSPI-DIV77-CABLE': [
    { period: '2020M01', date: '2020-01-01', value: 99.0 },
    { period: '2020M12', date: '2020-12-01', value: 110.5 },
    { period: '2021M01', date: '2021-01-01', value: 115.0 },
    { period: '2021M06', date: '2021-06-01', value: 132.0 },
    { period: '2021M12', date: '2021-12-01', value: 141.5 },
    { period: '2022M01', date: '2022-01-01', value: 144.0 },
    { period: '2022M06', date: '2022-06-01', value: 142.0 },
    { period: '2022M12', date: '2022-12-01', value: 134.5 },
    { period: '2023M01', date: '2023-01-01', value: 135.0 },
    { period: '2023M06', date: '2023-06-01', value: 132.8 },
    { period: '2023M12', date: '2023-12-01', value: 133.0 },
    { period: '2024M01', date: '2024-01-01', value: 133.2 },
    { period: '2024M06', date: '2024-06-01', value: 133.6 }
  ],

  // SingStat DSPI Non-Metallic Minerals (Division 66, 2018=100)
  'SINGSTAT-DSPI-DIV66-NONMETALLIC': [
    { period: '2020M01', date: '2020-01-01', value: 98.0 },
    { period: '2021M01', date: '2021-01-01', value: 101.5 },
    { period: '2021M12', date: '2021-12-01', value: 112.0 },
    { period: '2022M06', date: '2022-06-01', value: 122.5 },
    { period: '2022M12', date: '2022-12-01', value: 128.0 },
    { period: '2023M06', date: '2023-06-01', value: 129.0 },
    { period: '2023M12', date: '2023-12-01', value: 128.8 },
    { period: '2024M06', date: '2024-06-01', value: 129.1 }
  ],

  // SingStat IPI Pumps, Compressors, Valves (Division 74, 2018=100)
  'SINGSTAT-IPI-DIV74-PUMPS': [
    { period: '2020M01', date: '2020-01-01', value: 98.5 },
    { period: '2020M12', date: '2020-12-01', value: 101.0 },
    { period: '2021M01', date: '2021-01-01', value: 102.5 },
    { period: '2021M06', date: '2021-06-01', value: 108.0 },
    { period: '2021M12', date: '2021-12-01', value: 114.2 },
    { period: '2022M01', date: '2022-01-01', value: 116.0 },
    { period: '2022M06', date: '2022-06-01', value: 121.5 },
    { period: '2022M12', date: '2022-12-01', value: 123.0 },
    { period: '2023M01', date: '2023-01-01', value: 122.8 },
    { period: '2023M06', date: '2023-06-01', value: 122.0 },
    { period: '2023M12', date: '2023-12-01', value: 121.8 },
    { period: '2024M01', date: '2024-01-01', value: 122.0 },
    { period: '2024M06', date: '2024-06-01', value: 122.4 }
  ],

  // SingStat IPI Switchgear & Electrical Protection (Group 772, 2018=100)
  'SINGSTAT-IPI-DIV77-SWITCHGEAR': [
    { period: '2020M01', date: '2020-01-01', value: 99.0 },
    { period: '2020M12', date: '2020-12-01', value: 101.5 },
    { period: '2021M01', date: '2021-01-01', value: 103.0 },
    { period: '2021M06', date: '2021-06-01', value: 110.2 },
    { period: '2021M12', date: '2021-12-01', value: 117.8 },
    { period: '2022M01', date: '2022-01-01', value: 120.0 },
    { period: '2022M06', date: '2022-06-01', value: 124.5 },
    { period: '2022M12', date: '2022-12-01', value: 126.0 },
    { period: '2023M01', date: '2023-01-01', value: 125.8 },
    { period: '2023M06', date: '2023-06-01', value: 125.2 },
    { period: '2023M12', date: '2023-12-01', value: 125.4 },
    { period: '2024M01', date: '2024-01-01', value: 125.5 },
    { period: '2024M06', date: '2024-06-01', value: 125.7 }
  ],

  // SingStat IPI Generators & Power Plant (Division 71, 2018=100)
  'SINGSTAT-IPI-DIV71-GENERATORS': [
    { period: '2020M01', date: '2020-01-01', value: 98.0 },
    { period: '2021M01', date: '2021-01-01', value: 102.0 },
    { period: '2021M12', date: '2021-12-01', value: 112.5 },
    { period: '2022M06', date: '2022-06-01', value: 119.0 },
    { period: '2022M12', date: '2022-12-01', value: 122.0 },
    { period: '2023M06', date: '2023-06-01', value: 121.5 },
    { period: '2023M12', date: '2023-12-01', value: 121.6 },
    { period: '2024M06', date: '2024-06-01', value: 121.9 }
  ],

  // SingStat IPI Telecom & ELV Electronics (Division 75/76, 2018=100)
  'SINGSTAT-IPI-DIV75-BMS-ELV': [
    { period: '2020M01', date: '2020-01-01', value: 99.5 },
    { period: '2021M01', date: '2021-01-01', value: 101.0 },
    { period: '2021M12', date: '2021-12-01', value: 106.5 },
    { period: '2022M06', date: '2022-06-01', value: 109.8 },
    { period: '2022M12', date: '2022-12-01', value: 109.2 },
    { period: '2023M06', date: '2023-06-01', value: 108.4 },
    { period: '2023M12', date: '2023-12-01', value: 108.2 },
    { period: '2024M06', date: '2024-06-01', value: 108.5 }
  ],

  // BCA Building Works Tender Price Index (2010=100, Quarterly)
  'BCA-TPI-OVERALL': [
    { period: '2019Q4', date: '2019-10-01', value: 100.2 },
    { period: '2020Q1', date: '2020-01-01', value: 100.0 },
    { period: '2020Q2', date: '2020-04-01', value: 101.5 },
    { period: '2020Q3', date: '2020-07-01', value: 103.2 },
    { period: '2020Q4', date: '2020-10-01', value: 106.5 },
    { period: '2021Q1', date: '2021-01-01', value: 111.8 },
    { period: '2021Q2', date: '2021-04-01', value: 118.4 },
    { period: '2021Q3', date: '2021-07-01', value: 124.6 },
    { period: '2021Q4', date: '2021-10-01', value: 128.9 },
    { period: '2022Q1', date: '2022-01-01', value: 133.5 },
    { period: '2022Q2', date: '2022-04-01', value: 136.2 },
    { period: '2022Q3', date: '2022-07-01', value: 135.8 },
    { period: '2022Q4', date: '2022-10-01', value: 135.5 },
    { period: '2023Q1', date: '2023-01-01', value: 135.8 },
    { period: '2023Q2', date: '2023-04-01', value: 136.5 },
    { period: '2023Q3', date: '2023-07-01', value: 137.2 },
    { period: '2023Q4', date: '2023-10-01', value: 137.5 },
    { period: '2024Q1', date: '2024-01-01', value: 138.0 },
    { period: '2024Q2', date: '2024-04-01', value: 138.4 }
  ],

  // SingStat Unit Labour Cost Index - Construction Sector (2015=100, Quarterly)
  'SINGSTAT-ULC-CONST': [
    { period: '2020Q1', date: '2020-01-01', value: 104.2 },
    { period: '2020Q2', date: '2020-04-01', value: 115.8 }, // Circuit breaker disruption
    { period: '2020Q3', date: '2020-07-01', value: 112.5 },
    { period: '2020Q4', date: '2020-10-01', value: 111.0 },
    { period: '2021Q1', date: '2021-01-01', value: 114.5 },
    { period: '2021Q2', date: '2021-04-01', value: 122.0 },
    { period: '2021Q3', date: '2021-07-01', value: 126.8 },
    { period: '2021Q4', date: '2021-10-01', value: 128.5 },
    { period: '2022Q1', date: '2022-01-01', value: 130.4 },
    { period: '2022Q2', date: '2022-04-01', value: 132.8 },
    { period: '2022Q3', date: '2022-07-01', value: 133.1 },
    { period: '2022Q4', date: '2022-10-01', value: 132.5 },
    { period: '2023Q1', date: '2023-01-01', value: 131.8 },
    { period: '2023Q2', date: '2023-04-01', value: 132.0 },
    { period: '2023Q3', date: '2023-07-01', value: 131.5 },
    { period: '2023Q4', date: '2023-10-01', value: 131.2 },
    { period: '2024Q1', date: '2024-01-01', value: 131.0 },
    { period: '2024Q2', date: '2024-04-01', value: 131.2 }
  ],

  // MOM Occupational Wage Benchmark - Engineering & Building Technicians (2018=100)
  'MOM-WAGE-TECH-ME': [
    { period: '2019', date: '2019-01-01', value: 102.5 },
    { period: '2020', date: '2020-01-01', value: 104.0 },
    { period: '2021', date: '2021-01-01', value: 108.5 },
    { period: '2022', date: '2022-01-01', value: 114.2 },
    { period: '2023', date: '2023-01-01', value: 119.5 },
    { period: '2024', date: '2024-01-01', value: 124.2 }
  ],

  // SingStat Total Economy ULC (2015=100, Quarterly)
  'SINGSTAT-ULC-TOTAL': [
    { period: '2020Q1', date: '2020-01-01', value: 102.0 },
    { period: '2021Q1', date: '2021-01-01', value: 105.8 },
    { period: '2021Q4', date: '2021-10-01', value: 112.4 },
    { period: '2022Q2', date: '2022-04-01', value: 117.2 },
    { period: '2022Q4', date: '2022-10-01', value: 119.5 },
    { period: '2023Q2', date: '2023-04-01', value: 121.0 },
    { period: '2023Q4', date: '2023-10-01', value: 122.1 },
    { period: '2024Q2', date: '2024-04-01', value: 122.8 }
  ]
};

// Helper: Apply noise reduction transformations
export function applyNoiseReduction(
  observations: DataObservation[],
  mode: NoiseReductionMode
): { observations: DataObservation[]; description: string; lagPeriods: number } {
  if (mode === 'NONE' || observations.length === 0) {
    return {
      observations: [...observations],
      description: 'Raw published observations (No smoothing applied). Default procurement standard.',
      lagPeriods: 0
    };
  }

  const rawValues = observations.map(o => o.value);
  let smoothedValues: number[] = [];
  let description = '';
  let lag = 0;

  if (mode === 'TRAILING_SMA_3') {
    lag = 1;
    description = '3-Period Trailing Simple Moving Average. Note: analytical scenario only; introduces 1-period lag.';
    smoothedValues = rawValues.map((_, idx) => {
      if (idx < 2) return rawValues[idx]; // Insufficient history for full window
      return (rawValues[idx] + rawValues[idx - 1] + rawValues[idx - 2]) / 3;
    });
  } else if (mode === 'TRAILING_SMA_6') {
    lag = 2.5;
    description = '6-Period Trailing Simple Moving Average. Smooths medium-term volatility; introduces ~2.5 periods lag.';
    smoothedValues = rawValues.map((_, idx) => {
      if (idx < 5) return rawValues[idx];
      let sum = 0;
      for (let k = 0; k < 6; k++) sum += rawValues[idx - k];
      return sum / 6;
    });
  } else if (mode === 'ROLLING_MEDIAN_3') {
    lag = 1;
    description = '3-Period Trailing Rolling Median. Removes single-period spike noise without altering step plateaus.';
    smoothedValues = rawValues.map((_, idx) => {
      if (idx < 2) return rawValues[idx];
      const slice = [rawValues[idx], rawValues[idx - 1], rawValues[idx - 2]].sort((a, b) => a - b);
      return slice[1];
    });
  } else if (mode === 'EMA_ALPHA_3') {
    lag = 1.2;
    description = 'Exponential Moving Average (EMA, alpha=0.3). Gives higher weighting to recent observations.';
    const alpha = 0.3;
    let prev = rawValues[0];
    smoothedValues = rawValues.map((val, idx) => {
      if (idx === 0) return val;
      const current = alpha * val + (1 - alpha) * prev;
      prev = current;
      return current;
    });
  } else if (mode === 'FOUR_QUARTER_TRAIL') {
    lag = 1.5;
    description = '4-Quarter Trailing Moving Average. Intended for quarterly labour and TPI series to smooth seasonal bonuses.';
    smoothedValues = rawValues.map((_, idx) => {
      if (idx < 3) return rawValues[idx];
      return (rawValues[idx] + rawValues[idx - 1] + rawValues[idx - 2] + rawValues[idx - 3]) / 4;
    });
  }

  return {
    observations: observations.map((obs, idx) => ({
      ...obs,
      value: Number(smoothedValues[idx].toFixed(2))
    })),
    description,
    lagPeriods: lag
  };
}

// Helper: Apply normalisation transformations
export function applyNormalisation(
  observations: DataObservation[],
  mode: NormalisationMode,
  baselinePeriod?: string
): { observations: DataObservation[]; unit: string; description: string } {
  if (observations.length === 0 || mode === 'RAW') {
    return {
      observations: [...observations],
      unit: 'Published Units',
      description: 'Raw published values as released by the official statistical agency.'
    };
  }

  const values = observations.map(o => o.value);
  let baseValue = observations[0].value;
  if (baselinePeriod) {
    const matched = observations.find(o => o.period === baselinePeriod);
    if (matched && matched.value > 0) baseValue = matched.value;
  }

  if (mode === 'REBASED_100') {
    return {
      observations: observations.map(o => ({
        ...o,
        value: Number(((o.value / baseValue) * 100).toFixed(2))
      })),
      unit: `Rebased Index (${baselinePeriod || observations[0].period} = 100)`,
      description: `All values mathematically re-indexed relative to baseline observation (${baseValue} = 100.0).`
    };
  }

  if (mode === 'PERCENT_CHANGE') {
    return {
      observations: observations.map(o => ({
        ...o,
        value: Number((((o.value / baseValue) - 1) * 100).toFixed(2))
      })),
      unit: '% Change from Baseline',
      description: `Cumulative percentage escalation relative to the selected baseline period.`
    };
  }

  if (mode === 'YOY_CHANGE') {
    // 12 periods back for monthly, 4 for quarterly
    const step = observations[0].period.includes('Q') ? 4 : 12;
    return {
      observations: observations.map((o, idx) => {
        if (idx < step || observations[idx - step].value <= 0) {
          return { ...o, value: 0 };
        }
        const prior = observations[idx - step].value;
        return {
          ...o,
          value: Number((((o.value / prior) - 1) * 100).toFixed(2))
        };
      }),
      unit: '% YoY Change',
      description: `Year-on-year annual escalation rate compared to the identical period 1 year prior.`
    };
  }

  if (mode === 'Z_SCORE') {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length || 1);
    const std = Math.sqrt(variance) || 1;

    return {
      observations: observations.map(o => ({
        ...o,
        value: Number(((o.value - mean) / std).toFixed(2))
      })),
      unit: 'Z-Score (Unitless)',
      description: 'Standardized statistical deviation (Z-score). UNITLESS STATISTICAL MEASURE ONLY: Unsuitable for direct price contract adjustments.'
    };
  }

  return {
    observations,
    unit: 'Published Units',
    description: 'Raw published values'
  };
}
