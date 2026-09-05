// =============================================================================
// Sample analysis: Scentra — premium / niche fragrance (Mumbai, India).
// =============================================================================

import type { BusinessProfile } from '../types';

export const perfumeRequest = {
  business_name: 'Scentra',
  idea: 'A 6-SKU curated line of premium perfumes with a hand-finished ritual and an AI-driven scent quiz.',
  industry: 'Premium & niche fragrance',
  products_services: ['EDP', 'Discovery sets', 'Refill program'],
  target_customers: 'Urban women 25–40, prestige-aware, gift-purchase heavy, pan-India.',
  geography: 'DTC-first, expanding via Nykaa + boutique retail in metro cities.',
  pricing: '₹3,500 50ml EDP, ₹1,800 discovery set',
  business_model: 'DTC-first, expanding via premium retail',
  competitors: ['Forest Essentials', 'Kama Ayurveda', 'Jo Malone India', 'Paas Fragrances'],
  differentiators: 'Curated 6-SKU hero line, explainable AI scent quiz, refill at scale',
  research_goals: [
    'Land in 50 stores in 12 months',
    'Drive 40% of revenue via DTC discovery sets',
    'Expand to Tier-1 cities in 2 quarters',
  ],
};

export const perfumeSources = [
  { id: 'p-s1', title: 'Euromonitor — India Fragrance Market Report, 2026', publisher: 'Euromonitor', date: '2026-02-10', snippet: 'The Indian fragrance market reached ₹12,500 Cr in 2025, growing 11% YoY, with premium segments outpacing mass…' },
  { id: 'p-s2', title: 'Nykaa Beauty Trends Report 2026', publisher: 'Nykaa', date: '2026-03-12', snippet: 'Gen Z and Millennials drive 68% of premium fragrance growth on DTC platforms…' },
  { id: 'p-s3', title: 'Forest Essentials Annual Report FY2026', publisher: 'Forest Essentials', date: '2026-05-30', snippet: 'Forest Essentials reported ₹650 Cr revenue, with premium Ayurvedic fragrances up 22%…' },
  { id: 'p-s4', title: 'Kama Ayurveda Product Catalog', publisher: 'kamaayurveda.com', date: '2026-07-15', snippet: '50ml EDP retails at ₹4,200; discovery sets at ₹2,500…' },
  { id: 'p-s5', title: 'Jo Malone India Brand Review', publisher: 'jo Malone.in', date: '2026-04-20', snippet: 'Jo Malone India crossed ₹180 Cr retail revenue across 12 cities…' },
  { id: 'p-s6', title: 'RedSeer — India DTC Beauty Report, Q2 2026', publisher: 'RedSeer', date: '2026-07-02', snippet: 'Niche fragrance now 15% of premium fragrance sales online, up from 8% in 2021…' },
  { id: 'p-s7', title: 'Givaudan India Sourcing Brief', publisher: 'Givaudan', date: '2026-03-04', snippet: 'Synthetic biology ingredients now contribute to 12% of premium perfume compositions in India…' },
  { id: 'p-s8', title: 'Paas Fragrances — DTC Brand Spotlight', publisher: 'YourStory', date: '2026-06-09', snippet: 'Paas grew 140% YoY in 2025 with a discovery-led DTC funnel…' },
];

export const perfumeCompetitors = [
  {
    id: 'c1', name: 'Forest Essentials', logo_color: 'bg-emerald-700',
    description: 'Premium Ayurvedic beauty brand known for traditional formulations and strong retail presence.',
    funding: 'Estée Lauder subsidiary', founded: '2000', hq: 'New Delhi, India',
    market_share: 12, growth_rate: 22, pricing_tier: 'Premium', market_position: 'Leader',
    strengths: ['Strong retail presence', 'Ayurvedic heritage', 'Premium positioning'],
    weaknesses: ['Limited digital presence', 'Premium-only positioning limits scale'],
    swot: {
      strengths: ['Brand heritage', 'Retail distribution', 'Ayurvedic credentials'],
      weaknesses: ['Price ceiling', 'Limited DTC reach', 'Traditional positioning'],
      opportunities: ['Tier-2 expansion', 'Men\'s fragrance line'],
      threats: ['DTC native brands', 'International entrants'],
    },
    explanation: {
      summary: 'Forest Essentials is the Ayurvedic premium leader — strong in retail, building DTC.',
      why_it_matters: [
        'Their Ayurvedic positioning is the moat to either copy or differentiate against.',
        'They define the upper bound of Indian premium pricing.',
      ],
      evidence: [
        { label: 'Pricing benchmark', detail: '50ml EDP at ₹5,500 — the reference point (s4).' },
        { label: 'Growth', detail: '22% YoY (s3).' },
      ],
      sources: [perfumeSources[3], perfumeSources[2]],
    },
  },
  {
    id: 'c2', name: 'Kama Ayurveda', logo_color: 'bg-amber-700',
    description: 'Pioneer of luxury Ayurvedic beauty in India with strong international presence.',
    funding: 'Puig subsidiary', founded: '2002', hq: 'Mumbai, India',
    market_share: 9, growth_rate: 18, pricing_tier: 'Premium', market_position: 'Challenger',
    strengths: ['Heritage Ayurvedic formulations', 'International distribution', 'Strong gifting'],
    weaknesses: ['Limited scent library', 'Higher price point'],
    swot: {
      strengths: ['Visual identity', 'Influencer reach'],
      weaknesses: ['Fewer hero SKUs', 'Narrower price ladder'],
      opportunities: ['Home fragrance', 'Tier-1 expansion'],
      threats: ['Sub-cult DTC entrants', 'Celebrity fragrances'],
    },
    explanation: {
      summary: 'Kama owns the Ayurvedic luxury lane — benchmark for brand aesthetics.',
      why_it_matters: [
        'Their gifting positioning is the easiest adjacency to copy.',
        'Their ₹4,200 price band shows the size of the premium prize.',
      ],
      evidence: [
        { label: 'Revenue', detail: '₹420 Cr retail revenue (s5).' },
        { label: 'Growth', detail: '18% YoY (s5).' },
      ],
      sources: [perfumeSources[4]],
    },
  },
  {
    id: 'c3', name: 'Jo Malone India', logo_color: 'bg-gray-700',
    description: 'Global luxury fragrance house with growing presence in Indian metros.',
    funding: 'Estée Lauder', founded: '1999', hq: 'London, UK (India ops: Mumbai)',
    market_share: 15, growth_rate: 25, pricing_tier: 'Ultra-Premium', market_position: 'Leader',
    strengths: ['Global brand cachet', 'Wide distribution', 'Strong gifting'],
    weaknesses: ['Very high price point', 'Limited discovery options'],
    swot: {
      strengths: ['Global distribution', 'Brand prestige', 'Multi-channel reach'],
      weaknesses: ['Price barrier', 'Limited India-specific scents'],
      opportunities: ['Discovery sets', 'Tier-2 cities'],
      threats: ['DTC discovery brands', 'Local premium brands'],
    },
    explanation: {
      summary: 'Jo Malone is the global luxury benchmark — wide assortment, premium pricing.',
      why_it_matters: [
        'Their pricing band (₹8,000–₹15,000) is where aspirational buyers look.',
        'Their distribution at Shoppers Stop + Nykaa defines the modern shelf.',
      ],
      evidence: [
        { label: 'Distribution', detail: 'Available in 45+ doors across 12 cities (s6).' },
        { label: 'Growth', detail: '25% YoY in India (s6).' },
      ],
      sources: [perfumeSources[5]],
    },
  },
  {
    id: 'c4', name: 'Paas Fragrances', logo_color: 'bg-rose-500',
    description: 'DTC-native Indian fragrance brand with discovery-first funnel and viral marketing.',
    funding: '₹45 Cr Series A', founded: '2020', hq: 'Bangalore, India',
    market_share: 3, growth_rate: 140, pricing_tier: 'Premium', market_position: 'Emerging',
    strengths: ['Viral DTC playbook', 'Affordable premium pricing', 'Discovery sets'],
    weaknesses: ['Tiny retail presence', 'Limited hero SKUs'],
    swot: {
      strengths: ['Brand storytelling', 'Conversion-focused site', 'Press relationships'],
      weaknesses: ['No flagship store', 'No refill program'],
      opportunities: ['Nykaa retail', 'Body/hair extension'],
      threats: ['Copycats', 'Wholesale margin pressure'],
    },
    explanation: {
      summary: 'Paas is the disruptor — small, fast, viral. Their growth rate is the early-warning.',
      why_it_matters: [
        '140% growth shows the appetite for discovery-led Indian brands.',
        'Their discovery sets are a cheap feature to copy on your DTC site.',
      ],
      evidence: [
        { label: 'Growth', detail: '140% YoY in 2025 (s8).' },
        { label: 'Funding', detail: '₹45 Cr Series A to scale retail (s8).' },
      ],
      sources: [perfumeSources[7]],
    },
  },
];

export const perfumeProducts = [
  {
    id: 'pr1', competitor_id: 'c1', name: 'Forest Essentials Attars',
    tagline: 'Traditional Ayurvedic attars', category: 'Premium Attar', pricing_model: 'Tiered', starting_price: 2800,
    features: [
      { id: 'pf1', name: 'Mogra', description: 'Classic jasmine attar — the iconic scent.', maturity: 'GA', adoption: 92 },
      { id: 'pf2', name: 'Rose', description: 'Pure rose attar, unisex.', maturity: 'GA', adoption: 85 },
      { id: 'pf3', name: 'Sandalwood', description: 'Mysore sandalwood base.', maturity: 'GA', adoption: 78 },
      { id: 'pf4', name: 'Discovery Set', description: '5×3ml attar set.', maturity: 'GA', adoption: 65 },
      { id: 'pf5', name: 'Gift Box', description: 'Festive packaging for gifting.', maturity: 'GA', adoption: 71 },
    ],
    explanation: {
      summary: 'Forest Essentials\' product is ritual, not just scent — a useful anchor.',
      why_it_matters: [
        'Their attar format is the easiest sustainability signal to launch.',
        'Their gifting packaging is the closest analog to your "hand-finished" promise.',
      ],
      evidence: [
        { label: 'SKU count', detail: '25 hero attars (s4).' },
        { label: 'Gift box uptake', detail: '71% adoption during festive season (s4).' },
      ],
      sources: [perfumeSources[3]],
    },
  },
  {
    id: 'pr2', competitor_id: 'c2', name: 'Kama Ayurveda Perfumery',
    tagline: 'Luxury Ayurvedic fragrances', category: 'Premium EDP', pricing_model: 'Tiered', starting_price: 4200,
    features: [
      { id: 'pf6', name: 'White Lotus', description: 'Floral aquatic bestseller.', maturity: 'GA', adoption: 88 },
      { id: 'pf7', name: 'Sweet Fennel', description: 'Fresh herbal gifting hero.', maturity: 'GA', adoption: 82 },
      { id: 'pf8', name: 'Hemp & Rose', description: 'Earthy floral — cult favorite.', maturity: 'GA', adoption: 76 },
      { id: 'pf9', name: 'Discovery Set', description: '4×5ml travel set.', maturity: 'GA', adoption: 58 },
      { id: 'pf10', name: 'Body Oil Range', description: 'Cross-category extension.', maturity: 'Beta', adoption: 25 },
    ],
    explanation: {
      summary: 'Kama\'s range leans on a few iconic hero scents plus a strong discovery set.',
      why_it_matters: [
        'Hero-SKU strategy is more capital-efficient than broad line-ups.',
        'Body oil is a credible adjacency that you can plan around.',
      ],
      evidence: [
        { label: 'Hero SKU share', detail: 'Top 5 scents = 68% of revenue (s5).' },
        { label: 'Body oil', detail: 'New vertical at 25% adoption (s5).' },
      ],
      sources: [perfumeSources[4]],
    },
  },
  {
    id: 'pr3', competitor_id: 'c3', name: 'Jo Malone London',
    tagline: 'British luxury fragrances', category: 'Luxury EDP', pricing_model: 'Tiered', starting_price: 8500,
    features: [
      { id: 'pf11', name: 'English Pear & Freesia', description: 'Fruity floral bestseller.', maturity: 'GA', adoption: 94 },
      { id: 'pf12', name: 'Wood Sage & Sea Salt', description: 'Viral unisex scent.', maturity: 'GA', adoption: 90 },
      { id: 'pf13', name: 'Peony & Blush Suede', description: 'Romantic floral.', maturity: 'GA', adoption: 86 },
      { id: 'pf14', name: 'Discovery Set', description: '5×1.5ml discovery vial set.', maturity: 'GA', adoption: 72 },
      { id: 'pf15', name: 'Home Candles', description: 'Category extension.', maturity: 'GA', adoption: 65 },
    ],
    explanation: {
      summary: 'Jo Malone is the global luxury benchmark — wide assortment, premium pricing.',
      why_it_matters: [
        'Their discovery set format is now the category default.',
        'Their pricing sets the aspirational ceiling for Indian brands.',
      ],
      evidence: [
        { label: 'Line breadth', detail: '50+ SKUs (s6).' },
        { label: 'Discovery set adoption', detail: '72% (s6).' },
      ],
      sources: [perfumeSources[5]],
    },
  },
  {
    id: 'pr4', competitor_id: 'c4', name: 'Paas Discovery Line',
    tagline: 'DTC-native Indian scents', category: 'Premium EDP', pricing_model: 'Flat', starting_price: 1200,
    features: [
      { id: 'pf16', name: 'Monsoon', description: 'Petrichor-inspired viral hit.', maturity: 'GA', adoption: 95 },
      { id: 'pf17', name: 'Filter Coffee', description: 'Quintessentially Indian bestseller.', maturity: 'GA', adoption: 92 },
      { id: 'pf18', name: 'Discovery Sets', description: 'Founder-led sampling funnel.', maturity: 'GA', adoption: 88 },
      { id: 'pf19', name: 'Hair Perfume', description: 'Fragrance category extension.', maturity: 'Beta', adoption: 35 },
    ],
    explanation: {
      summary: 'Paas\' product is engineered for viral discovery — every SKU has a story.',
      why_it_matters: [
        'Their discovery funnel is the highest-leverage channel to mimic.',
        'Their pricing under ₹1,500 makes "premium accessible" feel within reach.',
      ],
      evidence: [
        { label: 'Price band', detail: '₹1,200 — accessible premium (s8).' },
        { label: 'Discovery share', detail: '88% of customers enter via discovery set (s8).' },
      ],
      sources: [perfumeSources[7]],
    },
  },
];

export const perfumePricing = [
  { id: 'ppt1', competitor_id: 'c1', name: 'Forest Essentials Attar 15ml', price_monthly: 1800, billing: 'monthly', features: ['1× 15ml attar', 'Traditional formulation', 'Gift box'], best_for: 'First purchase' },
  { id: 'ppt2', competitor_id: 'c1', name: 'Forest Essentials EDP 50ml', price_monthly: 5500, billing: 'monthly', features: ['1× 50ml EDP', 'Ayurvedic ingredients', 'Premium packaging'], best_for: 'Core product', highlighted: true },
  { id: 'ppt3', competitor_id: 'c1', name: 'Forest Essentials Discovery', price_monthly: 2500, billing: 'monthly', features: ['5×3ml attars', 'Discovery card'], best_for: 'Gift + trial' },

  { id: 'ppt4', competitor_id: 'c2', name: 'Kama EDP 50ml', price_monthly: 4200, billing: 'monthly', features: ['1× 50ml EDP', 'Luxury Ayurvedic'], best_for: 'Gifting', highlighted: true },
  { id: 'ppt5', competitor_id: 'c2', name: 'Kama Discovery Set', price_monthly: 2200, billing: 'monthly', features: ['4×5ml travel set'], best_for: 'Trial' },

  { id: 'ppt6', competitor_id: 'c3', name: 'Jo Malone 30ml', price_monthly: 5500, billing: 'monthly', features: ['1× 30ml EDP', 'British luxury'], best_for: 'Trial', highlighted: true },
  { id: 'ppt7', competitor_id: 'c3', name: 'Jo Malone 100ml', price_monthly: 12000, billing: 'monthly', features: ['1× 100ml EDP', 'Signature scent'], best_for: 'Core product' },
  { id: 'ppt8', competitor_id: 'c3', name: 'Jo Malone Discovery', price_monthly: 3500, billing: 'monthly', features: ['5×1.5ml vials'], best_for: 'Trial + gift' },

  { id: 'ppt9', competitor_id: 'c4', name: 'Paas EDP 50ml', price_monthly: 1200, billing: 'monthly', features: ['1× 50ml EDP', 'Founder note'], best_for: 'Trial + core' },
  { id: 'ppt10', competitor_id: 'c4', name: 'Paas Discovery Set', price_monthly: 600, billing: 'monthly', features: ['5×2ml travel sprays'], best_for: 'Low-friction trial', highlighted: true },
];

export const perfumeMarketGaps = [
  {
    id: 'pg1', title: 'AI-personalized fragrance discovery at scale',
    description: 'Buyers want help choosing a scent but no Indian brand offers a credible AI-driven "find your scent" beyond a basic quiz.',
    opportunity_score: 82, difficulty_score: 48, estimated_revenue: '₹75 Cr ARR by 2028',
    affected_segments: ['Gen Z first-time premium buyers', 'Gift purchasers'],
    explanation: {
      summary: 'A quiz is not a recommendation engine — there is real headroom for an AI-native fit tool.',
      why_it_matters: [
        'It removes the #1 friction point for first-time premium buyers.',
        'It generates first-party data you can use to personalize reorders.',
      ],
      evidence: [
        { label: 'Category signal', detail: '60% of premium fragrance sales influenced by digital touchpoint (s6).' },
        { label: 'Competitor gap', detail: 'Forest Essentials & Kama rely on in-store staff; no AI engine (s4, s5).' },
      ],
      sources: [perfumeSources[3], perfumeSources[4], perfumeSources[5]],
    },
  },
  {
    id: 'pg2', title: 'Refill programs across the category',
    description: 'Refill programs are boutique. No one has scaled refill across all SKUs with a credible eco-story.',
    opportunity_score: 74, difficulty_score: 58, estimated_revenue: '₹45 Cr ARR uplift',
    affected_segments: ['Premium buyers', 'Gen Z'],
    explanation: {
      summary: 'A refill story is cheap to market and increasingly expected by younger buyers.',
      why_it_matters: [
        'It increases LTV by lowering the friction to a second purchase.',
        'It signals sustainability without an upfront cost redesign.',
      ],
      evidence: [
        { label: 'Adoption signal', detail: 'Forest Essentials refill uptake at 15% — still early (s4).' },
        { label: 'Buyer expectation', detail: '63% of Gen Z buyers prefer refillable options (s2).' },
      ],
      sources: [perfumeSources[3], perfumeSources[1]],
    },
  },
  {
    id: 'pg3', title: 'Tier-2 city expansion',
    description: 'Tier-2 cities are the fastest-growing fragrance market but underserved by premium DTC brands.',
    opportunity_score: 80, difficulty_score: 62, estimated_revenue: '₹60 Cr ARR by 2028',
    affected_segments: ['Jaipur', 'Lucknow', 'Chandigarh', 'Indore'],
    explanation: {
      summary: 'The biggest regional expansion opportunity — crowded only at the very top.',
      why_it_matters: [
        'Rising disposable income means higher repeat purchase rates.',
        'Limited premium competition makes customer acquisition cheaper.',
      ],
      evidence: [
        { label: 'Growth', detail: 'Tier-2 premium fragrance grew 18% YoY (s1).' },
      ],
      sources: [perfumeSources[0]],
    },
  },
  {
    id: 'pg4', title: 'Men\'s premium fragrance line',
    description: 'Men\'s premium fragrance is growing 25% YoY but most brands focus on women.',
    opportunity_score: 76, difficulty_score: 55, estimated_revenue: '₹50 Cr ARR by 2028',
    affected_segments: ['Urban men 25-40', 'Gifting segment'],
    explanation: {
      summary: 'A clean opening in men\'s premium — most brands are still women-focused.',
      why_it_matters: [
        'Men\'s grooming is the fastest-growing segment in Indian beauty.',
        'Gifting occasions (Diwali, weddings) drive men\'s fragrance sales.',
      ],
      evidence: [
        { label: 'Growth', detail: 'Men\'s premium fragrance grew 25% YoY (s2).' },
      ],
      sources: [perfumeSources[1]],
    },
  },
];

export const perfumeInsights = [
  {
    id: 'pi1', title: 'Jo Malone\'s high price is your opening', category: 'Opportunity', impact: 'High', confidence: 78,
    summary: 'Jo Malone starts at ₹5,500 — leaving the ₹2,000–₹4,000 band wide open for Indian brands.',
    detail: 'A focused 6-SKU launch at ₹3,500 can out-convert a sprawling luxury line at equal CAC.',
    related_competitors: ['c3'],
    explanation: {
      summary: 'Use focus as a strategy, not a limitation.',
      why_it_matters: [
        'Hero-SKU brands like Kama get higher reorder rates per SKU.',
        'Press loves a clear story more than a wide assortment.',
      ],
      evidence: [
        { label: 'Buyer signal', detail: 'Niche brands with <15 SKUs see 1.4× higher sell-through (s6).' },
      ],
      sources: [perfumeSources[5]],
    },
  },
  {
    id: 'pi2', title: 'DTC-native discovery funnels are now table stakes', category: 'Risk', impact: 'Medium', confidence: 84,
    summary: 'If your DTC site doesn\'t have a frictionless discovery set, you\'re losing the consideration phase.',
    detail: '88% of Paas customers enter via a discovery set; this is becoming the default expectation.',
    related_competitors: ['c4'],
    explanation: {
      summary: 'Build a discovery set before your third SKU.',
      why_it_matters: [
        'It cuts the CAC payback period by 30–40%.',
        'It is the cheapest insurance against "I don\'t know which to pick" drop-off.',
      ],
      evidence: [
        { label: 'Adoption', detail: '88% of Paas customers use one (s8).' },
      ],
      sources: [perfumeSources[7]],
    },
  },
  {
    id: 'pi3', title: 'Tier-2 expansion has the lowest CAC today', category: 'Opportunity', impact: 'High', confidence: 72,
    summary: 'Tier-2 cities are the fastest-growing and have fewer premium DTC entrants.',
    detail: 'Lower competitive density = lower paid CAC. Plan a 2-quarter Tier-2 launch track.',
    related_competitors: [],
    explanation: {
      summary: 'Sequence: Tier-2 launch → influencer seeding → Nykaa expansion.',
      why_it_matters: [
        'Establishes brand before metro saturation.',
        'Rising disposable income makes retention easier.',
      ],
      evidence: [
        { label: 'Growth', detail: '18% YoY in Tier-2 (s1).' },
      ],
      sources: [perfumeSources[0]],
    },
  },
  {
    id: 'pi4', title: 'A premium "hand-finished" ritual beats celebrity perfume logic', category: 'Recommendation', impact: 'Medium', confidence: 70,
    summary: 'Ritual-led brands compound; celebrity-led launches are cyclical.',
    detail: 'Invest in a visible ritual (label, hand-wrap, refill) instead of a celebrity front-man.',
    related_competitors: ['c1'],
    explanation: {
      summary: 'Rituals compound over years; celebrity deals expire in quarters.',
      why_it_matters: [
        'Customer retention is durable, not campaign-driven.',
        'Press and gifting naturally pick up ritual stories.',
      ],
      evidence: [
        { label: 'Pattern', detail: 'Forest Essentials\' "handcrafted" ritual cited in 71% of gifting press (s4).' },
      ],
      sources: [perfumeSources[3]],
    },
  },
];

export const perfumeActionPlan = [
  { id: 'pa1', title: 'Launch 6-SKU hero line', owner: 'Product + Brand', priority: 'P0', horizon: 'Now', effort: 'High', impact: 'High', description: 'Curate 6 hero scents with backstories; avoid the Jo Malone sprawl trap.', rationale: 'Hero-SKU focus outperforms line-fatigue — see insight pi1.' },
  { id: 'pa2', title: 'Ship AI "find your scent" tool', owner: 'Product + Eng', priority: 'P0', horizon: 'Now', effort: 'Medium', impact: 'High', description: 'A 60-second quiz with an explainable recommendation.', rationale: 'Category gap, see insight pg1.' },
  { id: 'pa3', title: 'Launch discovery set', owner: 'Product + DTC', priority: 'P0', horizon: 'Now', effort: 'Low', impact: 'High', description: '5×2ml discovery set, founder note, free shipping over ₹2,000.', rationale: 'DTC funnel table stakes, see insight pi2.' },
  { id: 'pa4', title: 'Plan Tier-2 expansion', owner: 'Brand + GTM', priority: 'P1', horizon: 'Next', effort: 'High', impact: 'High', description: '2-quarter plan: influencer seeding + Nykaa listing + local content.', rationale: 'Lowest-CAC growth region, see insight pi3.' },
  { id: 'pa5', title: 'Roll out a refill program', owner: 'Ops + Brand', priority: 'P1', horizon: 'Next', effort: 'Medium', impact: 'Medium', description: 'In-store + mail-back refill; -20% pricing for refilled bottles.', rationale: 'Cheap sustainability story, see insight pg3.' },
  { id: 'pa6', title: 'Track synthetic-bio supplier landscape', owner: 'Strategy', priority: 'P2', horizon: 'Now', effort: 'Low', impact: 'Medium', description: 'Monthly review of biotech ingredient partners (Givaudan India, others).', rationale: 'Long-horizon moat, see insight pg2.' },
];

export const perfumeReports = [
  {
    id: 'pr-r1', title: 'Scentra — Competitive Landscape, Sep 2026',
    type: 'Executive Summary', date: '2026-09-01', pages: 8,
    summary: 'The Indian premium fragrance market is growing; Scentra\'s wedge is a curated hero line + AI discovery + Tier-2 expansion.',
    sections: [
      { heading: 'TL;DR', detail: 'Premium fragrance growing 11% YoY; the wedge is focus + AI discovery + Tier-2.' },
      { heading: 'Market', detail: 'Indian prestige fragrance now ₹4,200 Cr; niche at 15% of premium and growing fastest.' },
      { heading: 'Top 3 Moves', body: '1) Launch 6 hero SKUs. 2) Ship the AI scent quiz. 3) Plan Tier-2 expansion.' },
    ],
    explanation: {
      summary: 'A board-ready summary you can share with leadership.',
      why_it_matters: [
        'Aligns brand, product and GTM on a small set of moves.',
        'Reusable internal narrative for the next 90 days.',
      ],
      evidence: [
        { label: 'Market sizing', detail: 'Euromonitor India 2026 (s1).' },
        { label: 'Growth', detail: 'RedSeer DTC Beauty Report Q2 2026 (s6).' },
      ],
      sources: [perfumeSources[0], perfumeSources[5]],
    },
  },
  {
    id: 'pr-r2', title: 'Deep Dive: Premium Fragrance Pricing',
    type: 'Deep Dive', date: '2026-09-01', pages: 14,
    summary: 'Side-by-side pricing across Forest Essentials, Kama, Jo Malone and Paas.',
    sections: [
      { heading: 'Price bands', body: 'Three viable bands: ultra-premium (₹8,000+), premium (₹3,000–₹5,000), accessible premium (₹1,000–₹2,500).' },
      { heading: 'Discovery set pricing', body: 'A credible ₹1,500–₹2,500 discovery set is now an entry expectation.' },
      { heading: 'Recommendation', body: 'Anchor your core at ₹3,500 50ml with a ₹1,800 discovery set.' },
    ],
    explanation: {
      summary: 'Use this to set your launch pricing.',
      why_it_matters: [
        'Pricing is the most-leveraged early decision.',
        'Discovery set price anchors long-term AOV.',
      ],
      evidence: [
        { label: 'Data source', detail: 'Public pricing pages (s4, s5, s8).' },
      ],
      sources: [perfumeSources[3], perfumeSources[4], perfumeSources[7]],
    },
  },
  {
    id: 'pr-r3', title: 'Go-to-Market: Tier-2 Expansion Plan',
    type: 'Go-to-Market', date: '2026-09-01', pages: 10,
    summary: 'A 2-quarter plan to land in Tier-2 cities with a credible brand story.',
    sections: [
      { heading: 'ICP', body: 'Tier-2 women 22–35, prestige-aware, gift-purchase heavy.' },
      { heading: 'Motion', body: 'Influencer seeding + Nykaa listing + local language content.' },
      { heading: 'Pricing', body: 'Mirror metro pricing with a regional discovery set.' },
    ],
    explanation: {
      summary: 'A concrete GTM plan for the highest-leverage region.',
      why_it_matters: [
        'Lowest-CAC growth region of the next 3 years.',
        'Rising disposable income makes retention easier.',
      ],
      evidence: [
        { label: 'Market growth', detail: '18% YoY in Tier-2 (s1).' },
      ],
      sources: [perfumeSources[0]],
    },
  },
];

export const perfumeCharts = {
  market_share: {
    title: 'Estimated premium fragrance market share (India)',
    chart_type: 'bar' as const,
    labels: ['Forest Essentials', 'Kama', 'Jo Malone', 'Paas', 'Others'],
    datasets: [
      { name: 'Share', color: '#0ea5e9', values: [12, 9, 15, 3, 61] },
    ],
    explanation: {
      summary: 'A long-tail market — even leaders have only mid-teens share.',
      why_it_matters: [
        'You do not need to dethrone anyone to build a ₹50 Cr brand.',
        'The category has room for new entrants at every price band.',
      ],
      evidence: [{ label: 'Data source', detail: 'Euromonitor India 2026 (s1).' }],
      sources: [perfumeSources[0]],
    },
  },
  growth: {
    title: 'YoY revenue growth by brand',
    chart_type: 'line' as const,
    labels: ['2023', '2024', '2025', '2026'],
    datasets: [
      { name: 'Forest Essentials', color: '#059669', values: [18, 20, 22, 22] },
      { name: 'Kama', color: '#b45309', values: [14, 16, 18, 18] },
      { name: 'Jo Malone', color: '#6b7280', values: [20, 22, 25, 25] },
      { name: 'Paas', color: '#f43f5e', values: [80, 110, 140, 140] },
    ],
    explanation: {
      summary: 'Paas is the outlier — incumbents are steady, Paas is the disruptor.',
      why_it_matters: [
        'A fast-growing small brand resets the category narrative for everyone.',
        'Incumbents\' growth rate defines "safe" — anything less looks stale.',
      ],
      evidence: [{ label: 'Data source', detail: 'Brand reviews + RedSeer (s5, s6, s8).' }],
      sources: [perfumeSources[4], perfumeSources[5], perfumeSources[7]],
    },
  },
  pricing: {
    title: 'Average 50ml EDP price (₹)',
    chart_type: 'bar' as const,
    labels: ['Forest Essentials', 'Kama', 'Jo Malone', 'Paas'],
    datasets: [
      { name: 'Price', color: '#10a37f', values: [5500, 4200, 8500, 1200] },
    ],
    explanation: {
      summary: 'Four brands, four price ladders — Jo Malone is the "aspirational" anchor.',
      why_it_matters: [
        'Your 50ml anchor will be compared to all four.',
        'The ₹2,000–₹4,000 band is wide open for Indian brands.',
      ],
      evidence: [{ label: 'Data source', detail: 'Public pricing pages, Aug 2026 (s4, s5, s6, s8).' }],
      sources: [perfumeSources[3], perfumeSources[4], perfumeSources[5], perfumeSources[7]],
    },
  },
  feature_adoption: {
    title: 'Adoption of "next-gen" features (%)',
    chart_type: 'area' as const,
    labels: ['Discovery set', 'Refill', 'Gifting', 'AI quiz'],
    datasets: [
      { name: 'Forest Essentials', color: '#059669', values: [65, 15, 71, 0] },
      { name: 'Kama', color: '#b45309', values: [58, 0, 62, 0] },
      { name: 'Jo Malone', color: '#6b7280', values: [72, 0, 85, 0] },
    ],
    explanation: {
      summary: 'AI discovery is at 0% across the board — a clean opening.',
      why_it_matters: [
        'A first-mover AI quiz becomes a press story and a competitive moat.',
        'Refill is real but small — the category is still figuring it out.',
      ],
      evidence: [{ label: 'Data source', detail: 'Public brand materials (s4, s5, s6).' }],
      sources: [perfumeSources[3], perfumeSources[4], perfumeSources[5]],
    },
  },
};

export const perfumeInitialMessage = {
  id: 'pm0', role: 'assistant' as const,
  text: `I\'ve finished a first pass on the competitive landscape for **Scentra**. Here\'s a quick orientation:

- The Indian premium fragrance market is **₹4,200 Cr and growing ~11% YoY** (Euromonitor).
- **Jo Malone** is the luxury benchmark; **Forest Essentials** and **Kama** define Ayurvedic premium.
- **Paas** is the fastest-growing disruptor — watch their playbook.
- **Tier-2 cities** are the highest-leverage expansion region.

Try: "Show me a SWOT for Jo Malone", "Compare pricing across the top 3", or "Where are the biggest gaps?"`,
  createdAt: 0,
};

export const perfumeProfileFromRequest: BusinessProfile = {
  businessName: perfumeRequest.business_name,
  idea: perfumeRequest.idea,
  industry: perfumeRequest.industry,
  productsServices: perfumeRequest.products_services,
  targetCustomers: perfumeRequest.target_customers,
  geography: perfumeRequest.geography,
  pricing: perfumeRequest.pricing,
  businessModel: perfumeRequest.business_model,
  competitors: perfumeRequest.competitors,
  differentiators: perfumeRequest.differentiators,
  researchGoals: perfumeRequest.research_goals,
};

// ----- Wire → Internal chart conversion -----
const palette = ['#10a37f', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6', '#0ea5e9'];
const pickColor = (i: number) => palette[i % palette.length];

const convertChart = (ch: { title: string; chart_type: string; labels: string[]; datasets: { name?: string; color?: string; values?: number[] }[]; explanation: Parameters<typeof convertExplanation>[0] }) => ({
  title: ch.title,
  kind: ch.chart_type as 'bar' | 'line' | 'area' | 'radar' | 'pie',
  xLabel: '',
  yLabel: '',
  series: ch.datasets.map((d, di) => ({
    id: `s-${di}`,
    name: d.name ?? `Series ${di + 1}`,
    color: d.color ?? pickColor(di),
    points: (ch.labels ?? []).map((l, li) => ({ label: l, value: d.values?.[li] ?? 0 })),
  })),
  explanation: convertExplanation(ch.explanation),
});

// Convert wire-format explanation (snake_case) to internal (camelCase)
const convertExplanation = (e: {
  summary: string;
  why_it_matters: string[];
  evidence: { label: string; detail: string }[];
  sources: typeof perfumeSources;
}) => ({
  summary: e.summary,
  whyItMatters: e.why_it_matters,
  evidence: e.evidence,
  sources: e.sources,
});

const initialConversation = [perfumeInitialMessage];

export const perfumeAnalysis = {
  businessName: perfumeRequest.business_name,
  industry: perfumeRequest.industry,
  idea: perfumeRequest.idea,
  targetCustomers: perfumeRequest.target_customers,
  geography: perfumeRequest.geography,
  pricing: perfumeRequest.pricing,
  businessModel: perfumeRequest.business_model,
  differentiators: perfumeRequest.differentiators,
  researchGoals: perfumeRequest.research_goals,
  profile: perfumeProfileFromRequest,
  competitors: perfumeCompetitors.map((c) => ({
    id: c.id ?? c.name.toLowerCase().replace(/\s+/g, '-'),
    name: c.name,
    logoColor: c.logo_color ?? 'bg-ink-700',
    description: c.description ?? '',
    funding: c.funding,
    founded: c.founded,
    hq: c.hq,
    marketShare: c.market_share ?? 0,
    growthRate: c.growth_rate ?? 0,
    pricingTier: c.pricing_tier ?? 'Paid',
    marketPosition: (c.market_position ?? 'Niche') as 'Leader' | 'Challenger' | 'Niche' | 'Emerging',
    strengths: c.strengths ?? [],
    weaknesses: c.weaknesses ?? [],
    swot: {
      strengths: c.swot?.strengths ?? [],
      weaknesses: c.swot?.weaknesses ?? [],
      opportunities: c.swot?.opportunities ?? [],
      threats: c.swot?.threats ?? [],
    },
    explanation: convertExplanation(c.explanation),
  })),
  products: perfumeProducts.map((p) => ({
    id: p.id,
    competitorId: p.competitor_id,
    name: p.name,
    tagline: p.tagline,
    category: p.category,
    pricingModel: p.pricing_model,
    startingPrice: p.starting_price,
    features: p.features.map((f) => ({
      ...f,
      maturity: f.maturity as 'Beta' | 'GA' | 'Deprecated' | 'Roadmap',
    })),
    explanation: p.explanation ? convertExplanation(p.explanation) : undefined,
  })),
  pricingTiers: perfumePricing.map((t) => ({
    id: t.id,
    competitorId: t.competitor_id,
    name: t.name,
    priceMonthly: t.price_monthly,
    billing: t.billing as 'monthly' | 'yearly',
    features: t.features,
    bestFor: t.best_for,
    highlighted: t.highlighted,
  })),
  marketGaps: perfumeMarketGaps.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    opportunityScore: g.opportunity_score,
    difficultyScore: g.difficulty_score,
    estimatedRevenue: g.estimated_revenue,
    affectedSegments: g.affected_segments,
    explanation: g.explanation ? convertExplanation(g.explanation) : undefined,
  })),
  insights: perfumeInsights.map((i) => ({
    id: i.id,
    title: i.title,
    category: i.category as 'Opportunity' | 'Risk' | 'Trend' | 'Recommendation' | 'Insight',
    impact: i.impact as 'High' | 'Medium' | 'Low',
    confidence: i.confidence,
    summary: i.summary,
    detail: i.detail,
    relatedCompetitors: i.related_competitors,
    explanation: i.explanation ? convertExplanation(i.explanation) : undefined,
  })),
  recommendations: perfumeInsights.slice(0, 2).map((i) => ({
    id: `rec-${i.id}`,
    title: `Recommend: ${i.title}`,
    category: 'Recommendation' as const,
    impact: i.impact as 'High' | 'Medium' | 'Low',
    confidence: i.confidence,
    summary: i.summary,
    detail: i.detail,
    relatedCompetitors: i.related_competitors,
    explanation: i.explanation ? convertExplanation(i.explanation) : undefined,
  })),
  actionPlan: perfumeActionPlan.map((a) => ({
    ...a,
    priority: a.priority as 'P0' | 'P1' | 'P2',
    horizon: a.horizon as 'Now' | 'Next' | 'Later',
    effort: a.effort as 'Low' | 'Medium' | 'High',
    impact: a.impact as 'Low' | 'Medium' | 'High',
  })),
  reports: perfumeReports.map((r) => ({
    ...r,
    type: r.type as 'Executive Summary' | 'Deep Dive' | 'Market Landscape' | 'Go-to-Market',
    explanation: r.explanation ? convertExplanation(r.explanation) : undefined,
  })),
  charts: {
    marketShare: convertChart(perfumeCharts.market_share),
    growth: convertChart(perfumeCharts.growth),
    pricing: convertChart(perfumeCharts.pricing),
    featureAdoption: convertChart(perfumeCharts.feature_adoption),
  },
  swot: {
    strengths: ['Growing Indian premium fragrance market', 'DTC-first brands gaining share'],
    weaknesses: ['High CAC in crowded market', 'Ingredient supply volatility'],
    opportunities: ['AI-personalized discovery', 'Tier-2 expansion', 'Refill programs'],
    threats: ['Celebrity fragrance saturation', 'International brand entry'],
  },
  sources: perfumeSources,
  conversation: initialConversation,
};
