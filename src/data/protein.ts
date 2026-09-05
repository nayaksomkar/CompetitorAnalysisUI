import type { AnalysisData } from '../types';

const sources = [
  { id: 'pr-s1', title: 'RedSeer — India Sports Nutrition Market, 2026', publisher: 'RedSeer', date: '2026-02-22', snippet: 'Indian sports & active nutrition reached ₹8,500 Cr in 2025, growing 18% YoY, with protein bars as the fastest subcategory…' },
  { id: 'pr-s2', title: 'Mintel — Indian Protein Snacking Trends, 2026', publisher: 'Mintel', date: '2026-04-05', snippet: '58% of Indian consumers want more protein in everyday foods; 42% would switch brands for higher protein…' },
  { id: 'pr-s3', title: 'RiteBite Annual Report FY2026', publisher: 'RiteBite', date: '2026-06-12', snippet: 'RiteBite revenue grew 24% to ₹420 Cr led by protein bars and max protein chips…' },
  { id: 'pr-s4', title: 'Yoga Bar Product Page', publisher: 'yogabars.in', date: '2026-07-10', snippet: 'Protein bar: 20g per 60g bar, ₹149 SRP, available in 8 flavors…' },
  { id: 'pr-s5', title: 'MuscleBlaze Investor Briefing', publisher: 'MuscleBlaze', date: '2026-03-19', snippet: 'MuscleBlaze 2025 revenue of ₹580 Cr, with whey protein up 32% YoY…' },
  { id: 'pr-s6', title: 'IMARC — India Protein Supplements Report, 2026', publisher: 'IMARC', date: '2026-05-15', snippet: 'Whey protein prices spiked 12% in 2025; plant-protein blends now 15% of new launches…' },
  { id: 'pr-s7', title: 'NielsenIQ — India RTD Protein Trends, 2026', publisher: 'NielsenIQ', date: '2026-04-29', snippet: 'High-protein RTD beverages grew 28% YoY; private label captured 12% of incremental dollars…' },
  { id: 'pr-s8', title: 'Amway Nutrilite India Press', publisher: 'Amway India', date: '2026-06-14', snippet: 'Nutrilite crossed ₹1,200 Cr revenue with plant-protein positioning…' },
];

const competitors = [
  {
    id: 'prc1', name: 'RiteBite', logoColor: 'bg-amber-500',
    description: 'Pioneer of protein bars in India; recently expanded into max protein chips and snacks.',
    funding: '₹180 Cr Series C', founded: '2016', hq: 'Gurugram, India',
    marketShare: 18, growthRate: 24, pricingTier: 'Paid' as const, marketPosition: 'Leader' as const,
    strengths: ['Mass distribution', 'Strong brand', 'Wide retail presence'],
    weaknesses: ['Whey-protein dependency', 'Limited premium positioning'],
    swot: {
      strengths: ['Distribution', 'Brand', 'Operational scale'],
      weaknesses: ['Premium gap', 'Whey supply'],
      opportunities: ['RTD expansion', 'Tier-2 cities'],
      threats: ['Plant-based brands', 'Private label'],
    },
    explanation: {
      summary: 'RiteBite is the volume leader — your benchmark for distribution, not differentiation.',
      whyItMatters: [
        'Their shelf presence at modern trade sets the price ceiling for your bar SKU.',
        'Their whey-supply exposure is your positioning wedge with plant-protein claims.',
      ],
      evidence: [
        { label: 'Revenue', detail: '₹420 Cr in 2025; +24% YoY (s3).' },
        { label: 'Supply risk', detail: 'Whey prices +12% in 2025 (s6).' },
      ],
      sources: [sources[2], sources[5]],
    },
  },
  {
    id: 'prc2', name: 'Yoga Bar', logoColor: 'bg-green-600',
    description: 'Health-focused snack bar brand with strong DTC and retail presence.',
    funding: 'Montara Capital', founded: '2012', hq: 'Bangalore, India',
    marketShare: 14, growthRate: 18, pricingTier: 'Paid' as const, marketPosition: 'Challenger' as const,
    strengths: ['Health-conscious positioning', 'Strong DTC', 'Clean label'],
    weaknesses: ['Lower protein content', 'Limited flavor range'],
    swot: {
      strengths: ['Health positioning', 'DTC reach', 'Clean ingredients'],
      weaknesses: ['Lower protein', 'Limited novelty'],
      opportunities: ['High-protein variants', 'Gym partnerships'],
      threats: ['New entrants', 'Private label'],
    },
    explanation: {
      summary: 'Yoga Bar is the health-conscious incumbent — strong but locked into a 10g protein ceiling.',
      whyItMatters: [
        'Their ₹99 SRP defines the everyday price band.',
        'Their DTC playbook is what your site must beat for conversion.',
      ],
      evidence: [
        { label: 'Revenue', detail: '₹280 Cr retail revenue (s4).' },
        { label: 'Growth', detail: '18% YoY (s4).' },
      ],
      sources: [sources[3]],
    },
  },
  {
    id: 'prc3', name: 'MuscleBlaze', logoColor: 'bg-red-600',
    description: 'India\'s largest sports nutrition DTC brand with strong whey protein focus.',
    funding: '₹250 Cr Series B', founded: '2015', hq: 'Delhi, India',
    marketShare: 22, growthRate: 32, pricingTier: 'Paid' as const, marketPosition: 'Leader' as const,
    strengths: ['DTC-first', 'Strong whey portfolio', 'Influencer marketing'],
    weaknesses: ['Whey-only positioning', 'Limited food formats'],
    swot: {
      strengths: ['DTC dominance', 'Brand recall', 'Influencer reach'],
      weaknesses: ['Whey dependency', 'Limited food SKUs'],
      opportunities: ['Plant-protein line', 'International'],
      threats: ['Price competition', 'Raw material costs'],
    },
    explanation: {
      summary: 'MuscleBlaze is the DTC benchmark — wide assortment, strong whey focus.',
      whyItMatters: [
        'Their pricing band (₹1,200–₹2,500 for 1kg whey) is where your price needs to feel "premium yet reachable".',
        'Their DTC funnel defines the modern protein buyer journey.',
      ],
      evidence: [
        { label: 'Distribution', detail: 'Available on Amazon, Flipkart + own DTC (s6).' },
        { label: 'Growth', detail: '32% YoY (s6).' },
      ],
      sources: [sources[5]],
    },
  },
  {
    id: 'prc4', name: 'Amway Nutrilite', logoColor: 'bg-emerald-700',
    description: 'Global nutrition giant with strong plant-protein positioning in India.',
    funding: 'Amway Corporation', founded: '1949', hq: 'Ada, MI (India ops: Delhi)',
    marketShare: 12, growthRate: 15, pricingTier: 'Premium' as const, marketPosition: 'Challenger' as const,
    strengths: ['Plant-protein heritage', 'Global R&D', 'Strong distribution'],
    weaknesses: ['Premium pricing', 'MLM perception'],
    swot: {
      strengths: ['Plant-protein credentials', 'Global brand', 'R&D'],
      weaknesses: ['Price barrier', 'MLM stigma'],
      opportunities: ['DTC expansion', 'Tier-2 cities'],
      threats: ['DTC-native brands', 'Local competitors'],
    },
    explanation: {
      summary: 'Nutrilite is the plant-protein pioneer — premium and trusted, but expensive.',
      whyItMatters: [
        '15% growth shows the appetite for plant-protein in India.',
        'Their all-plant positioning is the easiest adjacency to copy.',
      ],
      evidence: [
        { label: 'Growth', detail: '15% YoY in India (s8).' },
        { label: 'Revenue', detail: '₹1,200 Cr in India (s8).' },
      ],
      sources: [sources[7]],
    },
  },
];

const products = [
  {
    id: 'prp1', competitorId: 'prc1', name: 'RiteBite Protein Bar',
    tagline: 'India\'s favorite protein bar', category: 'Protein Bar', pricingModel: 'Unit', startingPrice: 149,
    features: [
      { id: 'pf1', name: 'Chocolate Peanut Butter', description: 'Best-selling flavor, 20g protein.', maturity: 'GA' as const, adoption: 92 },
      { id: 'pf2', name: 'Berries & Nuts', description: 'Fruity nutty variant.', maturity: 'GA' as const, adoption: 85 },
      { id: 'pf3', name: 'Coffee Almond', description: 'Coffee-infused protein bar.', maturity: 'GA' as const, adoption: 78 },
      { id: 'pf4', name: 'Max Protein Chips', description: 'Savory protein snack extension.', maturity: 'Beta' as const, adoption: 35 },
      { id: 'pf5', name: 'Variety Pack', description: '8-bar assorted pack.', maturity: 'GA' as const, adoption: 72 },
    ],
    explanation: {
      summary: 'RiteBite\'s product is convenience, not just protein — a useful anchor.',
      whyItMatters: [
        'Their variety pack is the easiest trial format to launch.',
        'Their max protein chips show the savory opportunity.',
      ],
      evidence: [
        { label: 'SKU count', detail: '12 hero SKUs (s4).' },
        { label: 'Variety pack uptake', detail: '72% adoption (s4).' },
      ],
      sources: [sources[3]],
    },
  },
  {
    id: 'prp2', competitorId: 'prc2', name: 'Yoga Bar Protein',
    tagline: 'Clean-label health bars', category: 'Health Bar', pricingModel: 'Unit', startingPrice: 99,
    features: [
      { id: 'pf6', name: 'Chocolate Almond', description: 'Clean-label bestseller.', maturity: 'GA' as const, adoption: 88 },
      { id: 'pf7', name: 'Fruit & Nut', description: 'Natural ingredients focus.', maturity: 'GA' as const, adoption: 82 },
      { id: 'pf8', name: 'Quinoa Protein', description: 'Quinoa-based variant.', maturity: 'GA' as const, adoption: 75 },
      { id: 'pf9', name: 'Kids Bar', description: 'Children\'s nutrition extension.', maturity: 'GA' as const, adoption: 65 },
      { id: 'pf10', name: 'Immunity Bar', description: 'Vitamin-enriched variant.', maturity: 'Beta' as const, adoption: 28 },
    ],
    explanation: {
      summary: 'Yoga Bar\'s range leans on clean-label positioning plus a strong DTC funnel.',
      whyItMatters: [
        'Their clean-label story is the easiest trust signal to copy.',
        'Their kids bar shows the family opportunity.',
      ],
      evidence: [
        { label: 'Hero SKU share', detail: 'Top 5 bars = 75% of revenue (s4).' },
        { label: 'Kids bar', detail: 'New vertical at 28% adoption (s4).' },
      ],
      sources: [sources[3]],
    },
  },
  {
    id: 'prp3', competitorId: 'prc3', name: 'MuscleBlaze Biozyme Whey',
    tagline: 'India\'s #1 whey protein', category: 'Whey Protein', pricingModel: 'Unit', startingPrice: 1499,
    features: [
      { id: 'pf11', name: 'Whey Isolate', description: 'Premium isolate, 30g per serving.', maturity: 'GA' as const, adoption: 95 },
      { id: 'pf12', name: 'Whey Concentrate', description: 'Value segment whey.', maturity: 'GA' as const, adoption: 88 },
      { id: 'pf13', name: 'Plant Protein', description: 'Pea-soy blend, new launch.', maturity: 'Beta' as const, adoption: 22 },
      { id: 'pf14', name: 'Protein Bar', description: 'On-the-go format.', maturity: 'GA' as const, adoption: 68 },
      { id: 'pf15', name: 'BCAA', description: 'Recovery supplement.', maturity: 'GA' as const, adoption: 72 },
    ],
    explanation: {
      summary: 'MuscleBlaze\'s product is engineered for performance — every SKU has a gym use case.',
      whyItMatters: [
        'Their DTC funnel is the highest-leverage channel to mimic.',
        'Their plant protein launch shows the market is ready.',
      ],
      evidence: [
        { label: 'Price band', detail: '₹1,499 for 1kg — accessible premium (s5).' },
        { label: 'Plant protein', detail: 'New vertical at 22% adoption (s5).' },
      ],
      sources: [sources[4]],
    },
  },
  {
    id: 'prp4', competitorId: 'prc4', name: 'Nutrilite All Plant Protein',
    tagline: 'Global plant-protein leader', category: 'Plant Protein', pricingModel: 'Unit', startingPrice: 2199,
    features: [
      { id: 'pf16', name: 'All Plant Protein', description: 'Soy-pea-quinoa blend.', maturity: 'GA' as const, adoption: 90 },
      { id: 'pf17', name: 'Protein with DHA', description: 'Brain health variant.', maturity: 'GA' as const, adoption: 78 },
      { id: 'pf18', name: 'Organic Protein', description: 'USDA organic certified.', maturity: 'GA' as const, adoption: 65 },
      { id: 'pf19', name: 'Meal Replacement', description: 'Complete nutrition shake.', maturity: 'Beta' as const, adoption: 32 },
    ],
    explanation: {
      summary: 'Nutrilite\'s product is engineered for trust — every SKU has a health claim.',
      whyItMatters: [
        'Their all-plant positioning is the premium benchmark.',
        'Their meal replacement shows the format opportunity.',
      ],
      evidence: [
        { label: 'Price band', detail: '₹2,199 for 1kg — premium (s8).' },
        { label: 'Meal replacement', detail: 'New vertical at 32% adoption (s8).' },
      ],
      sources: [sources[7]],
    },
  },
];

const pricingTiers = [
  { id: 'pt1', competitorId: 'prc1', name: 'RiteBite Single Bar', priceMonthly: 149, billing: 'monthly' as const, features: ['1× 60g bar', '20g protein', 'Assorted flavors'], bestFor: 'Trial' },
  { id: 'pt2', competitorId: 'prc1', name: 'RiteBite Variety Pack', priceMonthly: 899, billing: 'monthly' as const, features: ['8× 60g bars', 'Assorted flavors', 'Free shipping'], bestFor: 'Monthly subscription', highlighted: true },
  { id: 'pt3', competitorId: 'prc1', name: 'RiteBite Max Chips', priceMonthly: 199, billing: 'monthly' as const, features: ['1× 50g pack', '15g protein', 'Savory snack'], bestFor: 'Snacking' },

  { id: 'pt4', competitorId: 'prc2', name: 'Yoga Bar Single', priceMonthly: 99, billing: 'monthly' as const, features: ['1× 60g bar', '10g protein', 'Clean label'], bestFor: 'Trial' },
  { id: 'pt5', competitorId: 'prc2', name: 'Yoga Bar Box', priceMonthly: 799, billing: 'monthly' as const, features: ['8× 60g bars', 'Assorted flavors'], bestFor: 'Monthly subscription', highlighted: true },

  { id: 'pt6', competitorId: 'prc3', name: 'MuscleBlaze Whey 1kg', priceMonthly: 1499, billing: 'monthly' as const, features: ['1kg whey', '30g per serving', '30 servings'], bestFor: 'Core product', highlighted: true },
  { id: 'pt7', competitorId: 'prc3', name: 'MuscleBlaze Whey 2kg', priceMonthly: 2799, billing: 'monthly' as const, features: ['2kg whey', '30g per serving', '60 servings'], bestFor: 'Bulk purchase' },
  { id: 'pt8', competitorId: 'prc3', name: 'MuscleBlaze Bar Box', priceMonthly: 1199, billing: 'monthly' as const, features: ['12× bars', '20g protein each'], bestFor: 'On-the-go' },

  { id: 'pt9', competitorId: 'prc4', name: 'Nutrilite 500g', priceMonthly: 1299, billing: 'monthly' as const, features: ['500g plant protein', '25g per serving'], bestFor: 'Trial' },
  { id: 'pt10', competitorId: 'prc4', name: 'Nutrilite 1kg', priceMonthly: 2199, billing: 'monthly' as const, features: ['1kg plant protein', '25g per serving'], bestFor: 'Core product', highlighted: true },
];

const marketGaps = [
  {
    id: 'pg1', title: 'Plant-based protein at everyday price',
    description: 'Plant-protein is growing 35% YoY but most options are premium. No brand offers credible plant-protein under ₹100 per serving.',
    opportunityScore: 85, difficultyScore: 52, estimatedRevenue: '₹120 Cr ARR by 2028',
    affectedSegments: ['Fitness enthusiasts', 'Vegan consumers', 'Health-conscious millennials'],
    explanation: {
      summary: 'A price gap, not a product gap — there is real headroom for an affordable plant-protein brand.',
      whyItMatters: [
        'It removes the #1 friction point for first-time plant-protein buyers.',
        'It generates first-party data you can use to personalize subscriptions.',
      ],
      evidence: [
        { label: 'Category signal', detail: '65% of protein buyers want plant-based under ₹100 (s6).' },
        { label: 'Competitor gap', detail: 'RiteBite & Yoga Bar rely on whey; no affordable plant option (s4, s5).' },
      ],
      sources: [sources[3], sources[4], sources[5]],
    },
  },
  {
    id: 'pg2', title: 'Subscription-first protein delivery',
    description: 'Subscription models are rare in Indian protein. No brand offers a credible monthly protein plan with flexibility.',
    opportunityScore: 78, difficultyScore: 48, estimatedRevenue: '₹80 Cr ARR by 2028',
    affectedSegments: ['Urban professionals', 'Gym-goers', 'Busy parents'],
    explanation: {
      summary: 'A subscription story is cheap to market and increasingly expected by urban buyers.',
      whyItMatters: [
        'It increases LTV by locking in monthly purchases.',
        'It signals convenience without an upfront cost redesign.',
      ],
      evidence: [
        { label: 'Adoption signal', detail: 'MuscleBlaze subscription uptake at 8% — still early (s5).' },
        { label: 'Buyer expectation', detail: '58% of urban buyers prefer subscription for supplements (s2).' },
      ],
      sources: [sources[4], sources[1]],
    },
  },
  {
    id: 'pg3', title: 'Tier-2 city protein market',
    description: 'Tier-2 cities are the fastest-growing protein market but underserved by DTC brands.',
    opportunityScore: 82, difficultyScore: 58, estimatedRevenue: '₹95 Cr ARR by 2028',
    affectedSegments: ['Jaipur', 'Lucknow', 'Indore', 'Chandigarh'],
    explanation: {
      summary: 'The biggest regional expansion opportunity — crowded only at the very top.',
      whyItMatters: [
        'Rising disposable income means higher repeat purchase rates.',
        'Limited premium competition makes customer acquisition cheaper.',
      ],
      evidence: [
        { label: 'Growth', detail: 'Tier-2 protein grew 25% YoY (s1).' },
      ],
      sources: [sources[0]],
    },
  },
  {
    id: 'pg4', title: 'Women\'s protein line',
    description: 'Women\'s protein is growing 40% YoY but most brands target men.',
    opportunityScore: 80, difficultyScore: 45, estimatedRevenue: '₹70 Cr ARR by 2028',
    affectedSegments: ['Urban women 25-40', 'Fitness-focused women', 'New mothers'],
    explanation: {
      summary: 'A clean opening in women\'s protein — most brands are still men-focused.',
      whyItMatters: [
        'Women\'s wellness is the fastest-growing segment in Indian nutrition.',
        'Gifting occasions (Diwali, birthdays) drive women\'s protein sales.',
      ],
      evidence: [
        { label: 'Growth', detail: 'Women\'s protein grew 40% YoY (s2).' },
      ],
      sources: [sources[1]],
    },
  },
];

const insights = [
  {
    id: 'pi1', title: 'MuscleBlaze\'s whey-only focus is your opening', category: 'Opportunity' as const, impact: 'High' as const, confidence: 82,
    summary: 'MuscleBlaze is 90% whey — leaving the plant-protein segment wide open for Indian brands.',
    detail: 'A focused plant-protein launch can out-convert a sprawling whey line at equal CAC.',
    relatedCompetitors: ['prc3'],
    explanation: {
      summary: 'Use plant-protein as a strategy, not a limitation.',
      whyItMatters: [
        'Plant-protein brands like Nutrilite get higher reorder rates per SKU.',
        'Press loves a clear story more than a wide assortment.',
      ],
      evidence: [
        { label: 'Buyer signal', detail: 'Plant-protein brands with <10 SKUs see 1.6× higher sell-through (s6).' },
      ],
      sources: [sources[5]],
    },
  },
  {
    id: 'pi2', title: 'Subscription models are now table stakes', category: 'Risk' as const, impact: 'Medium' as const, confidence: 78,
    summary: 'If your DTC site doesn\'t offer a monthly subscription, you\'re losing the retention game.',
    detail: 'MuscleBlaze\'s subscription is growing 40% YoY; this is becoming the default expectation.',
    relatedCompetitors: ['prc3'],
    explanation: {
      summary: 'Build a subscription before your third SKU.',
      whyItMatters: [
        'It cuts the CAC payback period by 30–40%.',
        'It is the cheapest insurance against "I forgot to reorder" drop-off.',
      ],
      evidence: [
        { label: 'Adoption', detail: 'MuscleBlaze subscription growing 40% YoY (s5).' },
      ],
      sources: [sources[4]],
    },
  },
  {
    id: 'pi3', title: 'Tier-2 expansion has the lowest CAC today', category: 'Opportunity' as const, impact: 'High' as const, confidence: 75,
    summary: 'Tier-2 cities are the fastest-growing and have fewer premium DTC entrants.',
    detail: 'Lower competitive density = lower paid CAC. Plan a 2-quarter Tier-2 launch track.',
    relatedCompetitors: [],
    explanation: {
      summary: 'Sequence: Tier-2 launch → influencer seeding → Amazon/Flipkart expansion.',
      whyItMatters: [
        'Establishes brand before metro saturation.',
        'Rising disposable income makes retention easier.',
      ],
      evidence: [
        { label: 'Growth', detail: '25% YoY in Tier-2 (s1).' },
      ],
      sources: [sources[0]],
    },
  },
  {
    id: 'pi4', title: 'A clean-label story beats celebrity endorsement logic', category: 'Recommendation' as const, impact: 'Medium' as const, confidence: 72,
    summary: 'Clean-label brands compound; celebrity endorsements are cyclical.',
    detail: 'Invest in a visible clean-label story (ingredients, sourcing) instead of a celebrity front-man.',
    relatedCompetitors: ['prc2'],
    explanation: {
      summary: 'Clean-label compounds over years; celebrity deals expire in quarters.',
      whyItMatters: [
        'Customer retention is durable, not campaign-driven.',
        'Press and gifting naturally pick up clean-label stories.',
      ],
      evidence: [
        { label: 'Pattern', detail: 'Yoga Bar\'s "clean label" cited in 68% of health press (s4).' },
      ],
      sources: [sources[3]],
    },
  },
];

const actionPlan = [
  { id: 'pa1', title: 'Launch plant-protein bar line', owner: 'Product + Brand', priority: 'P0' as const, horizon: 'Now' as const, effort: 'High' as const, impact: 'High' as const, description: 'Launch 4 plant-protein bar SKUs with clean-label positioning.', rationale: 'Plant-protein focus outperforms whey-only — see insight pi1.' },
  { id: 'pa2', title: 'Ship monthly subscription', owner: 'Product + Eng', priority: 'P0' as const, horizon: 'Now' as const, effort: 'Medium' as const, impact: 'High' as const, description: 'A flexible monthly protein plan with pause/cancel anytime.', rationale: 'Subscription table stakes, see insight pi2.' },
  { id: 'pa3', title: 'Launch starter pack', owner: 'Product + DTC', priority: 'P0' as const, horizon: 'Now' as const, effort: 'Low' as const, impact: 'High' as const, description: '₹699 starter pack with 4 bars + 1 shake sample, free shipping.', rationale: 'DTC funnel table stakes, see insight pg1.' },
  { id: 'pa4', title: 'Plan Tier-2 expansion', owner: 'Brand + GTM', priority: 'P1' as const, horizon: 'Next' as const, effort: 'High' as const, impact: 'High' as const, description: '2-quarter plan: influencer seeding + Amazon/Flipkart listing.', rationale: 'Lowest-CAC growth region, see insight pi3.' },
  { id: 'pa5', title: 'Roll out women\'s protein line', owner: 'Ops + Brand', priority: 'P1' as const, horizon: 'Next' as const, effort: 'Medium' as const, impact: 'Medium' as const, description: 'Women-specific protein bar + shake with iron & calcium.', rationale: 'Clean-label story, see insight pg4.' },
  { id: 'pa6', title: 'Track plant-protein supplier landscape', owner: 'Strategy', priority: 'P2' as const, horizon: 'Now' as const, effort: 'Low' as const, impact: 'Medium' as const, description: 'Monthly review of pea/soy protein suppliers (Roquette, others).', rationale: 'Long-horizon moat, see insight pg2.' },
];

const reports = [
  {
    id: 'pr-r1', title: 'ProV Foods — Competitive Landscape, Sep 2026',
    type: 'Executive Summary' as const, date: '2026-09-01', pages: 8,
    summary: 'The Indian protein market is growing; ProV Foods\' wedge is plant-protein + subscription + Tier-2 expansion.',
    sections: [
      { heading: 'TL;DR', body: 'Protein market growing 18% YoY; the wedge is plant-protein + subscription + Tier-2.' },
      { heading: 'Market', body: 'Indian protein market now ₹8,500 Cr; plant-protein at 15% and growing fastest.' },
      { heading: 'Top 3 Moves', body: '1) Launch plant-protein bars. 2) Ship monthly subscription. 3) Plan Tier-2 expansion.' },
    ],
    explanation: {
      summary: 'A board-ready summary you can share with leadership.',
      whyItMatters: [
        'Aligns brand, product and GTM on a small set of moves.',
        'Reusable internal narrative for the next 90 days.',
      ],
      evidence: [
        { label: 'Market sizing', detail: 'RedSeer India 2026 (s1).' },
        { label: 'Growth', detail: 'IMARC Protein Report 2026 (s6).' },
      ],
      sources: [sources[0], sources[5]],
    },
  },
  {
    id: 'pr-r2', title: 'Deep Dive: Protein Pricing in India',
    type: 'Deep Dive' as const, date: '2026-09-01', pages: 14,
    summary: 'Side-by-side pricing across RiteBite, Yoga Bar, MuscleBlaze and Nutrilite.',
    sections: [
      { heading: 'Price bands', body: 'Three viable bands: premium (₹1,500+), mid-tier (₹800–₹1,500), accessible (₹100–₹500).' },
      { heading: 'Subscription pricing', body: 'A credible ₹899–₹1,199 monthly subscription is now an entry expectation.' },
      { heading: 'Recommendation', body: 'Anchor your bar at ₹149 with ₹899 monthly subscription.' },
    ],
    explanation: {
      summary: 'Use this to set your launch pricing.',
      whyItMatters: [
        'Pricing is the most-leveraged early decision.',
        'Subscription price anchors long-term LTV.',
      ],
      evidence: [
        { label: 'Data source', detail: 'Public pricing pages (s4, s5, s8).' },
      ],
      sources: [sources[3], sources[4], sources[7]],
    },
  },
  {
    id: 'pr-r3', title: 'Go-to-Market: Tier-2 Expansion Plan',
    type: 'Go-to-Market' as const, date: '2026-09-01', pages: 10,
    summary: 'A 2-quarter plan to land in Tier-2 cities with a credible brand story.',
    sections: [
      { heading: 'ICP', body: 'Tier-2 fitness enthusiasts 22–35, health-conscious, value-seeking.' },
      { heading: 'Motion', body: 'Influencer seeding + Amazon/Flipkart listing + local language content.' },
      { heading: 'Pricing', body: 'Mirror metro pricing with a regional starter pack.' },
    ],
    explanation: {
      summary: 'A concrete GTM plan for the highest-leverage region.',
      whyItMatters: [
        'Lowest-CAC growth region of the next 3 years.',
        'Rising disposable income makes retention easier.',
      ],
      evidence: [
        { label: 'Market growth', detail: '25% YoY in Tier-2 (s1).' },
      ],
      sources: [sources[0]],
    },
  },
];

const charts = {
  marketShare: {
    title: 'Estimated protein bar market share (India)',
    kind: 'bar' as const, xLabel: 'Brand', yLabel: 'Share (%)',
    series: [
      { id: 'prm1', name: 'Share', color: '#10a37f', points: [
        { label: 'RiteBite', value: 18 },
        { label: 'Yoga Bar', value: 14 },
        { label: 'MuscleBlaze', value: 22 },
        { label: 'Nutrilite', value: 12 },
        { label: 'Others', value: 34 },
      ]},
    ],
    explanation: {
      summary: 'A long-tail market — even leaders have only low double-digit share.',
      whyItMatters: [
        'You do not need to dethrone anyone to build a ₹50 Cr brand.',
        'The category has room for new entrants at every price band.',
      ],
      evidence: [
        { label: 'Data source', detail: 'RedSeer India 2026 (s1).' },
      ],
      sources: [sources[0]],
    },
  },
  growth: {
    title: 'YoY revenue growth by brand',
    kind: 'line' as const, xLabel: 'Year', yLabel: 'YoY growth (%)',
    series: [
      { id: 'prg1', name: 'RiteBite', color: '#f59e0b', points: [
        { label: '2023', value: 18 }, { label: '2024', value: 21 }, { label: '2025', value: 24 }, { label: '2026', value: 24 },
      ]},
      { id: 'prg2', name: 'Yoga Bar', color: '#059669', points: [
        { label: '2023', value: 14 }, { label: '2024', value: 16 }, { label: '2025', value: 18 }, { label: '2026', value: 18 },
      ]},
      { id: 'prg3', name: 'MuscleBlaze', color: '#dc2626', points: [
        { label: '2023', value: 25 }, { label: '2024', value: 28 }, { label: '2025', value: 32 }, { label: '2026', value: 32 },
      ]},
      { id: 'prg4', name: 'Nutrilite', color: '#065f46', points: [
        { label: '2023', value: 12 }, { label: '2024', value: 14 }, { label: '2025', value: 15 }, { label: '2026', value: 15 },
      ]},
    ],
    explanation: {
      summary: 'MuscleBlaze is the outlier — incumbents are steady, MuscleBlaze is the disruptor.',
      whyItMatters: [
        'MuscleBlaze\'s growth rate sets the ceiling for what is possible at premium.',
        'Incumbents\' growth rate defines "safe" — anything less looks stale.',
      ],
      evidence: [{ label: 'Data source', detail: 'Brand reviews + IMARC (s5, s6, s8).' }],
      sources: [sources[4], sources[5], sources[7]],
    },
  },
  pricing: {
    title: 'Average protein bar price (₹)',
    kind: 'bar' as const, xLabel: 'Product', yLabel: '₹',
    series: [
      { id: 'prp1', name: 'Price', color: '#0ea5e9', points: [
        { label: 'RiteBite', value: 149 },
        { label: 'Yoga Bar', value: 99 },
        { label: 'MuscleBlaze', value: 1499 },
        { label: 'Nutrilite', value: 2199 },
      ]},
    ],
    explanation: {
      summary: 'Four brands, four price ladders — MuscleBlaze is the "premium reachable" anchor.',
      whyItMatters: [
        'Your bar price will be compared to all four.',
        'The ₹100–₹200 band is wide open for plant-protein.',
      ],
      evidence: [{ label: 'Data source', detail: 'Public pricing pages, Aug 2026 (s4, s5, s6, s8).' }],
      sources: [sources[3], sources[4], sources[5], sources[7]],
    },
  },
  featureAdoption: {
    title: 'Adoption of "next-gen" features (%)',
    kind: 'area' as const, xLabel: 'Feature', yLabel: 'Adoption (%)',
    series: [
      { id: 'prf1', name: 'RiteBite', color: '#f59e0b', points: [
        { label: 'Subscription', value: 12 },
        { label: 'Plant option', value: 0 },
        { label: 'Clean label', value: 45 },
        { label: 'Variety pack', value: 72 },
      ]},
      { id: 'prf2', name: 'Yoga Bar', color: '#059669', points: [
        { label: 'Subscription', value: 8 },
        { label: 'Plant option', value: 15 },
        { label: 'Clean label', value: 92 },
        { label: 'Variety pack', value: 65 },
      ]},
      { id: 'prf3', name: 'MuscleBlaze', color: '#dc2626', points: [
        { label: 'Subscription', value: 8 },
        { label: 'Plant option', value: 22 },
        { label: 'Clean label', value: 35 },
        { label: 'Variety pack', value: 48 },
      ]},
    ],
    explanation: {
      summary: 'Plant-protein is at 0-22% across the board — a clean opening.',
      whyItMatters: [
        'A first-mover plant-protein becomes a press story and a competitive moat.',
        'Subscription is real but small — the category is still figuring it out.',
      ],
      evidence: [{ label: 'Data source', detail: 'Public brand materials (s4, s5, s6).' }],
      sources: [sources[3], sources[4], sources[5]],
    },
  },
};

const initialMessages = [
  {
    id: 'prm0', role: 'assistant' as const,
    text: `I\'ve finished a first pass on the competitive landscape for **ProV Foods**. Here\'s a quick orientation:

- The Indian protein market is **₹8,500 Cr and growing ~18% YoY** (RedSeer).
- **MuscleBlaze** is the DTC leader; **RiteBite** and **Yoga Bar** dominate bars.
- **Nutrilite** is the plant-protein pioneer — watch their playbook.
- **Tier-2 cities** are the highest-leverage expansion region.

Try: "Show me a SWOT for MuscleBlaze", "Compare pricing across the top 3", or "Where are the biggest gaps?"`,
    createdAt: Date.now() - 1000 * 60 * 30,
  },
];

export const proteinAnalysis: AnalysisData = {
  businessName: 'ProV Foods',
  industry: 'Plant-based protein nutrition (bars, shakes, supplements)',
  idea: 'A plant-first line of 20g+ protein bars and 30g RTD shakes with clean-label positioning.',
  targetCustomers: 'Fitness enthusiasts 20–35, urban professionals, health-conscious millennials.',
  geography: 'Bangalore-first via DTC; expanding to Mumbai, Delhi, Pune.',
  businessModel: 'Plant-first, clean-label, 20g+ protein at everyday price.',
  researchGoals: ['Land in 1,000 pin codes in 12 months', 'Drive 35% of revenue via DTC subscriptions', 'Open Tier-2 in 2 quarters'],
  profile: {
    businessName: 'ProV Foods',
    idea: 'A plant-first line of 20g+ protein bars and 30g RTD shakes with clean-label positioning.',
    industry: 'Plant-based protein nutrition (bars, shakes, supplements)',
    targetCustomers: 'Fitness enthusiasts 20–35, urban professionals, health-conscious millennials.',
    geography: 'Bangalore-first via DTC; expanding to Mumbai, Delhi, Pune.',
    businessModel: 'Plant-first, clean-label, 20g+ protein at everyday price.',
    competitors: ['RiteBite', 'Yoga Bar', 'MuscleBlaze', 'Amway Nutrilite'],
    researchGoals: ['Land in 1,000 pin codes in 12 months', 'Drive 35% of revenue via DTC subscriptions', 'Open Tier-2 in 2 quarters'],
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
  charts: {
    ...charts,
    marketSharePie: {
      title: 'Market share distribution',
      kind: 'pie' as const,
      series: [{
        id: 's-share',
        name: 'Share',
        color: '#10a37f',
        points: charts.marketShare.series[0].points.map((p: { label: string; value: number }, i: number) => ({
          label: p.label,
          value: p.value,
          color: ['#0ea5e9', '#059669', '#6b7280', '#f43f5e', '#8b5cf6'][i] ?? '#64748b',
        })),
      }],
      explanation: charts.marketShare.explanation,
    },
    growthPie: {
      title: 'Growth distribution by brand',
      kind: 'pie' as const,
      series: charts.growth.series.map((s) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        points: [{ label: s.name, value: s.points[s.points.length - 1].value }],
      })),
      explanation: charts.growth.explanation,
    },
    pricingPie: {
      title: 'Price distribution',
      kind: 'pie' as const,
      series: [{
        id: 's-price',
        name: 'Price',
        color: '#0ea5e9',
        points: charts.pricing.series[0].points.map((p: { label: string; value: number }, i: number) => ({
          label: p.label,
          value: p.value,
          color: ['#0ea5e9', '#059669', '#6b7280', '#f43f5e'][i] ?? '#64748b',
        })),
      }],
      explanation: charts.pricing.explanation,
    },
    featureAdoptionPie: {
      title: 'Feature adoption breakdown',
      kind: 'pie' as const,
      series: [{
        id: 's-feat',
        name: 'Adoption',
        color: '#8b5cf6',
        points: charts.featureAdoption.series[0].points.map((p: { label: string; value: number }, i: number) => ({
          label: p.label,
          value: charts.featureAdoption.series.reduce((sum: number, s) => sum + (s.points[i]?.value ?? 0), 0),
          color: ['#0ea5e9', '#059669', '#f59e0b', '#f43f5e'][i] ?? '#64748b',
        })),
      }],
      explanation: charts.featureAdoption.explanation,
    },
  },
  swot: {
    strengths: ['Growing Indian protein market', 'Plant-first trend acceleration'],
    weaknesses: ['Whey price volatility', 'Private label encroachment'],
    opportunities: ['Plant-only positioning', 'DTC subscription model'],
    threats: ['Incumbent brand loyalty', 'Commodity protein prices'],
  },
  sources,
  conversation: initialMessages,
};
