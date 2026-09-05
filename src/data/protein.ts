import type { AnalysisData } from '../types';

const sources = [
  { id: 'pr-s1', title: 'Euromonitor International — Global Sports Nutrition Market, 2026', publisher: 'Euromonitor', date: '2026-02-22', snippet: 'Sports & active nutrition reached $28.4B in 2025, growing 8.6% YoY, with protein RTDs as the fastest subcategory…' },
  { id: 'pr-s2', title: 'Mintel — Daily Protein Snacking Trends, 2026', publisher: 'Mintel', date: '2026-04-05', snippet: '52% of consumers say they want more protein in everyday foods; 38% would switch brands for higher protein…' },
  { id: 'pr-s3', title: 'Simply Good Foods Co. FY2026 Annual Report (Form 10-K)', publisher: 'SEC EDGAR', date: '2026-06-12', snippet: 'Quest Nutrition revenue grew 11% to $1.6B led by protein bars and crisps…' },
  { id: 'pr-s4', title: 'Oikos Product Page — Triple Zero', publisher: 'yoplait.com', date: '2026-07-10', snippet: 'Triple Zero: 15g per 5.3oz cup, $1.49 SRP, available in 11 flavors…' },
  { id: 'pr-s5', title: 'MusclePharm Annual Investor Briefing', publisher: 'MusclePharm', date: '2026-03-19', snippet: 'MusclePharm 2025 revenue of $280M, with sports nutrition bars declining 6% YoY…' },
  { id: 'pr-s6', title: 'SPINS — Natural Channel Protein Report, 2026', publisher: 'SPINS', date: '2026-05-15', snippet: 'Whey protein prices spiked 14% in 2025; pea and fava blends are now 11% of new launches…' },
  { id: 'pr-s7', title: 'NielsenIQ — RTD Beverage Protein Trends, 2026', publisher: 'NielsenIQ', date: '2026-04-29', snippet: 'High-protein RTD beverages grew 22% YoY; private label captured 17% of incremental dollars…' },
  { id: 'pr-s8', title: 'Olipop 2026 Brand Press', publisher: 'Modern Retail', date: '2026-06-14', snippet: 'Olipop crossed $500M revenue with a 5g plant-protein, low-sugar functional soda line…' },
];

const competitors = [
  {
    id: 'prc1', name: 'Quest Nutrition', logoColor: 'bg-amber-500',
    description: 'Mass-market protein bar & crispy leader; recently expanded into RTD shakes and salty snacks.',
    funding: 'Simply Good Foods subsidiary', founded: '2010', hq: 'Los Angeles, CA',
    marketShare: 14, growthRate: 11, pricingTier: 'Paid' as const, marketPosition: 'Leader' as const,
    strengths: ['Mass distribution', 'Loyal brand', 'Strong bar format'],
    weaknesses: ['Whey-protein dependency', 'Limited premium positioning'],
    swot: {
      strengths: ['Distribution', 'Brand', 'Operational scale'],
      weaknesses: ['Premium gap', 'Whey supply'],
      opportunities: ['RTD expansion', 'International'],
      threats: ['Plant-based brands', 'Private label'],
    },
    explanation: {
      summary: 'Quest is the volume leader — your benchmark for distribution, not differentiation.',
      whyItMatters: [
        'Their shelf presence at Walmart/Target sets the price ceiling for your bar SKU.',
        'Their whey-supply exposure is your positioning wedge with plant-protein claims.',
      ],
      evidence: [
        { label: 'Revenue', detail: '$1.6B in 2025; +11% YoY (s3).' },
        { label: 'Supply risk', detail: 'Whey prices +14% in 2025 (s6).' },
      ],
      sources: [sources[2], sources[5]],
    },
  },
  {
    id: 'prc2', name: 'Oikos (Triple Zero)', logoColor: 'bg-sky-600',
    description: 'Greek-yogurt leader with the Triple Zero line; the reference protein snack for grocery aisles.',
    funding: 'Danone', founded: '1995', hq: 'White Plains, NY',
    marketShare: 18, growthRate: 7, pricingTier: 'Paid' as const, marketPosition: 'Leader' as const,
    strengths: ['Grocery ubiquity', 'Strong margin', 'Multi-flavor line'],
    weaknesses: ['Dairy-only', 'Mid-protein (15g)'],
    swot: {
      strengths: ['Grocery shelf', 'Brand recall', 'Promo power'],
      weaknesses: ['Dairy-only', 'Limited novelty'],
      opportunities: ['High-protein variants', 'Plant-based'],
      threats: ['DTC challengers', 'Private label'],
    },
    explanation: {
      summary: 'Oikos is the grocery-aisle incumbent — strong but locked into a 15g protein ceiling.',
      whyItMatters: [
        'Their $1.49 SRP defines the everyday price band.',
        'Their flavor expansion pace is what your line must beat for press.',
      ],
      evidence: [
        { label: 'Distribution', detail: 'In 95% of US grocery (s4).' },
        { label: 'Price', detail: '$1.49 SRP, 11 flavors (s4).' },
      ],
      sources: [sources[3]],
    },
  },
  {
    id: 'prc3', name: 'Olipop', logoColor: 'bg-rose-500',
    description: 'Functional soda with 5g plant-protein per can; the fastest-growing brand in everyday nutrition.',
    funding: '$43M Series C', founded: '2018', hq: 'Oakland, CA',
    marketShare: 4, growthRate: 95, pricingTier: 'Paid' as const, marketPosition: 'Emerging' as const,
    strengths: ['Viral brand', 'Plant-protein', 'DTC + retail blend'],
    weaknesses: ['Tiny scale vs incumbents', 'Higher COGS'],
    swot: {
      strengths: ['Brand momentum', 'Plant-protein halo'],
      weaknesses: ['COGS', 'Single format'],
      opportunities: ['International', 'Adjacencies'],
      threats: ['Copycats', 'C-store pushback'],
    },
    explanation: {
      summary: 'Olipop is the bellwether — small, fast, premium. Their playbook is the one to study.',
      whyItMatters: [
        'Their 5g plant-protein claim redefined "everyday" nutrition.',
        'Their growth rate (95% YoY) is the trend indicator for the category.',
      ],
      evidence: [
        { label: 'Growth', detail: '95% YoY; crossed $500M (s8).' },
        { label: 'Pricing', detail: '$2.99–$3.49 per can (s8).' },
      ],
      sources: [sources[7]],
    },
  },
  {
    id: 'prc4', name: 'MusclePharm', logoColor: 'bg-indigo-700',
    description: 'Legacy sports-nutrition brand; bar line declining but protein powder steady.',
    funding: 'Public (NASDAQ: MSLP)', founded: '2008', hq: 'Denver, CO',
    marketShare: 3, growthRate: -6, pricingTier: 'Paid' as const, marketPosition: 'Niche' as const,
    strengths: ['Gym distribution', 'Athlete legacy'],
    weaknesses: ['Brand fatigue', 'Declining bar sales'],
    swot: {
      strengths: ['Distribution to gyms'],
      weaknesses: ['Brand relevance'],
      opportunities: ['Reformulate', 'Reposition'],
      threats: ['DTC challengers', 'Distribution loss'],
    },
    explanation: {
      summary: 'MusclePharm is a cautionary tale — what happens when the brand goes stale.',
      whyItMatters: [
        'Their decline is your retention lesson.',
        'Their gym channel is still a worthwhile sampling partner.',
      ],
      evidence: [
        { label: 'Revenue', detail: '$280M, bars down 6% (s5).' },
      ],
      sources: [sources[4]],
    },
  },
];

const products = [
  {
    id: 'prpr1', competitorId: 'prc1', name: 'Quest Bar Line',
    tagline: 'High-protein, low-sugar mass-market bar', category: 'Protein Bar', pricingModel: 'Tiered' as const, startingPrice: 2.49,
    features: [
      { id: 'prpf1', name: '20g Whey Protein', description: 'Standard across line.', maturity: 'GA' as const, adoption: 95 },
      { id: 'prpf2', name: '1g Sugar', description: 'Category-defining low-sugar claim.', maturity: 'GA' as const, adoption: 96 },
      { id: 'prpf3', name: 'Variety Pack', description: '12-bar pack for trial + bulk.', maturity: 'GA' as const, adoption: 82 },
      { id: 'prpf4', name: 'Crispy Bar', description: 'Texture extension launched 2024.', maturity: 'GA' as const, adoption: 64 },
      { id: 'prpf5', name: 'Plant-Based Bar', description: 'Plant-only bar for flexitarians.', maturity: 'Beta' as const, adoption: 21 },
    ],
    explanation: {
      summary: 'Quest sets the table for the protein bar category — feature parity is the bar to clear.',
      whyItMatters: [
        'Their 20g claim is the floor for any new bar SKU.',
        'Their plant-based bar is your most direct competition if you go plant.',
      ],
      evidence: [
        { label: 'Adoption', detail: '95% brand awareness among protein-bar buyers (s3).' },
      ],
      sources: [sources[2]],
    },
  },
  {
    id: 'prpr2', competitorId: 'prc2', name: 'Oikos Triple Zero',
    tagline: 'Zero added sugar, high-protein Greek yogurt', category: 'High-Protein Yogurt', pricingModel: 'Tiered' as const, startingPrice: 1.49,
    features: [
      { id: 'prpf6', name: '15g Protein', description: 'Standard 5.3oz cup.', maturity: 'GA' as const, adoption: 94 },
      { id: 'prpf7', name: 'Zero Added Sugar', description: 'Brand-defining claim.', maturity: 'GA' as const, adoption: 92 },
      { id: 'prpf8', name: '11 Flavors', description: 'Flavor range as moat.', maturity: 'GA' as const, adoption: 88 },
      { id: 'prpf9', name: 'High-Protein Plus', description: '22g protein variant.', maturity: 'Beta' as const, adoption: 18 },
    ],
    explanation: {
      summary: 'Oikos defines the grocery-aisle protein snack — your category benchmark.',
      whyItMatters: [
        'Their $1.49 SRP is the price ceiling for everyday snacks.',
        'Their 22g "Plus" SKU is the playbook for high-protein variants.',
      ],
      evidence: [
        { label: 'Price', detail: '$1.49 SRP, 11 flavors (s4).' },
      ],
      sources: [sources[3]],
    },
  },
  {
    id: 'prpr3', competitorId: 'prc3', name: 'Olipop Functional Soda',
    tagline: '5g plant-protein, low-sugar functional soda', category: 'Functional Beverage', pricingModel: 'Flat' as const, startingPrice: 2.99,
    features: [
      { id: 'prpf10', name: '5g Plant Protein', description: 'From fava/pea blend.', maturity: 'GA' as const, adoption: 88 },
      { id: 'prpf11', name: '2–5g Sugar', description: 'Compared to 35g+ in regular soda.', maturity: 'GA' as const, adoption: 92 },
      { id: 'prpf12', name: 'Prebiotic Fiber', description: '9g per can.', maturity: 'GA' as const, adoption: 86 },
      { id: 'prpf13', name: 'Variety Pack 12', description: 'Subscription + retail.', maturity: 'GA' as const, adoption: 78 },
    ],
    explanation: {
      summary: 'Olipop redefined what "everyday nutrition" looks like — a premium, plant-forward, can-format product.',
      whyItMatters: [
        'Their pricing band ($2.99+) proves everyday buyers will pay more for a better story.',
        'Their plant-protein + prebiotic claim is the new baseline you should match.',
      ],
      evidence: [
        { label: 'Adoption', detail: '5g plant-protein claim cited in 80% of their press (s8).' },
      ],
      sources: [sources[7]],
    },
  },
  {
    id: 'prpr4', competitorId: 'prc4', name: 'MusclePharm Combat Bar',
    tagline: 'High-protein, gym-channel legacy bar', category: 'Protein Bar', pricingModel: 'Tiered' as const, startingPrice: 2.79,
    features: [
      { id: 'prpf14', name: '20g Protein', description: 'Standard whey.', maturity: 'GA' as const, adoption: 70 },
      { id: 'prpf15', name: 'Gym Channel', description: 'Long-time distribution moat.', maturity: 'GA' as const, adoption: 60 },
      { id: 'prpf16', name: 'Combat Crunch', description: 'Texture extension.', maturity: 'GA' as const, adoption: 55 },
    ],
    explanation: {
      summary: 'MusclePharm shows what happens when a category leader fails to evolve — useful as a counter-pattern.',
      whyItMatters: [
        'Avoid their reliance on gym-channel only — go omnichannel from day one.',
        'Their texture innovations show what bar format can look like.',
      ],
      evidence: [
        { label: 'Trend', detail: 'Bar sales declining 6% YoY (s5).' },
      ],
      sources: [sources[4]],
    },
  },
];

const pricingTiers = [
  { id: 'prpt1', competitorId: 'prc1', name: 'Quest Bar Single', priceMonthly: 2.49, billing: 'monthly' as const, features: ['20g whey protein', '1g sugar', '8 flavors'], bestFor: 'Trial', highlighted: true },
  { id: 'prpt2', competitorId: 'prc1', name: 'Quest Variety 12', priceMonthly: 24.99, billing: 'monthly' as const, features: ['12-bar pack', 'Mix of 4 flavors'], bestFor: 'Bulk' },
  { id: 'prpt3', competitorId: 'prc1', name: 'Quest RTD 4-pack', priceMonthly: 12.99, billing: 'monthly' as const, features: ['4× RTD shakes', '28g protein each'], bestFor: 'On-the-go' },

  { id: 'prpt4', competitorId: 'prc2', name: 'Oikos Triple Zero 5.3oz', priceMonthly: 1.49, billing: 'monthly' as const, features: ['15g protein', 'Zero added sugar', '11 flavors'], bestFor: 'Everyday' },
  { id: 'prpt5', competitorId: 'prc2', name: 'Oikos Plus 22g', priceMonthly: 1.99, billing: 'monthly' as const, features: ['22g protein', 'Greek yogurt'], bestFor: 'High-protein', highlighted: true },

  { id: 'prpt6', competitorId: 'prc3', name: 'Olipop Single Can', priceMonthly: 2.99, billing: 'monthly' as const, features: ['5g plant protein', '2–5g sugar', 'Prebiotic fiber'], bestFor: 'Everyday' },
  { id: 'prpt7', competitorId: 'prc3', name: 'Olipop Variety 12', priceMonthly: 34.99, billing: 'monthly' as const, features: ['12 cans', 'Variety pack'], bestFor: 'Subscription', highlighted: true },

  { id: 'prpt8', competitorId: 'prc4', name: 'Combat Bar Single', priceMonthly: 2.79, billing: 'monthly' as const, features: ['20g protein', 'Texture crunch'], bestFor: 'Gym channel' },
];

const marketGaps = [
  {
    id: 'prg1', title: 'Plant-protein everyday snacks at grocery price',
    description: 'Plant protein today is mostly premium. A grocery-priced plant-protein bar/cookie/Yogurt is a credible gap.',
    opportunityScore: 86, difficultyScore: 60, estimatedRevenue: '$110M ARR by 2028',
    affectedSegments: ['Flexitarian households', 'Allergen-avoiders'],
    explanation: {
      summary: 'A price-positioned plant-protein everyday SKU is the cleanest category gap.',
      whyItMatters: [
        'Plant-protein supply is becoming cheaper and more reliable (s6).',
        'Most plant brands still charge a 30–50% premium — that\'s your wedge.',
      ],
      evidence: [
        { label: 'Buyer signal', detail: '38% of consumers would switch brands for higher protein (s2).' },
        { label: 'Supply', detail: 'Pea/fava blends now 11% of new launches (s6).' },
      ],
      sources: [sources[1], sources[5]],
    },
  },
  {
    id: 'prg2', title: 'High-protein RTD beverages beyond 20g',
    description: 'Most RTD protein stops at 20g; a 30g+ protein RTD with low sugar is a clear technical gap.',
    opportunityScore: 78, difficultyScore: 72, estimatedRevenue: '$85M ARR by 2028',
    affectedSegments: ['Active nutrition buyers', 'Post-workout'],
    explanation: {
      summary: 'A 30g RTD at <5g sugar would unlock a credible "replaces a meal" claim.',
      whyItMatters: [
        'It positions you above Oikos and below meal replacements — an under-served middle.',
        'RTDs are the fastest-growing subcategory (s7).',
      ],
      evidence: [
        { label: 'Growth', detail: 'High-protein RTDs grew 22% YoY (s7).' },
      ],
      sources: [sources[6]],
    },
  },
  {
    id: 'prg3', title: 'Allergen-free everyday protein',
    description: 'Dairy, soy and gluten are top allergens. A top-9 allergen-free, everyday protein product is missing.',
    opportunityScore: 73, difficultyScore: 55, estimatedRevenue: '$60M ARR by 2028',
    affectedSegments: ['Allergen households', 'Schools'],
    explanation: {
      summary: 'Allergen-free is a quietly large segment — under-served by the current top 4.',
      whyItMatters: [
        'Schools and parents are a sticky distribution channel.',
        'Allergen-free is a regulatory moat against copycats.',
      ],
      evidence: [
        { label: 'Buyer signal', detail: '32% of households report an active food-allergen avoidance (s2).' },
      ],
      sources: [sources[1]],
    },
  },
  {
    id: 'prg4', title: 'Private-label protein quality gap',
    description: 'Private-label is winning incremental dollars but is widely seen as "low-quality". A premium private-label partner is a fast B2B opportunity.',
    opportunityScore: 64, difficultyScore: 48, estimatedRevenue: '$40M ARR',
    affectedSegments: ['Grocery private label', 'Big-box retailers'],
    explanation: {
      summary: 'Private label needs a credible "premium" partner — that\'s a 1–2-year B2B opportunity.',
      whyItMatters: [
        'PL captured 17% of incremental RTD dollars last year (s7).',
        'You don\'t need a D2C brand to participate in this growth.',
      ],
      evidence: [
        { label: 'Data source', detail: 'NielsenIQ RTD trends (s7).' },
      ],
      sources: [sources[6]],
    },
  },
];

const insights = [
  {
    id: 'pri1', title: 'Quest\'s whey dependency is your plant-protein opening',
    category: 'Opportunity' as const, impact: 'High' as const, confidence: 84,
    summary: 'Whey prices are volatile (+14% in 2025). Plant-protein is the cleaner supply story.',
    detail: 'A plant-first portfolio is more than a trend — it\'s a cost-stability story you can tell to retailers.',
    relatedCompetitors: ['prc1'],
    explanation: {
      summary: 'Plant-protein is both a marketing story and a cost story.',
      whyItMatters: [
        'Retailers hedge against whey price spikes by adding a plant SKU.',
        'Plant-protein unlocks allergen-free segments.',
      ],
      evidence: [
        { label: 'Whey prices', detail: '+14% in 2025 (s6).' },
        { label: 'Plant launches', detail: '11% of new launches now plant-based (s6).' },
      ],
      sources: [sources[5]],
    },
  },
  {
    id: 'pri2', title: 'Olipop\'s growth shows premium everyday nutrition works',
    category: 'Trend' as const, impact: 'High' as const, confidence: 91,
    summary: 'A premium ($2.99+), plant-forward everyday can-format product scaled to $500M.',
    detail: 'Use Olipop\'s playbook: founder-led brand, plant-protein halo, DTC + retail blend.',
    relatedCompetitors: ['prc3'],
    explanation: {
      summary: 'Premium everyday nutrition is a $500M+ category-defining opportunity.',
      whyItMatters: [
        'It shows consumers will pay $1.50–$2.00 above mass for a credible story.',
        'It gives you a comparable benchmark for press and retailers.',
      ],
      evidence: [
        { label: 'Revenue', detail: 'Crossed $500M in 2025 (s8).' },
        { label: 'Growth', detail: '95% YoY (s8).' },
      ],
      sources: [sources[7]],
    },
  },
  {
    id: 'pri3', title: 'Oikos\' 15g protein is now table stakes',
    category: 'Risk' as const, impact: 'Medium' as const, confidence: 86,
    summary: 'Anything below 15g protein in the yogurt/snack aisle will read as yesterday.',
    detail: 'Plan a 22g+ flagship SKU to avoid the "yesterday\'s protein" trap.',
    relatedCompetitors: ['prc2'],
    explanation: {
      summary: 'Set a higher bar than the category floor on day one.',
      whyItMatters: [
        '15g is no longer a differentiator — it\'s the entry price.',
        'A 22g SKU is the new premium anchor.',
      ],
      evidence: [
        { label: 'Adoption', detail: '94% of Oikos buyers cite 15g as the key claim (s4).' },
      ],
      sources: [sources[3]],
    },
  },
  {
    id: 'pri4', title: 'Avoid gym-channel-only distribution',
    category: 'Recommendation' as const, impact: 'Medium' as const, confidence: 75,
    summary: 'MusclePharm\'s decline was distribution-shaped. Plan omnichannel from day one.',
    detail: 'Build a retail-ready brand from day one — not a gym-only brand that needs to be re-platformed later.',
    relatedCompetitors: ['prc4'],
    explanation: {
      summary: 'Distribution shape is a category outcome, not a starting point.',
      whyItMatters: [
        'Omnichannel brands command higher reorder rates.',
        'Retailers need a brand built for their channel.',
      ],
      evidence: [
        { label: 'Pattern', detail: 'MusclePharm bar sales -6% YoY (s5).' },
      ],
      sources: [sources[4]],
    },
  },
];

const actionPlan = [
  { id: 'pra1', title: 'Launch plant-first 22g protein bar', owner: 'Product + Ops', priority: 'P0' as const, horizon: 'Now' as const, effort: 'High' as const, impact: 'High' as const, description: 'Top-9 allergen-free, 22g plant protein bar at $2.79 SRP.', rationale: 'Plant-protein + 22g is the new category ceiling — see insight pri1/pri3.' },
  { id: 'pra2', title: 'Launch 30g RTD shake', owner: 'Product + Ops', priority: 'P0' as const, horizon: 'Now' as const, effort: 'High' as const, impact: 'High' as const, description: '30g plant-protein RTD, <5g sugar, $3.99 SRP.', rationale: 'Clear gap at 20g+ RTDs, see insight prg2.' },
  { id: 'pra3', title: 'Build retail-ready brand kit', owner: 'Brand + Sales', priority: 'P0' as const, horizon: 'Now' as const, effort: 'Medium' as const, impact: 'High' as const, description: 'Planogram, sell sheet, promo calendar — for retail from day one.', rationale: 'Avoid the MusclePharm trap, see insight pri4.' },
  { id: 'pra4', title: 'Secure plant-protein supply', owner: 'Ops', priority: 'P1' as const, horizon: 'Now' as const, effort: 'Medium' as const, impact: 'High' as const, description: 'Long-term contracts on plant-protein suppliers.', rationale: 'Lock in margin and protect against whey-style price spikes.' },
  { id: 'pra5', title: 'Private-label partnership pipeline', owner: 'Sales', priority: 'P1' as const, horizon: 'Next' as const, effort: 'Low' as const, impact: 'Medium' as const, description: 'Outreach to 3 grocery buyers with the 22g bar SKU as proof point.', rationale: 'PL is the fastest incremental dollars channel, see insight prg4.' },
  { id: 'pra6', title: 'Olipop-comparable functional beverage', owner: 'Product', priority: 'P2' as const, horizon: 'Later' as const, effort: 'High' as const, impact: 'High' as const, description: 'Functional soda/seltzer with plant-protein + low sugar.', rationale: 'Watch Olipop\'s trajectory and enter if unit economics clear.' },
];

const reports = [
  {
    id: 'prr1', title: 'Prota Foods — Competitive Landscape, Sep 2026',
    type: 'Executive Summary' as const, date: '2026-09-01', pages: 9,
    summary: 'Where Prota wins, where it loses, and the three moves that matter most this half.',
    sections: [
      { heading: 'TL;DR', body: 'Everyday nutrition is growing 9% YoY. Plant-protein is the rising floor. Prota\'s wedge is plant-first, allergen-free, 22g+.' },
      { heading: 'Market', body: 'Sports & active nutrition $28.4B; high-protein RTD growing 22% YoY.' },
      { heading: 'Top 3 Moves', body: '1) Launch 22g plant-protein bar. 2) Launch 30g RTD. 3) Build retail-ready brand kit.' },
    ],
    explanation: {
      summary: 'A board-ready summary of where Prota stands and what to do about it.',
      whyItMatters: [
        'Aligns product, ops and sales on the same set of moves.',
        'Use as the canonical internal narrative for the next 90 days.',
      ],
      evidence: [
        { label: 'Market', detail: 'Euromonitor 2026 (s1).' },
        { label: 'RTD growth', detail: 'NielsenIQ 2026 (s7).' },
      ],
      sources: [sources[0], sources[6]],
    },
  },
  {
    id: 'prr2', title: 'Deep Dive: Protein Pricing & Distribution',
    type: 'Deep Dive' as const, date: '2026-09-01', pages: 16,
    summary: 'A side-by-side pricing + distribution analysis across Quest, Oikos, Olipop and MusclePharm.',
    sections: [
      { heading: 'Price bands', body: 'Three viable bands: grocery ($1.49), mass-premium ($2.49–$3.49), functional ($3.99+).' },
      { heading: 'Distribution', body: 'Grocery ubiquity (Oikos) vs DTC+retail blend (Olipop) vs gym-only (MusclePharm).' },
      { heading: 'Recommendation', body: 'Anchor at $2.79 bar + $3.99 RTD with a retail-ready launch plan.' },
    ],
    explanation: {
      summary: 'Use this to set launch pricing and distribution strategy.',
      whyItMatters: [
        'Pricing and distribution shape together determine category position.',
        'Retailers compare across these two axes.',
      ],
      evidence: [
        { label: 'Data source', detail: 'Public pricing pages + 10-Ks (s3, s4, s5, s8).' },
      ],
      sources: [sources[2], sources[3], sources[4], sources[7]],
    },
  },
  {
    id: 'prr3', title: 'Go-to-Market: Plant-Protein Bar Launch',
    type: 'Go-to-Market' as const, date: '2026-09-01', pages: 11,
    summary: 'A 3-quarter plan to land a plant-protein bar at grocery.',
    sections: [
      { heading: 'ICP', body: 'Flexitarian households, allergen-avoiders, active nutrition buyers.' },
      { heading: 'Motion', body: 'DTC validation → natural channel → mainstream grocery → club.' },
      { heading: 'Pricing', body: '$2.79 SRP with a 4-pack at $9.99 to drive trial.' },
    ],
    explanation: {
      summary: 'A concrete GTM plan for the plant-protein bar SKU.',
      whyItMatters: [
        'Translates insight into a sequenced set of decisions.',
        'Aligns ops, sales and brand investments.',
      ],
      evidence: [
        { label: 'Buyer demand', detail: '38% would switch brands for higher protein (s2).' },
        { label: 'Supply', detail: 'Pea/fava now 11% of new launches (s6).' },
      ],
      sources: [sources[1], sources[5]],
    },
  },
];

const charts = {
  marketShare: {
    title: 'Estimated everyday protein market share',
    kind: 'bar' as const, xLabel: 'Brand', yLabel: 'Share (%)',
    series: [
      { id: 'prm1', name: 'Share', color: '#10a37f', points: [
        { label: 'Quest', value: 14 },
        { label: 'Oikos', value: 18 },
        { label: 'Olipop', value: 4 },
        { label: 'MusclePharm', value: 3 },
        { label: 'Others', value: 61 },
      ]},
    ],
    explanation: {
      summary: 'A long-tail market — even leaders have only mid-teens share.',
      whyItMatters: [
        'You do not need to dethrone anyone to build a $50M brand.',
        'The category has room for new entrants with a credible story.',
      ],
      evidence: [
        { label: 'Data source', detail: 'Euromonitor 2026 (s1).' },
      ],
      sources: [sources[0]],
    },
  },
  growth: {
    title: 'YoY revenue growth by brand',
    kind: 'line' as const, xLabel: 'Year', yLabel: 'YoY growth (%)',
    series: [
      { id: 'prg1', name: 'Quest', color: '#f59e0b', points: [
        { label: '2023', value: 9 }, { label: '2024', value: 10 }, { label: '2025', value: 11 }, { label: '2026', value: 11 },
      ]},
      { id: 'prg2', name: 'Oikos', color: '#0284c7', points: [
        { label: '2023', value: 6 }, { label: '2024', value: 6 }, { label: '2025', value: 7 }, { label: '2026', value: 7 },
      ]},
      { id: 'prg3', name: 'Olipop', color: '#f43f5e', points: [
        { label: '2023', value: 50 }, { label: '2024', value: 78 }, { label: '2025', value: 95 }, { label: '2026', value: 95 },
      ]},
      { id: 'prg4', name: 'MusclePharm', color: '#4f46e5', points: [
        { label: '2023', value: -2 }, { label: '2024', value: -3 }, { label: '2025', value: -6 }, { label: '2026', value: -6 },
      ]},
    ],
    explanation: {
      summary: 'Olipop is the outlier — incumbents are steady, Olipop is the disruptor, MusclePharm is the warning.',
      whyItMatters: [
        'Olipop\'s growth rate sets the ceiling for what is possible at premium.',
        'MusclePharm\'s decline sets the floor for what is dangerous to ignore.',
      ],
      evidence: [
        { label: 'Data source', detail: 'Brand reviews + SEC filings (s3, s5, s8).' },
      ],
      sources: [sources[2], sources[4], sources[7]],
    },
  },
  pricing: {
    title: 'Average single-SKU price (USD)',
    kind: 'bar' as const, xLabel: 'Product', yLabel: 'USD',
    series: [
      { id: 'prp1', name: 'Price', color: '#0ea5e9', points: [
        { label: 'Quest Bar', value: 2.49 },
        { label: 'Oikos TZ', value: 1.49 },
        { label: 'Oikos Plus', value: 1.99 },
        { label: 'Olipop', value: 2.99 },
        { label: 'Combat Bar', value: 2.79 },
      ]},
    ],
    explanation: {
      summary: 'Three price bands — grocery, mass-premium and functional — define the white space.',
      whyItMatters: [
        'Your launch SKU is most defensible at the $2.79–$3.99 band.',
        'Pricing below $1.49 signals "low quality"; above $4 signals "specialized".',
      ],
      evidence: [
        { label: 'Data source', detail: 'Public pricing pages, Aug 2026 (s3, s4, s5, s8).' },
      ],
      sources: [sources[2], sources[3], sources[4], sources[7]],
    },
  },
  featureAdoption: {
    title: 'Adoption of "next-gen" features (%)',
    kind: 'area' as const, xLabel: 'Feature', yLabel: 'Adoption (%)',
    series: [
      { id: 'prf1', name: 'Quest', color: '#f59e0b', points: [
        { label: '20g protein', value: 95 },
        { label: 'Plant option', value: 21 },
        { label: 'RTD shake', value: 48 },
        { label: 'Variety pack', value: 82 },
      ]},
      { id: 'prf2', name: 'Oikos', color: '#0284c7', points: [
        { label: '20g protein', value: 18 },
        { label: 'Plant option', value: 0 },
        { label: 'RTD shake', value: 0 },
        { label: 'Variety pack', value: 24 },
      ]},
      { id: 'prf3', name: 'Olipop', color: '#f43f5e', points: [
        { label: '20g protein', value: 0 },
        { label: 'Plant option', value: 100 },
        { label: 'RTD shake', value: 0 },
        { label: 'Variety pack', value: 78 },
      ]},
    ],
    explanation: {
      summary: 'Plant protein is the new axis of competition — only Olipop has fully committed.',
      whyItMatters: [
        'Quest\'s plant-based bar is in beta (21%); Olipop is plant-only.',
        'A plant-first launch can credibly own a position.',
      ],
      evidence: [
        { label: 'Data source', detail: 'Public brand materials (s3, s4, s8).' },
      ],
      sources: [sources[2], sources[3], sources[7]],
    },
  },
};

const initialMessages = [
  {
    id: 'prm0', role: 'assistant' as const,
    text: `I\'ve finished a first pass on the competitive landscape for **Prota Foods**. Here\'s a quick orientation:

- The everyday protein market is **$28.4B and growing 8.6% YoY** (Euromonitor).
- **Quest** and **Oikos** are the two incumbents that matter most for your distribution.
- **Olipop** is the fastest-growing disruptor — their playbook is the one to study.
- **MusclePharm** is the cautionary tale — what happens when the brand goes stale.

Try: "Show me a SWOT for Olipop", "Compare pricing across the top 3", or "Where are the biggest gaps?"`,
    createdAt: Date.now() - 1000 * 60 * 30,
  },
];

export const proteinAnalysis: AnalysisData = {
  businessName: 'Prota Foods',
  industry: 'Everyday nutrition (protein snacks, drinks, bars)',
  idea: 'A plant-first line of 22g+ protein bars and 30g RTD shakes with allergen-free positioning.',
  targetCustomers: 'Flexitarian millennials and Gen Z, active nutrition buyers, allergen-aware households.',
  geography: 'US-first via natural + mainstream grocery; expanding to EU + MENA.',
  businessModel: 'Plant-first, allergen-free, 22g+ protein at everyday price.',
  researchGoals: ['Land in 1,000 doors in 12 months', 'Drive 35% of revenue via DTC subscriptions', 'Open EU retail in 2 quarters'],
  profile: {
    businessName: 'Prota Foods',
    idea: 'A plant-first line of 22g+ protein bars and 30g RTD shakes with allergen-free positioning.',
    industry: 'Everyday nutrition (protein snacks, drinks, bars)',
    targetCustomers: 'Flexitarian millennials and Gen Z, active nutrition buyers, allergen-aware households.',
    geography: 'US-first via natural + mainstream grocery; expanding to EU + MENA.',
    businessModel: 'Plant-first, allergen-free, 22g+ protein at everyday price.',
    competitors: ['Quest', 'Oikos', 'Olipop', 'MusclePharm'],
    researchGoals: ['Land in 1,000 doors in 12 months', 'Drive 35% of revenue via DTC subscriptions', 'Open EU retail in 2 quarters'],
  },
  competitors,
  products,
  pricingTiers,
  marketGaps,
  insights,
  recommendations: insights.slice(0, 2).map((i) => ({
    ...i,
    id: `rec-${i.id}`,
    title: `Recommend: ${i.title}`,
    category: 'Recommendation' as const,
  })),
  actionPlan,
  reports,
  charts,
  swot: {
    strengths: ['Growing protein market', 'Plant-first trend acceleration'],
    weaknesses: ['Whey price volatility', 'Private label encroachment'],
    opportunities: ['Plant-only positioning', 'DTC subscription model'],
    threats: ['Incumbent brand loyalty', 'Commodity protein prices'],
  },
  sources,
  conversation: initialMessages,
};