import { TenderLineItem } from '../types/index.ts';

/**
 * Isolated Sample Datasets (Prominently labelled "Sample data" per procurement compliance requirements)
 */

export const SAMPLE_TENDER_ITEMS: TenderLineItem[] = [
  // Acceptance Criteria Test Case 1: Materials Benchmark Verification
  {
    id: 'SAMPLE-TEST-001',
    tendererName: 'Shincon Engineering Pte Ltd',
    category: 'MATERIAL',
    itemCode: 'MAT-TEST-01',
    description: '[Sample data] Verification Test Item - Standard Escalation Benchmark (Acceptance Test 1)',
    specification: 'Controlled reference item: Baseline SGD 100,000 with index rising from 100 to 110',
    scopeDifferencesFlag: 'None - Identical reference scope',
    warrantyPeriodMonths: 12,
    quantity: 1,
    unit: 'Lump Sum',
    currency: 'SGD',
    exchangeRateToSgd: 1.0,
    gstBasis: 'EXCLUSIVE',
    baselinePriceDate: '2020M01',
    baselineUnitPrice: 100000,
    baselineTotalPrice: 100000,
    tenderPriceDate: '2020M12',
    tenderUnitPrice: 121000,
    tenderTotalPrice: 121000,
    benchmarkSeriesId: 'SINGSTAT-DSPI-DIV77-CABLE',
    overrideBenchmarkSeriesId: undefined,
    notes: 'Standard verification benchmark test verifying SGD 110,000 benchmark and SGD +11,000 (+10.0%) variance.'
  },

  // Acceptance Criteria Test Case 2: Maintenance Contract Labour Benchmark
  {
    id: 'SAMPLE-TEST-002',
    tendererName: 'FacilityTech Services Pte Ltd',
    category: 'MAINTENANCE',
    itemCode: 'MNT-TEST-02',
    description: '[Sample data] Verification Test Item - Non-Comprehensive Maintenance Labour (Acceptance Test 2)',
    specification: 'Baseline contract SGD 100,000 with 70% labour share and 10% labour index escalation; non-labour held unchanged',
    scopeDifferencesFlag: 'Identical maintenance scope (12 months scheduled servicing)',
    contractDurationMonths: 12,
    labourSharePercent: 70,
    nonLabourEscalationFactor: 1.0,
    technicianHeadcount: 2,
    serviceFrequency: 'Monthly routine servicing + 24/7 breakdown response',
    quantity: 1,
    unit: 'Annual Contract',
    currency: 'SGD',
    exchangeRateToSgd: 1.0,
    gstBasis: 'EXCLUSIVE',
    baselinePriceDate: '2020Q1',
    baselineUnitPrice: 100000,
    baselineTotalPrice: 100000,
    tenderPriceDate: '2021Q1',
    tenderUnitPrice: 115000,
    tenderTotalPrice: 115000,
    benchmarkSeriesId: 'SINGSTAT-ULC-CONST',
    notes: 'Verifies formula: Baseline SGD 100,000, 70% labour (SGD 70k x 1.10 = 77k) + 30% non-labour (SGD 30k) = Benchmark SGD 107,000.'
  },

  // A. Realistic Construction Materials
  {
    id: 'SAMPLE-MAT-003',
    tendererName: 'Yongnam Steel Supplies Pte Ltd',
    category: 'MATERIAL',
    itemCode: 'MAT-REBAR-25',
    description: '[Sample data] High-Tensile Reinforcement Steel Bars (25mm BS4449 Grade B500B)',
    specification: '25mm straight bars, 12m standard lengths, 500 tonnes delivered to Tuas site, mill test certificates included',
    scopeDifferencesFlag: 'Current tender includes enhanced offloading craneage at contractor site (+SGD 20/t)',
    warrantyPeriodMonths: 12,
    quantity: 500,
    unit: 'Metric Tonne',
    currency: 'SGD',
    exchangeRateToSgd: 1.0,
    gstBasis: 'EXCLUSIVE',
    baselinePriceDate: '2021M01',
    baselineUnitPrice: 880,
    baselineTotalPrice: 440000,
    tenderPriceDate: '2024M06',
    tenderUnitPrice: 1040,
    tenderTotalPrice: 520000,
    benchmarkSeriesId: 'BCA-MAT-STEEL-REBAR',
    notes: 'Benchmarked against official BCA monthly average market prices for BS4449 16-32mm rebar.'
  },
  {
    id: 'SAMPLE-MAT-004',
    tendererName: 'Island Concrete Pte Ltd',
    category: 'MATERIAL',
    itemCode: 'MAT-RMC-G40',
    description: '[Sample data] Ready-Mixed Concrete Grade 40 OPC Pump Mix',
    specification: 'Grade 40 Ordinary Portland Cement mix with 100mm slump, delivered via 7m³ transit mixers to Jurong project',
    scopeDifferencesFlag: 'Tender includes extended 2-hour discharge waiting time clause (+SGD 5/m³)',
    warrantyPeriodMonths: 12,
    quantity: 2500,
    unit: 'm³',
    currency: 'SGD',
    exchangeRateToSgd: 1.0,
    gstBasis: 'EXCLUSIVE',
    baselinePriceDate: '2021M01',
    baselineUnitPrice: 95,
    baselineTotalPrice: 237500,
    tenderPriceDate: '2024M06',
    tenderUnitPrice: 130,
    tenderTotalPrice: 325000,
    benchmarkSeriesId: 'BCA-MAT-CONCRETE-G40',
    notes: 'Directly benchmarked against BCA Ready-Mixed Concrete Grade 40 delivered unit rate.'
  },
  {
    id: 'SAMPLE-MAT-005',
    tendererName: 'B-Steel International Corp',
    category: 'MATERIAL',
    itemCode: 'MAT-STRUCT-HBEAM',
    description: '[Sample data] Hot-Rolled Structural Steel Universal Columns & Beams (S355JR)',
    specification: 'Imported UB/UC structural sections, mill certified to EN 10025-2, ex-warehouse Singapore',
    scopeDifferencesFlag: 'Baseline was USD denominated; current quote provided in SGD',
    warrantyPeriodMonths: 12,
    quantity: 120,
    unit: 'Metric Tonne',
    currency: 'USD',
    exchangeRateToSgd: 1.345,
    gstBasis: 'EXCLUSIVE',
    baselinePriceDate: '2021M01',
    baselineUnitPrice: 1250, // USD 1,250 = SGD 1,656.25 at 2021 rates
    baselineTotalPrice: 150000, // USD 150,000
    tenderPriceDate: '2024M06',
    tenderUnitPrice: 1480, // USD 1,480 = SGD 1,990.60
    tenderTotalPrice: 177600, // USD 177,600
    benchmarkSeriesId: 'SINGSTAT-DSPI-DIV67',
    notes: 'Imported structural steel tracked via SingStat DSPI Division 67 (Iron & Steel).'
  },

  // B. M&E Supply & Installation (Composite Trades)
  {
    id: 'SAMPLE-ME-006',
    tendererName: 'Carrier-Voltas Joint Venture',
    category: 'ME_TRADE',
    itemCode: 'ME-ACMV-CHILLER',
    description: '[Sample data] Supply & Installation of 500RT Water-Cooled Centrifugal Chiller Plant & AHUs',
    specification: 'Complete replacement of 2x 500RT chillers, variable speed primary chilled water pumps, AHUs and ductwork retrofits',
    scopeDifferencesFlag: 'Current tender includes 5-year full warranty and IoT vibration sensors (+SGD 45,000)',
    warrantyPeriodMonths: 60,
    quantity: 1,
    unit: 'Package',
    currency: 'SGD',
    exchangeRateToSgd: 1.0,
    gstBasis: 'EXCLUSIVE',
    baselinePriceDate: '2021M01',
    baselineUnitPrice: 680000,
    baselineTotalPrice: 680000,
    tenderPriceDate: '2024M06',
    tenderUnitPrice: 845000,
    tenderTotalPrice: 845000,
    benchmarkSeriesId: 'COMPOSITE_ACMV',
    customCompositeWeights: [
      {
        componentName: 'Chillers & Major Plant Equipment',
        seriesId: 'SINGSTAT-IPI-DIV74-PUMPS',
        weightPercent: 45,
        description: 'Imported chillers, compressors & AHU fans'
      },
      {
        componentName: 'Ductwork, Piping & Insulation Materials',
        seriesId: 'SINGSTAT-DSPI-DIV68-ALUM',
        weightPercent: 25,
        description: 'Aluminium ducting sheets & piping'
      },
      {
        componentName: 'Installation & Erection Labour',
        seriesId: 'SINGSTAT-ULC-CONST',
        weightPercent: 18,
        description: 'Site mechanical assembly and rigging labour'
      },
      {
        componentName: 'Testing & Commissioning',
        seriesId: 'SINGSTAT-ULC-CONST',
        weightPercent: 5,
        description: 'Air and hydronic balancing, acoustic test'
      },
      {
        componentName: 'Contractor Overhead & Margin',
        seriesId: 'SINGSTAT-ULC-TOTAL',
        weightPercent: 7,
        description: 'Corporate overhead and statutory levies'
      }
    ],
    notes: 'Multi-component composite benchmark capturing equipment import index, ducting materials, and construction labour.'
  },
  {
    id: 'SAMPLE-ME-007',
    tendererName: 'Meiden Electrical Engineering Pte Ltd',
    category: 'ME_TRADE',
    itemCode: 'ME-ELEC-MSB',
    description: '[Sample data] 22kV / 400V Main Switchboard Replacement & Sub-mains Cabling',
    specification: '4000A Form 4B Main Switchboard, 4x ACB with microprocessor trips, XLPE fire-rated sub-main cabling to 6 risers',
    scopeDifferencesFlag: 'New specification mandates arc fault containment compliance to IEC 61439-2',
    warrantyPeriodMonths: 24,
    quantity: 1,
    unit: 'Package',
    currency: 'SGD',
    exchangeRateToSgd: 1.0,
    gstBasis: 'EXCLUSIVE',
    baselinePriceDate: '2021M01',
    baselineUnitPrice: 420000,
    baselineTotalPrice: 420000,
    tenderPriceDate: '2024M06',
    tenderUnitPrice: 535000,
    tenderTotalPrice: 535000,
    benchmarkSeriesId: 'COMPOSITE_ELEC',
    customCompositeWeights: [
      {
        componentName: 'Switchgear & Breaker Equipment',
        seriesId: 'SINGSTAT-IPI-DIV77-SWITCHGEAR',
        weightPercent: 40,
        description: 'Air circuit breakers & switchboard modules'
      },
      {
        componentName: 'Cabling & Copper Busbars',
        seriesId: 'SINGSTAT-DSPI-DIV77-CABLE',
        weightPercent: 30,
        description: 'Insulated XLPE power cables & containment'
      },
      {
        componentName: 'Site Pulling & Termination Labour',
        seriesId: 'SINGSTAT-ULC-CONST',
        weightPercent: 18,
        description: 'Cable pulling, glanding and termination'
      },
      {
        componentName: 'LEW Testing & Turn-on',
        seriesId: 'SINGSTAT-ULC-CONST',
        weightPercent: 5,
        description: 'High-voltage insulation and injection tests'
      },
      {
        componentName: 'Contractor Overhead & Margin',
        seriesId: 'SINGSTAT-ULC-TOTAL',
        weightPercent: 7,
        description: 'Project management and safety'
      }
    ],
    notes: 'Weighted composite tracking electrical switchgear import index, cable wholesale index, and trade labour.'
  },

  // C. Realistic Facility Maintenance Contracts
  {
    id: 'SAMPLE-MNT-008',
    tendererName: 'Johnson Controls Facilities Pte Ltd',
    category: 'MAINTENANCE',
    itemCode: 'MNT-ACMV-3YR',
    description: '[Sample data] 3-Year Non-Comprehensive ACMV Preventive Servicing Contract',
    specification: 'Quarterly servicing of 4x chillers, monthly servicing of 32x AHUs, 240x FCUs, cooling towers, chemical water treatment',
    scopeDifferencesFlag: 'SLA response time tightened from 4 hours to 2 hours for critical cleanroom areas',
    contractDurationMonths: 36,
    labourSharePercent: 75,
    nonLabourEscalationFactor: 1.0,
    technicianHeadcount: 4,
    serviceFrequency: 'Full-time stationed lead technician + monthly support crew',
    quantity: 1,
    unit: '3-Year Contract',
    currency: 'SGD',
    exchangeRateToSgd: 1.0,
    gstBasis: 'EXCLUSIVE',
    baselinePriceDate: '2021Q1',
    baselineUnitPrice: 330000, // SGD 110k/yr
    baselineTotalPrice: 330000,
    tenderPriceDate: '2024Q2',
    tenderUnitPrice: 395000, // SGD 131.6k/yr
    tenderTotalPrice: 395000,
    benchmarkSeriesId: 'MOM-WAGE-TECH-ME',
    overrideBenchmarkSeriesId: 'SINGSTAT-ULC-CONST',
    notes: 'Non-comprehensive maintenance: 75% labour share escalated via SingStat Construction Unit Labour Cost; 25% consumable spares held fixed.'
  }
];
