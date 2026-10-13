import { CatalogueSeries, MeTradeTemplate } from '../types/index.ts';

export const CATALOGUE_SERIES: CatalogueSeries[] = [
  // A. Construction Materials
  {
    id: 'BCA-MAT-STEEL-REBAR',
    publisher: 'Building and Construction Authority (BCA)',
    datasetId: 'BCA-MAT-PRICES',
    seriesId: 'REBAR-BS4449-16-32MM',
    title: 'Reinforcement Steel Bars (16-32mm High Tensile BS4449)',
    category: 'CONSTRUCTION_MATERIALS',
    unit: 'SGD / Metric Tonne',
    sourceLink: 'https://www.bca.gov.sg/data/market_prices.html',
    methodologyLink: 'https://www.bca.gov.sg/publications/bpi/construction_materials_notes.html',
    coverage: 'Monthly market average unit price of high-tensile rebar (16mm to 32mm diameters, BS 4449 standard), delivered to construction sites in Singapore for minimum 100-tonne orders.',
    exclusions: 'Excludes Goods and Services Tax (GST), prefabricated cutting and bending, unloading at site, express surcharges, and special alloy coatings.',
    frequency: 'MONTHLY',
    latestPeriod: '2024M06',
    latestReleaseDate: '2024-07-15',
    retrievalTimestamp: '2024-07-20T10:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'DIRECT_PUBLISHED',
    relevanceRationale: 'Official Singapore statutory market benchmark for reinforcement steel supply in civil and building structural works.',
    limitations: 'Refers to standard stock bar lengths. Does not capture cut-and-bend fabricator markups or batch delivery surcharges.',
    isUnitRateDataset: true,
    latestValue: 980.0
  },
  {
    id: 'BCA-MAT-CONCRETE-G40',
    publisher: 'Building and Construction Authority (BCA)',
    datasetId: 'BCA-MAT-PRICES',
    seriesId: 'RMC-G40-PUMP',
    title: 'Ready-Mixed Concrete (Grade 40 Ordinary Portland Cement)',
    category: 'CONSTRUCTION_MATERIALS',
    unit: 'SGD / m³',
    sourceLink: 'https://www.bca.gov.sg/data/market_prices.html',
    methodologyLink: 'https://www.bca.gov.sg/publications/bpi/construction_materials_notes.html',
    coverage: 'Average market price of Grade 40 pumpable ready-mixed concrete with Ordinary Portland Cement, delivered within Singapore island.',
    exclusions: 'Excludes GST, concrete pumping equipment rental charges, waiting-time charges, night-pour surcharges, and specialized retarders/accelerators.',
    frequency: 'MONTHLY',
    latestPeriod: '2024M06',
    latestReleaseDate: '2024-07-15',
    retrievalTimestamp: '2024-07-20T10:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'DIRECT_PUBLISHED',
    relevanceRationale: 'Primary market benchmark for structural concrete supply contracts in Singapore.',
    limitations: 'Standard mix only; does not include waterproofing admix, micro-silica, or temperature-controlled green concrete premium.',
    isUnitRateDataset: true,
    latestValue: 124.5
  },
  {
    id: 'BCA-MAT-CEMENT-BULK',
    publisher: 'Building and Construction Authority (BCA)',
    datasetId: 'BCA-MAT-PRICES',
    seriesId: 'CEMENT-OPC-BULK',
    title: 'Ordinary Portland Cement (in bulk)',
    category: 'CONSTRUCTION_MATERIALS',
    unit: 'SGD / Metric Tonne',
    sourceLink: 'https://www.bca.gov.sg/data/market_prices.html',
    methodologyLink: 'https://www.bca.gov.sg/publications/bpi/construction_materials_notes.html',
    coverage: 'Monthly average selling price of ordinary portland cement delivered in tanker bulk.',
    exclusions: 'Excludes bag packaging, palletisation, GST, and demurrage costs.',
    frequency: 'MONTHLY',
    latestPeriod: '2024M06',
    latestReleaseDate: '2024-07-15',
    retrievalTimestamp: '2024-07-20T10:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'DIRECT_PUBLISHED',
    relevanceRationale: 'Essential direct benchmark for raw binder and grouting supply works.',
    limitations: 'Bulk tanker supply only; bagged cement has higher retail handling premiums.',
    isUnitRateDataset: true,
    latestValue: 112.0
  },
  {
    id: 'BCA-MAT-SAND',
    publisher: 'Building and Construction Authority (BCA)',
    datasetId: 'BCA-MAT-PRICES',
    seriesId: 'CONCRETING-SAND',
    title: 'Concreting Sand',
    category: 'CONSTRUCTION_MATERIALS',
    unit: 'SGD / Metric Tonne',
    sourceLink: 'https://www.bca.gov.sg/data/market_prices.html',
    methodologyLink: 'https://www.bca.gov.sg/publications/bpi/construction_materials_notes.html',
    coverage: 'Ex-stockpile or delivered market rate for graded concreting sand imported into Singapore.',
    exclusions: 'Excludes GST and barge demurrage.',
    frequency: 'MONTHLY',
    latestPeriod: '2024M06',
    latestReleaseDate: '2024-07-15',
    retrievalTimestamp: '2024-07-20T10:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'DIRECT_PUBLISHED',
    relevanceRationale: 'Direct indicator for fine aggregate escalation.',
    limitations: 'Subject to regional export restrictions and stockpile release pricing policies.',
    isUnitRateDataset: true,
    latestValue: 32.8
  },
  {
    id: 'BCA-MAT-GRANITE',
    publisher: 'Building and Construction Authority (BCA)',
    datasetId: 'BCA-MAT-PRICES',
    seriesId: 'GRANITE-20MM',
    title: 'Granite Aggregate (20mm)',
    category: 'CONSTRUCTION_MATERIALS',
    unit: 'SGD / Metric Tonne',
    sourceLink: 'https://www.bca.gov.sg/data/market_prices.html',
    methodologyLink: 'https://www.bca.gov.sg/publications/bpi/construction_materials_notes.html',
    coverage: 'Market price for crushed 20mm granite coarse aggregate delivered in Singapore.',
    exclusions: 'Excludes GST and quarry transport surcharges.',
    frequency: 'MONTHLY',
    latestPeriod: '2024M06',
    latestReleaseDate: '2024-07-15',
    retrievalTimestamp: '2024-07-20T10:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'DIRECT_PUBLISHED',
    relevanceRationale: 'Coarse aggregate benchmark for precast, civil and readymix works.',
    limitations: 'Coarse aggregate only; excludes manufactured quarry dust or washed fines.',
    isUnitRateDataset: true,
    latestValue: 26.2
  },
  {
    id: 'SINGSTAT-DSPI-DIV67',
    publisher: 'Singapore Department of Statistics (SingStat)',
    datasetId: 'M212881',
    seriesId: 'DSPI-67',
    title: 'Domestic Supply Price Index - Iron & Steel (Division 67)',
    category: 'CONSTRUCTION_MATERIALS',
    unit: 'Index (2018=100)',
    indexBaseYear: '2018=100',
    sourceLink: 'https://tablebuilder.singstat.gov.sg/api/table/tabledata/M212881',
    methodologyLink: 'https://www.singstat.gov.sg/find-data/search-by-theme/economy/prices-and-price-indices/statistical-methodology',
    coverage: 'Covers domestic supply of semi-finished iron, rolled steel, structural steel sections, plates, sheets, and pipes across Singapore market.',
    exclusions: 'Excludes installation labour, on-site erection, primer painting, and fire-proofing intumescent coatings.',
    frequency: 'MONTHLY',
    latestPeriod: '2024M06',
    latestReleaseDate: '2024-07-26',
    retrievalTimestamp: '2024-07-28T08:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'DIRECT_PUBLISHED',
    relevanceRationale: 'Authoritative official SingStat wholesale price index tracking iron and structural steel supply in Singapore.',
    limitations: 'Index measures price movement relative to 2018=100. It is not an absolute SGD unit rate.',
    isUnitRateDataset: false,
    latestValue: 126.8
  },
  {
    id: 'SINGSTAT-DSPI-DIV68-COPPER',
    publisher: 'Singapore Department of Statistics (SingStat)',
    datasetId: 'M212881',
    seriesId: 'DSPI-68-COPPER',
    title: 'Domestic Supply Price Index - Non-Ferrous Metals (Division 68: Refined Copper & Alloys)',
    category: 'CONSTRUCTION_MATERIALS',
    unit: 'Index (2018=100)',
    indexBaseYear: '2018=100',
    sourceLink: 'https://tablebuilder.singstat.gov.sg/api/table/tabledata/M212881',
    methodologyLink: 'https://www.singstat.gov.sg/find-data/search-by-theme/economy/prices-and-price-indices',
    coverage: 'Tracks prices of copper cathodes, unwrought copper, brass, and alloy ingots in the domestic supply chain.',
    exclusions: 'Excludes wire drawing, XLPE insulation, halogen-free jackets, and cable assembly labour.',
    frequency: 'MONTHLY',
    latestPeriod: '2024M06',
    latestReleaseDate: '2024-07-26',
    retrievalTimestamp: '2024-07-28T08:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'BROADER_PROXY',
    relevanceRationale: 'Upstream commodity proxy for copper busbars, earthing tapes, and raw conductors.',
    limitations: 'Broad raw-metal proxy. Does not reflect downstream manufacturing overhead, insulation compounding, or distributor margins.',
    isUnitRateDataset: false,
    latestValue: 141.2
  },
  {
    id: 'SINGSTAT-DSPI-DIV68-ALUM',
    publisher: 'Singapore Department of Statistics (SingStat)',
    datasetId: 'M212881',
    seriesId: 'DSPI-68-ALUM',
    title: 'Domestic Supply Price Index - Non-Ferrous Metals (Division 68: Aluminium & Alloys)',
    category: 'CONSTRUCTION_MATERIALS',
    unit: 'Index (2018=100)',
    indexBaseYear: '2018=100',
    sourceLink: 'https://tablebuilder.singstat.gov.sg/api/table/tabledata/M212881',
    methodologyLink: 'https://www.singstat.gov.sg/find-data/search-by-theme/economy/prices-and-price-indices',
    coverage: 'Domestic wholesale price of raw aluminium ingots, extruded profiles, and rolled sheets.',
    exclusions: 'Excludes anodising, powder coating, architectural curtain wall fabrication, and glazing.',
    frequency: 'MONTHLY',
    latestPeriod: '2024M06',
    latestReleaseDate: '2024-07-26',
    retrievalTimestamp: '2024-07-28T08:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'BROADER_PROXY',
    relevanceRationale: 'Primary proxy for aluminium cladding, cable trays, louvres, and ducting sheets.',
    limitations: 'Raw/semi-finished metal only; fabrication, powder-coating, and testing are excluded.',
    isUnitRateDataset: false,
    latestValue: 128.4
  },
  {
    id: 'SINGSTAT-DSPI-DIV77-CABLE',
    publisher: 'Singapore Department of Statistics (SingStat)',
    datasetId: 'M212881',
    seriesId: 'DSPI-773-CABLES',
    title: 'Domestic Supply Price Index - Insulated Wire & Cable (Group 773)',
    category: 'CONSTRUCTION_MATERIALS',
    unit: 'Index (2018=100)',
    indexBaseYear: '2018=100',
    sourceLink: 'https://tablebuilder.singstat.gov.sg/api/table/tabledata/M212881',
    methodologyLink: 'https://www.singstat.gov.sg/find-data/search-by-theme/economy/prices-and-price-indices',
    coverage: 'Tracks wholesale domestic prices of low voltage (LV), medium voltage (MV), fire-rated, and control cables supplied in Singapore.',
    exclusions: 'Excludes cable pulling labour, trenching, containment, cable terminations, and testing.',
    frequency: 'MONTHLY',
    latestPeriod: '2024M06',
    latestReleaseDate: '2024-07-26',
    retrievalTimestamp: '2024-07-28T08:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'DIRECT_PUBLISHED',
    relevanceRationale: 'Direct Singapore price index for electrical building cabling material tenders.',
    limitations: 'Refers to material supply only; does not cover installation, jointing, or testing/commissioning.',
    isUnitRateDataset: false,
    latestValue: 133.6
  },
  {
    id: 'SINGSTAT-DSPI-DIV66-NONMETALLIC',
    publisher: 'Singapore Department of Statistics (SingStat)',
    datasetId: 'M212881',
    seriesId: 'DSPI-66-MINERALS',
    title: 'Domestic Supply Price Index - Non-Metallic Mineral Manufactures (Division 66: Cement, Glass, Clay, Refractories)',
    category: 'CONSTRUCTION_MATERIALS',
    unit: 'Index (2018=100)',
    indexBaseYear: '2018=100',
    sourceLink: 'https://tablebuilder.singstat.gov.sg/api/table/tabledata/M212881',
    methodologyLink: 'https://www.singstat.gov.sg/find-data/search-by-theme/economy/prices-and-price-indices',
    coverage: 'Wholesale prices of plaster, glass, ceramic, cement products, bricks, and non-metallic pipes.',
    exclusions: 'Excludes on-site masonry, plastering labour, and specialized sealants.',
    frequency: 'MONTHLY',
    latestPeriod: '2024M06',
    latestReleaseDate: '2024-07-26',
    retrievalTimestamp: '2024-07-28T08:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'DIRECT_PUBLISHED',
    relevanceRationale: 'Direct index for architectural and wet-trade materials.',
    limitations: 'Aggregate basket combining glass, ceramics, and cement.',
    isUnitRateDataset: false,
    latestValue: 129.1
  },

  // B. M&E Equipment & Trades
  {
    id: 'SINGSTAT-IPI-DIV74-PUMPS',
    publisher: 'Singapore Department of Statistics (SingStat)',
    datasetId: 'M212931',
    seriesId: 'IPI-74-PUMPS-VALVES',
    title: 'Import Price Index - Pumps, Compressors, Fans & Valves (Division 74)',
    category: 'ME_EQUIPMENT',
    applicableTrades: ['ACMV', 'PLUMBING', 'FIRE_PROTECTION'],
    unit: 'Index (2018=100)',
    indexBaseYear: '2018=100',
    sourceLink: 'https://tablebuilder.singstat.gov.sg/api/table/tabledata/M212931',
    methodologyLink: 'https://www.singstat.gov.sg/find-data/search-by-theme/economy/prices-and-price-indices',
    coverage: 'Tracks import prices (CIF Singapore) of centrifugal water pumps, air conditioning chillers, compressors, axial fans, and control valves.',
    exclusions: 'Excludes local warehousing, inland freight, hoisting, piping installation, electrical cabling, and T&C.',
    frequency: 'MONTHLY',
    latestPeriod: '2024M06',
    latestReleaseDate: '2024-07-26',
    retrievalTimestamp: '2024-07-28T08:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'DIRECT_PUBLISHED',
    relevanceRationale: 'Primary official benchmark for capital mechanical plant equipment imported into Singapore.',
    limitations: 'Import equipment index only. Does not cover local contractor installation labour, craneage, or commissioning.',
    isUnitRateDataset: false,
    latestValue: 122.4
  },
  {
    id: 'SINGSTAT-IPI-DIV77-SWITCHGEAR',
    publisher: 'Singapore Department of Statistics (SingStat)',
    datasetId: 'M212931',
    seriesId: 'IPI-772-SWITCHGEAR',
    title: 'Import Price Index - Electrical Apparatus for Switching/Protecting Circuits (Group 772: Switchboards, Breakers, Transformers)',
    category: 'ME_EQUIPMENT',
    applicableTrades: ['ELECTRICAL'],
    unit: 'Index (2018=100)',
    indexBaseYear: '2018=100',
    sourceLink: 'https://tablebuilder.singstat.gov.sg/api/table/tabledata/M212931',
    methodologyLink: 'https://www.singstat.gov.sg/find-data/search-by-theme/economy/prices-and-price-indices',
    coverage: 'Import prices of main switchboards, circuit breakers (ACB, MCCB, MCB), protection relays, distribution panels, and busduct components.',
    exclusions: 'Excludes local sheet metal enclosure assembly, copper link fabrication, on-site termination, and LEW licensing tests.',
    frequency: 'MONTHLY',
    latestPeriod: '2024M06',
    latestReleaseDate: '2024-07-26',
    retrievalTimestamp: '2024-07-28T08:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'DIRECT_PUBLISHED',
    relevanceRationale: 'Essential official benchmark for major electrical distribution plant supply in Singapore.',
    limitations: 'Excludes local site labour and custom switchboard builder engineering margins.',
    isUnitRateDataset: false,
    latestValue: 125.7
  },
  {
    id: 'SINGSTAT-IPI-DIV71-GENERATORS',
    publisher: 'Singapore Department of Statistics (SingStat)',
    datasetId: 'M212931',
    seriesId: 'IPI-71-POWER-GEN',
    title: 'Import Price Index - Power Generating Machinery & Diesel Engines (Division 71)',
    category: 'ME_EQUIPMENT',
    applicableTrades: ['GENERATORS_UPS'],
    unit: 'Index (2018=100)',
    indexBaseYear: '2018=100',
    sourceLink: 'https://tablebuilder.singstat.gov.sg/api/table/tabledata/M212931',
    methodologyLink: 'https://www.singstat.gov.sg/find-data/search-by-theme/economy/prices-and-price-indices',
    coverage: 'Imported standby diesel generators, alternator sets, turbochargers, and UPS power conversion modules.',
    exclusions: 'Excludes exhaust acoustic silencer ducting, underground fuel tanks, SCDF licensing, and load-bank commissioning.',
    frequency: 'MONTHLY',
    latestPeriod: '2024M06',
    latestReleaseDate: '2024-07-26',
    retrievalTimestamp: '2024-07-28T08:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'DIRECT_PUBLISHED',
    relevanceRationale: 'Official series for generator and heavy rotating electrical plant imports.',
    limitations: 'Equipment only; does not cover acoustic attenuators, fuel reticulation, or site installation.',
    isUnitRateDataset: false,
    latestValue: 121.9
  },
  {
    id: 'SINGSTAT-IPI-DIV75-BMS-ELV',
    publisher: 'Singapore Department of Statistics (SingStat)',
    datasetId: 'M212931',
    seriesId: 'IPI-75-76-ELV-BMS',
    title: 'Import Price Index - Automatic Data Processing & Telecom Equipment (Division 75/76: ELV, BMS & Security)',
    category: 'ME_EQUIPMENT',
    applicableTrades: ['BMS_CONTROLS', 'ELV_SECURITY'],
    unit: 'Index (2018=100)',
    indexBaseYear: '2018=100',
    sourceLink: 'https://tablebuilder.singstat.gov.sg/api/table/tabledata/M212931',
    methodologyLink: 'https://www.singstat.gov.sg/find-data/search-by-theme/economy/prices-and-price-indices',
    coverage: 'Tracks imported microcontrollers, direct digital controllers (DDC), sensors, CCTV IP cameras, network switches, and security servers.',
    exclusions: 'Excludes proprietary software licensing, BMS graphics engineering, system integration, point-to-point wiring, and testing.',
    frequency: 'MONTHLY',
    latestPeriod: '2024M06',
    latestReleaseDate: '2024-07-26',
    retrievalTimestamp: '2024-07-28T08:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'BROADER_PROXY',
    relevanceRationale: 'Hardware equipment proxy for intelligent building controllers and security devices.',
    limitations: 'Broad electronics hardware proxy; software engineering and systems configuration are the dominant cost drivers in ELV/BMS.',
    isUnitRateDataset: false,
    latestValue: 108.5
  },
  {
    id: 'BCA-TPI-OVERALL',
    publisher: 'Building and Construction Authority (BCA)',
    datasetId: 'BCA-TPI',
    seriesId: 'BCA-TPI-OVERALL-2010',
    title: 'BCA Building Works Tender Price Index (Overall)',
    category: 'MACRO_TPI',
    unit: 'Index (2010=100)',
    indexBaseYear: '2010=100',
    sourceLink: 'https://www.bca.gov.sg/data/tpi.html',
    methodologyLink: 'https://www.bca.gov.sg/publications/bpi/tender_price_index_notes.html',
    coverage: 'Measures tender price movements for building construction contracts (architectural and structural works) awarded by private and public sectors.',
    exclusions: 'CRITICAL SCOPE EXCLUSION: Explicitly covers architectural and structural building works only. EXCLUDES separate Mechanical & Electrical (M&E) specialist contracts, civil engineering works, interior fitting-out, and maintenance.',
    frequency: 'QUARTERLY',
    latestPeriod: '2024Q2',
    latestReleaseDate: '2024-08-10',
    retrievalTimestamp: '2024-08-15T09:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'BROADER_PROXY',
    relevanceRationale: 'Macro barometer for general Singapore construction market pricing sentiment and contractor capacity.',
    limitations: 'CANNOT be used as a direct benchmark for M&E installations or maintenance contracts due to explicit exclusion of M&E packages.',
    isUnitRateDataset: false,
    latestValue: 138.4
  },

  // C. Construction & Maintenance Labour
  {
    id: 'SINGSTAT-ULC-CONST',
    publisher: 'Singapore Department of Statistics (SingStat)',
    datasetId: 'M183421',
    seriesId: 'ULC-CONSTRUCTION',
    title: 'Unit Labour Cost Index of the Construction Sector',
    category: 'LABOUR_MAINTENANCE',
    applicableTrades: ['ALL_TRADES', 'MAINTENANCE'],
    unit: 'Index (2015=100)',
    indexBaseYear: '2015=100',
    sourceLink: 'https://tablebuilder.singstat.gov.sg/api/table/tabledata/M183421',
    methodologyLink: 'https://www.singstat.gov.sg/find-data/search-by-theme/economy/labour-employment-wages-and-productivity/methodology',
    coverage: 'Measures total labour compensation (wages, CPF, foreign worker levy, bonuses) per unit of real value added in Singapore construction sector.',
    exclusions: 'CRITICAL DEFINITIONAL DISTINCTION: Unit Labour Cost is NOT an hourly contractor charge-out billing rate or craftsman basic wage. It reflects labour cost per unit of output and is heavily influenced by labour productivity, mechanisation, and output volume.',
    frequency: 'QUARTERLY',
    latestPeriod: '2024Q2',
    latestReleaseDate: '2024-08-25',
    retrievalTimestamp: '2024-08-30T11:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'BROADER_PROXY',
    relevanceRationale: 'Official macroeconomic indicator of construction-wide labour cost pressures and foreign worker levy impacts.',
    limitations: 'Subject to quarterly productivity fluctuations. Must not be confused with technician commercial billing rates.',
    isUnitRateDataset: false,
    latestValue: 131.2
  },
  {
    id: 'MOM-WAGE-TECH-ME',
    publisher: 'Ministry of Manpower (MOM) / SingStat',
    datasetId: 'MOM-OWS',
    seriesId: 'MOM-OWS-ME-TECHNICIAN',
    title: 'Occupational Wage Benchmark - Engineering & Building Maintenance Technicians',
    category: 'LABOUR_MAINTENANCE',
    applicableTrades: ['ACMV', 'ELECTRICAL', 'LIFTS', 'FIRE_PROTECTION', 'MAINTENANCE'],
    unit: 'Index (2018=100)',
    indexBaseYear: '2018=100',
    sourceLink: 'https://stats.mom.gov.sg/pages/occupational-wages.aspx',
    methodologyLink: 'https://stats.mom.gov.sg/Pages/Occupational-Wages-Methodology.aspx',
    coverage: 'Tracks median monthly basic and gross wages for air-conditioning mechanics, electrical equipment fitters, building maintenance technicians, and lift specialists in Singapore.',
    exclusions: 'Excludes contractor corporate overheads, LEW endorsement fees, profit margins, transport vehicle amortisation, and consumable spare parts.',
    frequency: 'ANNUAL',
    latestPeriod: '2023',
    latestReleaseDate: '2024-06-30',
    retrievalTimestamp: '2024-07-10T14:00:00Z',
    seasonalAdjustment: 'NOT_APPLICABLE',
    classification: 'DIRECT_PUBLISHED',
    relevanceRationale: 'Most direct official benchmark for technical technician earnings in facility maintenance and trade servicing.',
    limitations: 'Published annually. Does not include contractor charge-out markup, licensing risk premiums, or round-the-clock emergency standby loadings.',
    isUnitRateDataset: false,
    latestValue: 119.5
  },
  {
    id: 'SINGSTAT-ULC-TOTAL',
    publisher: 'Singapore Department of Statistics (SingStat)',
    datasetId: 'M183421',
    seriesId: 'ULC-TOTAL-ECONOMY',
    title: 'Unit Labour Cost Index of Total Economy',
    category: 'LABOUR_MAINTENANCE',
    unit: 'Index (2015=100)',
    indexBaseYear: '2015=100',
    sourceLink: 'https://tablebuilder.singstat.gov.sg/api/table/tabledata/M183421',
    methodologyLink: 'https://www.singstat.gov.sg/find-data/search-by-theme/economy/labour-employment-wages-and-productivity',
    coverage: 'Total economy unit labour cost across all Singapore industries.',
    exclusions: 'Not specific to construction or mechanical/electrical trades.',
    frequency: 'QUARTERLY',
    latestPeriod: '2024Q2',
    latestReleaseDate: '2024-08-25',
    retrievalTimestamp: '2024-08-30T11:00:00Z',
    seasonalAdjustment: 'UNADJUSTED',
    classification: 'BROADER_PROXY',
    relevanceRationale: 'Macro Singapore economy labour cost comparison.',
    limitations: 'Too broad for specialized M&E contractor analysis.',
    isUnitRateDataset: false,
    latestValue: 122.8
  }
];

export const ME_TRADE_TEMPLATES: Record<string, MeTradeTemplate> = {
  ACMV: {
    tradeId: 'ACMV',
    tradeName: 'ACMV (Air Conditioning & Mechanical Ventilation)',
    description: 'Chillers, Air Handling Units (AHUs), Fan Coil Units (FCUs), ductwork, chilled water pumps and ventilation.',
    defaultWeights: {
      equipment: 45, // Chillers, AHUs, Pumps
      materials: 25, // Ducting, insulation, copper piping
      labour: 18,    // Installation & duct erection
      testingCommissioning: 5, // Air balancing, water balancing, sound
      overheadProfit: 7 // Contractor general overhead & margin
    },
    recommendedSeries: {
      equipmentSeriesId: 'SINGSTAT-IPI-DIV74-PUMPS',
      materialsSeriesId: 'SINGSTAT-DSPI-DIV68-ALUM',
      labourSeriesId: 'SINGSTAT-ULC-CONST'
    },
    overheadProfitEscalationFactor: 1.0
  },
  ELECTRICAL: {
    tradeId: 'ELECTRICAL',
    tradeName: 'Electrical Distribution & Power Works',
    description: 'Main switchboards, sub-switchboards, transformers, sub-main cables, busducts, lighting and power points.',
    defaultWeights: {
      equipment: 40, // Switchgear, transformers, circuit breakers
      materials: 30, // Insulated cables, cable trays, busducts
      labour: 18,    // Cable pulling, termination, trunking installation
      testingCommissioning: 5, // Megger test, secondary injection, LEW turn-on
      overheadProfit: 7
    },
    recommendedSeries: {
      equipmentSeriesId: 'SINGSTAT-IPI-DIV77-SWITCHGEAR',
      materialsSeriesId: 'SINGSTAT-DSPI-DIV77-CABLE',
      labourSeriesId: 'SINGSTAT-ULC-CONST'
    },
    overheadProfitEscalationFactor: 1.0
  },
  GENERATORS_UPS: {
    tradeId: 'GENERATORS_UPS',
    tradeName: 'Standby Generators & UPS Systems',
    description: 'Diesel generating sets, acoustic enclosures, daily fuel tanks, static UPS modules and battery racks.',
    defaultWeights: {
      equipment: 60, // Generator set, alternator, UPS static inverter
      materials: 15, // Acoustic silencers, fuel piping, battery cables
      labour: 12,    // Rigging, alignment, exhaust installation
      testingCommissioning: 6, // Full load-bank testing, transfer sync
      overheadProfit: 7
    },
    recommendedSeries: {
      equipmentSeriesId: 'SINGSTAT-IPI-DIV71-GENERATORS',
      materialsSeriesId: 'SINGSTAT-DSPI-DIV77-CABLE',
      labourSeriesId: 'SINGSTAT-ULC-CONST'
    },
    overheadProfitEscalationFactor: 1.0
  },
  PLUMBING: {
    tradeId: 'PLUMBING',
    tradeName: 'Plumbing, Sanitary & Pumps',
    description: 'Domestic water booster pumps, sump pumps, stainless steel / HDPE pipes, sanitary fixtures and valves.',
    defaultWeights: {
      equipment: 35, // Booster sets, sump pumps, hot water calorifiers
      materials: 35, // Piping (SS/copper/HDPE), valves, fittings
      labour: 20,    // Pipe jointing, hydrotesting, core drilling
      testingCommissioning: 3, // Pressure testing, water chlorination
      overheadProfit: 7
    },
    recommendedSeries: {
      equipmentSeriesId: 'SINGSTAT-IPI-DIV74-PUMPS',
      materialsSeriesId: 'SINGSTAT-DSPI-DIV66-NONMETALLIC',
      labourSeriesId: 'SINGSTAT-ULC-CONST'
    },
    overheadProfitEscalationFactor: 1.0
  },
  FIRE_PROTECTION: {
    tradeId: 'FIRE_PROTECTION',
    tradeName: 'Fire Protection (Sprinklers, Hosereels & Alarms)',
    description: 'Fire booster pumps, sprinkler pipework, flow switches, smoke detectors, alarm panel and gas suppression.',
    defaultWeights: {
      equipment: 35, // Fire pumps, alarm panel, clean agent cylinders
      materials: 35, // Galvanised heavy steel pipes, sprinkler heads
      labour: 20,    // Overhead pipe hanging, welding, grooving
      testingCommissioning: 4, // Hydrostatic test, SCDF inspection prep
      overheadProfit: 6
    },
    recommendedSeries: {
      equipmentSeriesId: 'SINGSTAT-IPI-DIV74-PUMPS',
      materialsSeriesId: 'SINGSTAT-DSPI-DIV67',
      labourSeriesId: 'SINGSTAT-ULC-CONST'
    },
    overheadProfitEscalationFactor: 1.0
  },
  LIFTS_ESCALATORS: {
    tradeId: 'LIFTS_ESCALATORS',
    tradeName: 'Lifts & Escalators',
    description: 'Passenger elevators, freight lifts, escalators, guide rails, traction machines and landing doors.',
    defaultWeights: {
      equipment: 55, // Traction motor, car cab, VVVF drive, door operator
      materials: 15, // Guide rails, counterweights, traveling cables
      labour: 20,    // Shaft installation, alignment, scaffolding
      testingCommissioning: 5, // Full load test, BCA safety certification
      overheadProfit: 5
    },
    recommendedSeries: {
      equipmentSeriesId: 'SINGSTAT-IPI-DIV74-PUMPS',
      materialsSeriesId: 'SINGSTAT-DSPI-DIV67',
      labourSeriesId: 'SINGSTAT-ULC-CONST'
    },
    overheadProfitEscalationFactor: 1.0
  },
  BMS_CONTROLS: {
    tradeId: 'BMS_CONTROLS',
    tradeName: 'BMS, Controls & Instrumentation',
    description: 'Direct digital controllers, temperature/humidity/CO2 sensors, control valves, BACnet integration, workstation graphics.',
    defaultWeights: {
      equipment: 40, // DDC controllers, field sensors, motorized actuators
      materials: 15, // Shielded signal cables, control conduits
      labour: 25,    // Point-to-point wiring, control panel fabrication
      testingCommissioning: 15, // Software loop tuning, sequence testing
      overheadProfit: 5
    },
    recommendedSeries: {
      equipmentSeriesId: 'SINGSTAT-IPI-DIV75-BMS-ELV',
      materialsSeriesId: 'SINGSTAT-DSPI-DIV77-CABLE',
      labourSeriesId: 'SINGSTAT-ULC-CONST'
    },
    overheadProfitEscalationFactor: 1.0
  },
  ELV_SECURITY: {
    tradeId: 'ELV_SECURITY',
    tradeName: 'ELV, Security, CCTV & Access Control',
    description: 'IP surveillance cameras, card readers, turnstiles, public address, structured cabling and server racks.',
    defaultWeights: {
      equipment: 45, // NVR servers, IP cameras, magnetic locks, readers
      materials: 20, // Cat6A STP cables, fiber backbones, patch panels
      labour: 20,    // Cable pulling, mounting, device addressing
      testingCommissioning: 8, // Camera angle focus, access matrix setup
      overheadProfit: 7
    },
    recommendedSeries: {
      equipmentSeriesId: 'SINGSTAT-IPI-DIV75-BMS-ELV',
      materialsSeriesId: 'SINGSTAT-DSPI-DIV77-CABLE',
      labourSeriesId: 'SINGSTAT-ULC-CONST'
    },
    overheadProfitEscalationFactor: 1.0
  }
};
