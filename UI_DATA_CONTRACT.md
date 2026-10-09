# UI Data Contract — Competitive Insights Dashboard

> **Scope:** Phase 1 — frontend data contract discovery only. This document is
> derived purely from code inspection of the `CompetitorAnalysisUI` repository. It
> does **not** describe or modify the backend orchestrator response schema. No
> changes have been made to any source code.

---

## 0. Summary of the Data Pipeline

```
User submits questionnaire
        │
        ▼
App.tsx → api.bootstrap(profile)
        │
        ▼
src/api/client.ts → POST /api/v1/parser/execute
        │  body: { parser_input: { intent: 'bootstrap', form_input, requested_count } }
        │
        ▼
OrchestratorResponse  (HTTP 200, { status, data?, answer?, error?, missing_data?, ... })
        │
        ▼
mapAnalysisData(raw.data, profile)   ← THE ONLY MAPPING LAYER
        │  Converts wire payload (snake_case, loosely typed) → AnalysisData (camelCase)
        │
        ▼
AnalysisData  (canonical UI state model)
        │
        ▼
App.tsx holds AnalysisData in React state → TabContent → per-tab views → component tree
```

**Key file:** `src/api/client.ts` — contains both the API client (`OrchestratorApi`)
and the **only** normalization function (`mapAnalysisData`) that translates the wire
response into the canonical UI model.

**Key type:** `AnalysisData` in `src/types.ts` (lines 282–319) — the single source of
truth for what the dashboard renders.

---

## 1. TypeScript Types — The Canonical UI Model

All types live in `src/types.ts`. The UI consumes **camelCase** domain types. The
backend sends **snake_case** wire fields; the UI does **not** read snake_case
directly — every field passes through `mapAnalysisData`.

### 1.1 `AnalysisData` (root state — `src/types.ts:282`)

```typescript
export interface AnalysisData {
  businessName: string;        // from profile — always present
  industry: string;            // from profile — always present
  idea: string;                // from profile — always present
  businessSummary?: string;    // from raw.business_summary
  executiveSummary?: string;   // from raw.executive_summary OR raw.report (if string)  ← NARRATIVE
  positioning?: string;        // from raw.positioning
  metricCards?: AnalysisMetric[];  // from raw.metric_cards
  targetCustomers?: string;    // from profile
  geography?: string;          // from profile
  pricing?: string;            // from profile
  businessModel?: string;
  differentiators?: string;
  researchGoals?: string[];
  profile: BusinessProfile;    // required
  competitors: Competitor[];   // array, possibly empty
  products: Product[];         // array, possibly empty
  pricingTiers: PricingTier[]; // array, possibly empty
  marketGaps: MarketGap[];     // array, possibly empty
  insights: InsightItem[];    // array, possibly empty
  recommendations: InsightItem[];
  actionPlan: ActionPlanItem[];
  reports: Report[];
  charts: {
    marketShare: ChartData;
    marketSharePie: ChartData;
    growth: ChartData;
    growthPie: ChartData;
    pricing: ChartData;
    pricingPie: ChartData;
    featureAdoption: ChartData;
    featureAdoptionPie: ChartData;
  };
  swot?: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  sources: Source[];
}
```

| Field | Type | Required? | Notes |
|-------|------|-----------|-------|
| `businessName` | string | Yes (from profile) | Sidebar title, Overview header |
| `industry` | string | Yes (from profile) | Overview badge |
| `idea` | string | Yes (from profile) | Overview subtitle |
| `profile` | BusinessProfile | Yes | Always present; mirrors questionnaire |
| `competitors` | Competitor[] | Yes (array) | May be empty — triggers placeholder |
| `products` | Product[] | Yes (array) | May be empty — triggers placeholder |
| `pricingTiers` | PricingTier[] | Yes (array) | May be empty — triggers placeholder |
| `marketGaps` | MarketGap[] | Yes (array) | May be empty — triggers placeholder |
| `insights` | InsightItem[] | Yes (array) | May be empty — triggers placeholder |
| `recommendations` | InsightItem[] | Yes (array) | May be empty |
| `actionPlan` | ActionPlanItem[] | Yes (array) | May be empty — section hidden |
| `reports` | Report[] | Yes (array) | May be empty — triggers placeholder |
| `charts` | object (8 fixed keys) | Yes (object) | Each ChartData has `series: []` when empty |
| `swot` | object | Optional | Undefined when `raw.swot` is not a record |
| `sources` | Source[] | Yes (array) | May be empty — triggers placeholder |
| `executiveSummary` | string | Optional | **THE NARRATIVE FIELD — see §6** |
| `businessSummary` | string | Optional | Fallback narrative |
| `positioning` | string | Optional | One-line positioning |
| `metricCards` | AnalysisMetric[] | Optional | Extra KPI cards below stats |

### 1.2 `BusinessProfile` (`src/types.ts:12`)

Mirrors the questionnaire form and the `POST /api/v1/analyze` request body.

| Field | Type | Required? | Notes |
|-------|------|-----------|-------|
| `businessName` | string | Yes | Used for API request + all headers |
| `idea` | string | Yes | Used for API request |
| `industry` | string | Yes | Used for API request |
| `productsServices` | string[] | No | Form only — not rendered in dashboard |
| `targetCustomers` | string | No | Overview badge area |
| `geography` | string | No | Overview badge |
| `pricing` | string | No | Form only — used for context |
| `businessModel` | string | No | Form only |
| `competitors` | string[] | No | Form only — suggested names |
| `differentiators` | string | No | Form only |
| `researchGoals` | string[] | No | Overview stat ("Goals") |

### 1.3 `Competitor` (`src/types.ts:47`)

| Field | Type | Required? | UI Usage |
|-------|------|-----------|----------|
| `id` | string | Yes | React key, URL slug |
| `name` | string | Yes | Card header, table row name |
| `logoColor` | string (CSS class or hex) | No | 2-char logo background |
| `description` | string | Yes | Card body text |
| `funding` | string | No | Competitor stat (or `—`) |
| `founded` | string | No | Competitor stat (or `—`) |
| `hq` | string | No | Comparison table column |
| `marketShare` | number | No | Stat `%` and charts |
| `growthRate` | number | No | Stat `%` (green if >30) |
| `pricingTier` | string | No | Gray badge + table |
| `marketPosition` | `'Leader'\|'Challenger'\|'Niche'\|'Emerging'` | No | Colored badge |
| `strengths` | string[] | Yes | List (max 3 shown) |
| `weaknesses` | string[] | Yes | List (max 3 shown, first for table) |
| `swot` | `{ strengths, weaknesses, opportunities, threats: string[] }` | Yes | Expandable SWOT grid |
| `explanation` | Explanation | No | "Explain this" modal |

**Missing-data behavior:** If `strengths` or `weaknesses` is empty, the SWOT panels
render empty lists. If `marketShare`/`growthRate` are `undefined`, the stat shows `—`.

### 1.4 `Product` + `ProductFeature` (`src/types.ts:73, 65`)

| Field | Type | Required? | UI Usage |
|-------|------|-----------|----------|
| `id` | string | Yes | React key |
| `competitorId` | string | No | Association (not rendered directly) |
| `name` | string | Yes | Product breakdown header |
| `tagline` | string | No | Subtitle |
| `category` | string | No | Blue badge |
| `pricingModel` | string | No | Gray badge |
| `startingPrice` | number | No | "From ₹{price}" |
| `features` | ProductFeature[] | Yes | Feature list |
| `explanation` | Explanation | No | "Explain this" modal |

`ProductFeature`:

| Field | Type | Required? | UI Usage |
|-------|------|-----------|----------|
| `id` | string | Yes | React key |
| `name` | string | Yes | Feature label |
| `description` | string | Yes | Subtext |
| `maturity` | `'Beta'\|'GA'\|'Deprecated'\|'Roadmap'` | No | Badge (default: GA) |
| `adoption` | number (0–100) | No | Progress bar `%` |

### 1.5 `PricingTier` (`src/types.ts:85`)

| Field | Type | Required? | UI Usage |
|-------|------|-----------|----------|
| `id` | string | Yes | React key |
| `competitorId` | string | No | Filter association |
| `name` | string | Yes | Card title |
| `priceMonthly` | number \| string | No | Price display (or `Not reported`) |
| `billing` | `'monthly'\|'yearly'` | No | Badge |
| `features` | string[] | Yes | Feature list |
| `bestFor` | string | No | Subtitle |
| `pricingModel` | string | No | Badge (falls back to `billing`) |
| `highlighted` | boolean | No | "Most popular" badge |

### 1.6 `MarketGap` (`src/types.ts:97`)

| Field | Type | Required? | UI Usage |
|-------|------|-----------|----------|
| `id` | string | Yes | React key |
| `title` | string | Yes | Card title |
| `description` | string | Yes | Card body |
| `opportunityScore` | number (0–100) | No | Green progress bar `/100` (or `Not reported`) |
| `difficultyScore` | number (0–100) | No | Rose progress bar `/100` (or `Not reported`) |
| `estimatedRevenue` | string | No | Gray badge |
| `affectedSegments` | string[] | No | Blue badges |
| `explanation` | Explanation | No | "Explain this" modal |

### 1.7 `InsightItem` (`src/types.ts:108`)

Shared by `insights` and `recommendations`.

| Field | Type | Required? | UI Usage |
|-------|------|-----------|----------|
| `id` | string | Yes | React key |
| `title` | string | Yes | Card title |
| `category` | `'Opportunity'\|'Risk'\|'Trend'\|'Recommendation'\|'Insight'` | No | Colored badge (default: none shown) |
| `impact` | `'High'\|'Medium'\|'Low'` | No | Impact badge (or `—`) |
| `confidence` | number (0–100) | No | `{confidence}% confidence` (or `—`) |
| `summary` | string | Yes | Card body |
| `detail` | string | No | Expanded text |
| `relatedCompetitors` | string[] | No | Not rendered directly |
| `explanation` | Explanation | No | "Explain this" modal |

### 1.8 `ActionPlanItem` (`src/types.ts:120`)

| Field | Type | Required? | UI Usage |
|-------|------|-----------|----------|
| `id` | string | Yes | React key |
| `title` | string | Yes | Item title |
| `owner` | string | No | "Owner: {owner}" |
| `priority` | `'P0'\|'P1'\|'P2'` | No | Group header (default: `P2`) |
| `horizon` | `'Now'\|'Next'\|'Later'` | No | Text |
| `effort` | `'Low'\|'Medium'\|'High'` | No | Text |
| `impact` | `'Low'\|'Medium'\|'High'` | No | Text |
| `description` | string | Yes | Item body |
| `rationale` | string | No | "Why: {rationale}" |

### 1.9 `Report` + `ReportSection` (`src/types.ts:137, 132`)

| Field | Type | Required? | UI Usage |
|-------|------|-----------|----------|
| `id` | string | Yes | React key |
| `title` | string | Yes | Card title |
| `type` | `'Executive Summary'\|'Deep Dive'\|'Market Landscape'\|'Go-to-Market'` | No | Blue badge (or `Report`) |
| `date` | string | No | Text (or `—`) |
| `pages` | number | No | "{pages} pages" badge |
| `summary` | string | Yes | Card body |
| `sections` | `{ heading: string; body: string }[]` | Yes | Expandable list |
| `explanation` | Explanation | No | "Explain this" modal |

### 1.10 `ChartData`, `ChartSeries`, `ChartPoint` (`src/types.ts:148, 150, 157`)

| Field | Type | Required? | UI Usage |
|-------|------|-----------|----------|
| `title` | string | Yes | Chart card header |
| `kind` | `'bar'\|'line'\|'area'\|'radar'\|'pie'` | Yes | Determines rendered SVG type |
| `xLabel` / `yLabel` | string | No | Axis labels |
| `series` | ChartSeries[] | Yes | Data series |
| `explanation` | Explanation | No | "Explain this" modal |

`ChartSeries`:
| Field | Type | Required? | UI Usage |
|-------|------|-----------|----------|
| `id` | string | Yes | React key |
| `name` | string | Yes | Legend label |
| `color` | string (hex) | Yes | Series color |
| `points` | ChartPoint[] | Yes | Data points |

`ChartPoint`:
| Field | Type | Required? | UI Usage |
|-------|------|-----------|----------|
| `label` | string | Yes | X-axis / legend label |
| `value` | number | Yes | Y-axis / slice value |
| `color` | string | No | Per-point color override |

### 1.11 `Source` (`src/types.ts:28`)

| Field | Type | Required? | UI Usage |
|-------|------|-----------|----------|
| `id` | string | Yes | React key |
| `title` | string | Yes | Source title (or link text) |
| `url` | string | No | External link icon |
| `publisher` | string | No | `"{publisher} · {date}"` |
| `date` | string | No | Same subtitle line |
| `snippet` | string | No | Body text |

### 1.12 `Explanation` (`src/types.ts:38`)

Used by the "Explain this" modal (triggered via `ExplainButton`).

| Field | Type | Required? | UI Usage |
|-------|------|-----------|----------|
| `summary` | string | Yes | Modal body |
| `whyItMatters` | string[] | No | "Why it matters" list |
| `evidence` | `{ label: string; detail: string }[]` | No | Badge + detail pairs |
| `sources` | Source[] | No | Source list in modal |

### 1.13 `AnalysisMetric` (`src/types.ts:166`)

| Field | Type | Required? | UI Usage |
|-------|------|-----------|----------|
| `id` | string | Yes | React key |
| `label` | string | Yes | Card label |
| `value` | string \| number | Yes | Card value |
| `change` | string | No | Change indicator text |

### 1.14 `OrchestratorResponse` (wire-level types — `src/types.ts:248`)

```typescript
export interface OrchestratorResponse {
  status: 'success' | 'partial' | 'error';
  intent?: string;
  data?: OrchestratorData | null;     // ← passed to mapAnalysisData
  answer?: AnswerBlock | null;        // ← used by ActionResultView for actions
  explanation?: string | null;        // ← used by ActionResultView
  missing_data?: { field: string; reason: string; severity?: string }[];
  context_update?: ContextUpdate | null;
  evicted_entities?: string[];
  error?: string | null;
  result_counts?: { requested: number; retrieved: number; valid: number; displayed: number };
  operations_performed?: string[];
  entity_statuses?: { competitors: { id; name; status; missing_fields; source?; lookupConfidence? }[] };
}
```

`OrchestratorData` (`src/types.ts:232`) — the `data` sub-object, typed as `any` for most fields:

```typescript
export interface OrchestratorData {
  business_summary?: string;
  executive_summary?: string;
  positioning?: string;
  competitors?: any[];
  swot?: any;
  charts?: any[];
  metric_cards?: any[];
  insights?: any[];
  recommendations?: any[];
  action_plan?: any[];
  report?: string;         // ← STRING fallback for executiveSummary (see §6)
  sources?: any[];
  [key: string]: any;       // ← accepts any additional fields
}
```

---

## 2. Per-Section UI Contract

The tab router is in `src/views/TabViews.tsx`. All views consume `AnalysisData`.

### 2.1 Overview — `OverviewDashboard` (`src/components/OverviewDashboard.tsx`)

Routes from `TabViews.tsx:48` → `Overview({ data })` → `OverviewDashboard({ data })`.

**Fields consumed:**

| AnalysisData field | Component element | Required? |
|---|---|---|
| `profile.businessName` | PageHeader title | Yes |
| `profile.idea` | PageHeader subtitle | Yes |
| `profile.industry` | Badge | Yes |
| `profile.geography` | Badge | No |
| `executiveSummary` \| `businessSummary` | `SafeText` in "Executive Summary" | No — **only renders if truthy** |
| `positioning` | `<p>` after summary | No |
| `competitors.length` | Stat card "Competitors" | Yes (shows number) |
| `marketGaps.length` | Stat card "Market gaps" | Yes |
| `insights.length` | Stat card "Insights" | Yes |
| `sources.length` | Stat card "Sources" | Yes |
| `reports.length` | Stat card "Reports" | Yes |
| `profile.researchGoals?.length` | Stat card "Goals" | Yes (shows 0 if missing) |
| `metricCards` | KPI cards below stats | Optional — hidden if absent/empty |
| `insights[0]` | Compact InsightCard in summary card | Optional |
| `marketGaps[0]` | "Top gap" card | Optional |
| `competitors` | CompetitorGrid + ComparisonTable | Optional — hidden if `competitors.length === 0` |
| `charts` | Market Overview charts | Optional — only charts with `series.length > 0` render |
| `pricingTiers` | Pricing table (if `isPricingFocus`) | Optional |
| `marketGaps` | Market Gaps cards | Optional — hidden if empty |
| `insights` (filtered) | Insights & Recommendations | Optional — hidden if all empty |
| `actionPlan` | Action Plan list | Optional — hidden if empty |
| `sources` | Sources list | Optional — hidden if empty |

**Stat cards** always render (even when all are 0). The `charts` object is always
present (8 fixed keys), but each `ChartData` has `series: []` when no data exists.

**Radar chart** (`radarChart` in `OverviewDashboard.tsx:18`): only renders if
`competitors.length >= 2` AND every competitor in the set has at least one of
`marketShare` or `growthRate` defined.

**Missing-data behavior:** When `executiveSummary` is truthy but all arrays are
empty, the Overview shows the narrative text + all-zero stat cards + no charts +
no competitor cards. The Sections below correctly fall back to placeholders.

### 2.2 Competitors — `CompetitorsView` (`TabViews.tsx:68`)

Components: `CompetitorCard` (`src/components/CompetitorCard.tsx`), `ComparisonTable`
(`src/components/ComparisonTable.tsx`), `CompetitorsPlaceholder`
(`src/components/SectionPlaceholder.tsx`).

| Field | Component | Required? | Missing-data behavior |
|---|---|---|---|
| `data.competitors` (array) | `CompetitorCard` in 2-col grid + `ComparisonTable` | Yes | If empty array → `CompetitorsPlaceholder` |
| `competitor.name` | Card header | Yes | If no competitors, not reached |
| `competitor.logoColor` | Logo bg | No | Defaults to `bg-ink-500` |
| `competitor.description` | Card body | Yes (`Competitor.description: string`) | Rendered as-is (no SafeText) |
| `competitor.marketShare` | Stat `%` | No | Undefined → `—` |
| `competitor.growthRate` | Stat `%`, green if >30 | No | Undefined → `—` |
| `competitor.funding` | Stat | No | Undefined → `—` |
| `competitor.founded` | Stat | No | Undefined → `—` |
| `competitor.hq` | ComparisonTable cell | No | Undefined → `—` |
| `competitor.pricingTier` | Badge + table | No | Undefined → `—` |
| `competitor.marketPosition` | Badge | No | Undefined → no badge |
| `competitor.strengths` | List (max 3) | Yes | Empty array → no items |
| `competitor.weaknesses` | List (max 3) | Yes | Empty array → no items; `[0]` → `—` in table |
| `competitor.swot` | Expandable grid (4 panels) | Yes | Defaults to all-empty arrays |
| `competitor.explanation` | ExplainButton | No | Button not shown if absent |

**ComparisonTable columns:** Vendor, Share, Growth, Pricing tier, Position, Weakness
`weaknesses[0]` → `—` if absent.

### 2.3 Products — `ProductsView` (`TabViews.tsx:119`)

Component: `ProductBreakdown` (`src/components/ProductBreakdown.tsx`),
`ProductsPlaceholder` (`src/components/SectionPlaceholder.tsx`).

| Field | Component | Required? | Missing-data behavior |
|---|---|---|---|
| `data.products` (array) | ProductBreakdown button list | Yes | If empty → `ProductsPlaceholder` |
| `product.name` | Header | Yes | If no products, not reached |
| `product.tagline` | Subtitle | No | Undefined → no subtitle line |
| `product.category` | Badge | No | Undefined → no badge |
| `product.pricingModel` | Badge | No | Undefined → no badge |
| `product.startingPrice` | "From ₹{price}" | No | Undefined → `From ₹undefined` *(see note below)* |
| `product.features[]` | Filterable list | Yes | Empty → "No features match." |
| `feature.name` | Label | Yes | Required for card (filtered out if absent) |
| `feature.description` | Subtext | Yes | Empty string if not provided |
| `feature.maturity` | Badge (default GA) | No | Undefined → GA badge |
| `feature.adoption` | Progress bar `%` | No | Undefined → NaN% *(see note below)* |

> **Note — `startingPrice` bug:** ProductBreakdown line 32: `₹{product.startingPrice?.toLocaleString('en-IN')}` — when `startingPrice` is `undefined`, renders "From ₹undefined". This is a rendering bug, not a contract issue.

> **Note — `adoption` bug:** ProductBreakdown line 80: `{f.adoption}%` — when `adoption` is `undefined`, renders "NaN%". The progress bar width also becomes `NaN%`.

### 2.4 Pricing — `PricingView` (`TabViews.tsx:149`)

Components: `PricingTable` (`src/components/PricingTable.tsx`),
`Chart` (`src/components/Chart.tsx`), `PricingPlaceholder`
(`src/components/SectionPlaceholder.tsx`).

| Field | Component | Required? | Missing-data behavior |
|---|---|---|---|
| `data.pricingTiers` (array) | `PricingTable` + `Chart` | Yes | If empty → `PricingPlaceholder` |
| `data.charts.pricingPie` | `Chart` (pie) | Optional | Only rendered if `pricingPie.series.length > 0` |
| `tier.name` | Card title | Yes | Required for card |
| `tier.highlighted` | "Most popular" badge | No | Undefined → no badge |
| `tier.pricingModel` \| `tier.billing` | Badge | No | Undefined → no badge |
| `tier.bestFor` | Subtitle | No | Undefined → no subtitle |
| `tier.priceMonthly` | Price display | No | Undefined → "Not reported" |
| `tier.features[]` | Feature list | Yes | Empty array → no items |

Pricing filter buttons are derived from `data.competitors` (one button per competitor
plus "All"). If `competitors` is empty, only "All" shows.

### 2.5 Market Gaps — `MarketGapsView` (`TabViews.tsx:196`)

Component: `MarketGapCard` (in `src/components/AssetCards.tsx`),
`MarketGapsPlaceholder` (`src/components/SectionPlaceholder.tsx`).

| Field | Component | Required? | Missing-data behavior |
|---|---|---|---|
| `data.marketGaps` (array) | `MarketGapCard` in 2-col grid | Yes | If empty → `MarketGapsPlaceholder` |
| `gap.title` | Card title | Yes | Required for card |
| `gap.description` | Card body | Yes | Empty string if not provided |
| `gap.estimatedRevenue` | Gray badge | No | Undefined → no badge |
| `gap.opportunityScore` | Green progress bar | No | Undefined → "Not reported" |
| `gap.difficultyScore` | Rose progress bar | No | Undefined → "Not reported" |
| `gap.affectedSegments[]` | Blue badges | No | Undefined / empty → no badges |
| `gap.explanation` | ExplainButton | No | Button not shown if absent |

### 2.6 Insights & Recommendations — `InsightsView` (`TabViews.tsx:209`)

Components: `InsightCard` (in `src/components/AssetCards.tsx`),
`InsightsPlaceholder` (`src/components/SectionPlaceholder.tsx`).

| Field | Component | Required? | Missing-data behavior |
|---|---|---|---|
| `data.insights` + `data.recommendations` (merged) | `InsightCard` in 2-col grid | Yes | If all empty → `InsightsPlaceholder` |
| `item.title` | Card title | Yes | Required for card |
| `item.summary` | Card body via `SafeText` | Yes | Empty string if not provided |
| `item.detail` | Expanded text via `SafeText` | No | Not shown if absent |
| `item.category` | Colored badge | No | Undefined → no badge |
| `item.impact` | Impact badge | No | Undefined → no badge |
| `item.confidence` | "{confidence}% confidence" | No | Undefined → `—` |
| `item.explanation` | ExplainButton | No | Button not shown if absent |

**Filter:** Tabs for All/Opportunity/Risk/Trend/Recommendation. The filter
matches `item.category === filter`. Uncategorized items (category undefined)
only show under "All".

### 2.7 Reports — `ReportsView` (`TabViews.tsx:241`)

Components: `ReportCard` (in `src/components/AssetCards.tsx`),
`ActionPlanList` (in `src/components/AssetCards.tsx`),
`ReportsPlaceholder` (`src/components/SectionPlaceholder.tsx`).

| Field | Component | Required? | Missing-data behavior |
|---|---|---|---|
| `data.reports` (array) | `ReportCard` list | Yes | If empty → `ReportsPlaceholder` |
| `data.actionPlan` (array) | `ActionPlanList` | Yes | If empty → section hidden entirely |
| `report.title` | Card title | Yes | Required for card |
| `report.type` | Blue badge | No | Undefined → "Report" badge |
| `report.date` | Text | No | Undefined → `—` |
| `report.pages` | Gray badge | No | Undefined → no badge |
| `report.summary` | Card body via `SafeText` | Yes | Empty string if not provided |
| `report.sections[]` | Heading + body list | Yes | Empty array → no sections |
| `section.heading` | Heading (uppercase) | Yes | Required for section (filtered out if absent) |
| `section.body` | Body via `SafeText` | Yes | Empty string if not provided |
| `report.explanation` | ExplainButton | No | Button not shown if absent |

**ActionPlanList** always gets a synthetic `explanation` object (hardcoded in
`TabViews.tsx:253-258`), not from the backend.

### 2.8 Sources — `SourcesView` (`TabViews.tsx:266`)

Components: `SourcesList` (in `src/components/AssetCards.tsx`),
`SourcesPlaceholder` (`src/components/SectionPlaceholder.tsx`).

| Field | Component | Required? | Missing-data behavior |
|---|---|---|---|
| `data.sources` (array) | `SourcesList` as card list | Yes | If empty → `SourcesPlaceholder` |
| `source.title` | List item title | Yes | Required for source (filtered out if absent) |
| `source.url` | External link icon | No | Undefined → no link icon |
| `source.publisher` | Subtitle text | No | Undefined → omitted from `{publisher} · {date}` |
| `source.date` | Subtitle text | No | Undefined → omitted |
| `source.snippet` | Body text | No | Undefined → no snippet |

**Global warning** (`App.tsx:171-175`): When `sampleId === null` AND
`data.sources.length === 0`, a persistent amber banner appears above the main
content: "This analysis has no supporting sources. Treat narrative claims and
metrics as unverified."

### 2.9 Charts (Overview + Pricing tabs) — `Chart` (`src/components/Chart.tsx`)

The `charts` object always has 8 fixed keys. Each is rendered only if
`series.length > 0` (OverviewDashboard filter at line 70). When a chart has no
series, it either doesn't render (Overview) or shows "No data available"
(Chart.tsx:91-97 when kind is unrecognized, but in practice empty charts are
filtered out before reaching the Chart component).

| Chart key | Kind | Source data | Conditional rendering |
|-----------|------|-------------|----------------------|
| `marketShare` | bar | `competitors[].marketShare` | Only if `series.length > 0` |
| `marketSharePie` | pie | `competitors[].marketShare` | Only if `series.length > 0` |
| `growth` | line | `competitors[].growthRate` | Only if `series.length > 0` |
| `growthPie` | pie | `competitors[].growthRate` | Only if `series.length > 0` |
| `pricing` | bar | `pricingTiers[].priceMonthly` | Only if `series.length > 0` |
| `pricingPie` | pie | `pricingTiers[].priceMonthly` | Only if `series.length > 0` |
| `featureAdoption` | radar | `products[].features[].adoption` | Only if `series.length > 0` and ≥3 dimensions |
| `featureAdoptionPie` | pie | `products[].features[].adoption` | Only if `series.length > 0` |

In Overview, the pie variant is preferred over the bar variant when the pie has
series (`charts.marketSharePie.series.length > 0 ? charts.marketSharePie : charts.marketShare`).

---

## 3. The Narrative-to-UI Failure Path (Root Cause)

### 3.1 Where the narrative enters

The Markdown/string narrative enters through `mapAnalysisData` in
`src/api/client.ts` at **line 266–267**:

```typescript
// src/api/client.ts, mapAnalysisData()
businessSummary: text(raw.business_summary) || undefined,
executiveSummary: text(raw.executive_summary) || (typeof raw.report === 'string' ? raw.report : undefined),
```

**Two entry points into `executiveSummary`:**
1. `raw.executive_summary` — a string field on the backend `data` object.
2. `raw.report` — **when it is a plain string** (not an array of Report objects).

When the backend's `data.report` field is a Markdown-formatted string (rather than
an array of `{ title, sections: [...] }` report objects), the fallback
`typeof raw.report === 'string'` condition evaluates to `true`, and the **entire
narrative string is assigned to `executiveSummary`**.

### 3.2 Where it is rendered

In `OverviewDashboard.tsx` at **lines 82–86**:

```typescript
// src/components/OverviewDashboard.tsx
{/* Executive Summary */}
<div className={sectionClass}>
  <h3 className="...">Executive Summary</h3>
  {(data.executiveSummary || data.businessSummary) && (
    <SafeText text={data.executiveSummary || data.businessSummary} className="text-sm text-ink-700 leading-relaxed" />
  )}
```

The `SafeText` component (`src/components/SafeText.tsx`) renders inline Markdown —
`**bold**`, `*italic*`, `` `code` ``, and `[text](url)` links — converting the
backend's Markdown into styled HTML. **Block-level Markdown** (headings `##`,
paragraphs, bullet lists, tables, code blocks) is **not** handled by `SafeText` —
those appear as literal text because `renderInline` only handles inline patterns
and falls through to plain `<span>` rendering for everything else.

### 3.3 The complete failure chain

1. Backend returns `OrchestratorResponse` with `status: 'partial'`, `data` containing
   a `report` field as a **string** (Markdown narrative), and **empty or absent**
   arrays for `competitors`, `sources`, `insights`, etc.
2. `mapAnalysisData` extracts `text(raw.executive_summary) || (typeof raw.report === 'string' ? raw.report : undefined)` → the full narrative string becomes `data.executiveSummary`.
3. `mapAnalysisData` maps all arrays to empty `[]` (no competitors, no sources, no
   insights, no charts, `swot` → `undefined`).
4. `OverviewDashboard` renders:
   - The full narrative via `SafeText` under the "Executive Summary" heading — with
     inline Markdown (bold, links) rendered as styled HTML, but block-level
     Markdown rendered as literal text.
   - Stat cards all showing `0` (Competitors, Market gaps, Insights, Sources,
     Reports, Goals).
   - No charts (all have `series: []`).
   - No competitor cards (empty array).
   - No other content sections.
5. `App.tsx` shows the amber warning banner (line 171–175): "This analysis has no
   supporting sources. Treat narrative claims and metrics as unverified." — but
   this is a small banner above the fold, while the narrative text below it
   constitutes the visual focus of the page.

### 3.4 Why this is a contract problem, not a rendering bug

The UI is designed to render **structured analysis data** — typed, field-level
objects with explicit arrays for competitors, insights, sources, etc. The
`executiveSummary` field was intended as a **short human-readable string** (a
1–3 sentence summary). When the backend returns a multi-paragraph Markdown
narrative as `report` (string), the `mapAnalysisData` fallback at line 267 blindly
promotes it to `executiveSummary`, and the Overview renders it as the headline
content of the entire dashboard.

**The frontend has no way to distinguish** a legitimate short executive summary
from a verbose Markdown narrative, because both flow through the same
`text(raw.executive_summary) || (typeof raw.report === 'string' ? raw.report : undefined)` expression.

---

## 4. Backend Response Shape Expected by the Frontend

The `mapAnalysisData` function (`src/api/client.ts:251-289`) reads the following
fields from `payload.data` (the `OrchestratorData` object). For each field, it
checks **both** camelCase and snake_case variants (via `||`):

| `mapAnalysisData` reads (`raw.*`) | Maps to (`AnalysisData.*`) | Accepts camelCase & snake_case | Type expected |
|---|---|---|---|
| `raw.business_summary` | `businessSummary` | Yes | string |
| `raw.executive_summary` | `executiveSummary` | Yes | string |
| `raw.report` (if string) | `executiveSummary` (fallback) | N/A | string |
| `raw.report` (if array) | `reports` | Yes | array |
| `raw.reports` | `reports` | Yes | array |
| `raw.recommendations` | `recommendations` | Yes | array |
| `raw.action_items` | `recommendations` (fallback) | Yes | array |
| `raw.positioning` | `positioning` | Yes | string |
| `raw.metric_cards` | `metricCards` | Yes | array |
| `raw.competitors` | `competitors` | Yes | array |
| `raw.products` | `products` | Yes | array |
| `raw.pricingTiers` / `raw.pricing_tiers` | `pricingTiers` | Yes | array |
| `raw.marketGaps` / `raw.market_gaps` | `marketGaps` | Yes | array |
| `raw.insights` | `insights` | Yes | array |
| `raw.actionPlan` / `raw.action_plan` | `actionPlan` | Yes | array |
| `raw.charts` | `charts` | Yes | object or array |
| `raw.swot` | `swot` | Yes | object |
| `raw.sources` | `sources` | Yes | array |

### 4.1 Competitor mapping (`mapCompetitor`, client.ts:291-311)

Reads from each competitor object in `raw.competitors[]`:

| Wire field | UI field | Accepts | Notes |
|---|---|---|---|
| `name` | `name` | string | Required — competitors without a name are **filtered out** (`mapCompetitor` returns `null`) |
| `id` | `id` | string | If absent, derived from `slug(name)` |
| `logoColor` / `logo_color` | `logoColor` | string | Optional |
| `description` | `description` | string | Defaults to `''` if absent |
| `funding` | `funding` | string | Optional |
| `founded` | `founded` | string | Optional |
| `hq` | `hq` | string | Optional |
| `marketShare` / `market_share` | `marketShare` | **number only** | `numeric()` returns `undefined` for non-numbers; string like `"12%"` → `undefined` |
| `growthRate` / `growth_rate` | `growthRate` | **number only** | Same `numeric()` rule |
| `pricingTier` / `pricing_tier` | `pricingTier` | string | Optional |
| `marketPosition` / `market_position` | `marketPosition` | enum | Must match exactly: `Leader`/`Challenger`/`Niche`/`Emerging`; otherwise `undefined` |
| `strengths` | `strengths` | string[] | Defaults to `[]` |
| `weaknesses` | `weaknesses` | string[] | Defaults to `[]` |
| `swot` | `swot` | object | If absent → `{ strengths: [], weaknesses: [], opportunities: [], threats: [] }` |

### 4.2 Per-entity `explanation` and `sources`

**Contract gap:** The `Competitor`, `Product`, `PricingTier`, `MarketGap`,
`InsightItem`, `Report`, and `ChartData` types all have an optional `explanation`
field. However, **`mapAnalysisData` does NOT map `explanation` from the wire
response.** The `mapCompetitor`, `mapProduct`, `mapPricingTier`, `mapMarketGap`,
`mapInsight`, `mapReport`, and `mapCharts` functions **do not extract** an
`explanation` field from the raw wire objects.

- `mapCompetitor` (line 291-311): Does **not** map `explanation`, does **not** map
  `sources` onto the competitor.
- `mapProduct` (line 313-338): Does **not** map `explanation`.
- `mapReport` (line 419-437): Does **not** map `explanation`.
- `mapCharts` (line 453-508): Does **not** read `raw.explanation` / `raw.sources`.

The `Explanation` type is only populated in the bundled sample data (perfume.json,
protein.json), not through the live API mapping path. This means **the "Explain
this" button on every card/chart will have no data to show** when data comes from
a live backend, unless the wire format is changed to preserve `explanation` and
`sources` fields on each entity.

### 4.3 `Competitor.explanation` and `Competitor.sources`

The `LookupCompetitor` type (`types.ts:175`) and `AnswerBlock` type (`types.ts:222`)
both include `sources` and structured profile data. These are used by
`ActionResultView` (`src/components/ActionResult.tsx`) for **action** responses
(`executeAction`), which returns a raw `OrchestratorResponse` — **not** mapped
through `mapAnalysisData`. This is a **separate** code path from the bootstrap flow.

| | Bootstrap flow | Action flow |
|---|---|---|
| Endpoint | `POST /api/v1/parser/execute` (intent: `bootstrap`) | Same endpoint (intent: `question`/`compare`/`explain`) |
| Response type | `OrchestratorResponse` → `mapAnalysisData(data)` → `AnalysisData` | `OrchestratorResponse` → rendered by `ActionResultView` |
| Data shown in dashboard | Full `AnalysisData` (8 tabs) | Transient banner (`ActionResultView`) above main content |
| Uses `answer` block | No — `answer` is ignored in bootstrap | Yes — `result.answer.competitors`, `result.explanation`, etc. |

### 4.4 Charts — dual input format

`mapCharts` (`client.ts:453-508`) accepts `raw.charts` as either:

1. **An object** with named keys: `{ marketShare: {...}, marketSharePie: {...}, ... }`
   — this matches the bundled sample data format (perfume.json uses this).
2. **An array** of chart objects: `[{ title, kind, series, ... }, ...]` — the
   function searches by title/kind matching to assign each array item to one of the
   8 fixed chart slots.

When `raw.charts` is absent or neither a record nor array, all 8 chart slots
default to `{ title, kind, series: [] }`.

### 4.5 Charts — value extraction

`mapCharts` reads the following from each chart object:
- `title` / `name`
- `kind` / `chart_type`
- `xLabel` / `x_label`
- `yLabel` / `y_label`
- `series` / `datasets` (array of series)
- Each series: `id`, `name`, `color`, `fill`, `points` / `data`, `values` / `data`
- Each point: `label`, `value` (must be a number — `numeric()`), `color`

### 4.6 Sources mapping (`mapSource`, client.ts:439-450)

| Wire field | UI field | Type expected |
|---|---|---|
| `title` | `title` | string (required — sources without title are filtered out) |
| `id` | `id` | string (or derived from `slug(title)`) |
| `url` | `url` | string |
| `publisher` | `publisher` | string |
| `date` | `date` | string |
| `snippet` | `snippet` | string |

### 4.7 Metric cards mapping (`mapMetric`, client.ts:373-383)

| Wire field | UI field | Type expected | Notes |
|---|---|---|---|
| `label` / `title` / `name` | `label` | string (required) | Must be present |
| `value` | `value` | string \| number (required) | Non-string/non-number → item filtered out |
| `change` | `change` | string | Optional |
| `id` | `id` | string (or derived) | |

---

## 5. Minimum Normalization / Mapping Requirements

All normalization currently flows through **one function** — `mapAnalysisData` in
`src/api/client.ts:251-289` — and its sub-mappers (`mapCompetitor`,
`mapProduct`, `mapPricingTier`, `mapMarketGap`, `mapInsight`, `mapActionPlanItem`,
`mapReport`, `mapSource`, `mapMetric`, `mapCharts`, `mapSwot`).

### 5.1 What the mapping does correctly

- **Snake/camelCase aliasing**: Checks both forms for every field (e.g.,
  `market_share` → `marketShare`).
- **`requested_count` capping**: Bootstrap uses
  `Math.min(profile.competitors?.length || 3, 3)` to cap at 3.
- **Filtering nulls**: Every `mapX` function returns `null` for invalid entries,
  then `.filter(isPresent)` removes them (e.g., competitors without a `name`).
- **Numeric coercion**: `numeric()` only accepts JavaScript `number` — no string
  parsing (e.g., `"12%"` → `undefined`).
- **Enum validation**: `oneOf()` rejects values not in the allowed set.
- **Charts dual-format**: Handles both object-keyed and array input.

### 5.2 What the mapping does NOT do

- **Does not map `explanation`** fields onto any entity type (see §4.2).
- **Does not map `sources`** onto `Competitor`, `Product`, `MarketGap`, etc.
- **Does not extract `lookupConfidence`** or `status` from entity objects (these
  exist in `OrchestratorResponse.entity_statuses` but are never read by
  `mapAnalysisData`).
- **`report` string fallback** for `executiveSummary` is an unconditional override
  with no guard (see §6).
- **No timestamp propagation**: `AnalysisData` has no `generatedAt` /
  `updatedAt` field. The wire `metadata.generated_at` (documented in ORCHESTRATOR.md)
  is never mapped.

### 5.3 Where mapping is scattered (not centralized)

- **Action results** (`executeAction` → `ActionResultView`): The `OrchestratorResponse`
  returned by action requests is **not** mapped through `mapAnalysisData`. Instead,
  `ActionResultView` reads `answer.summary`, `answer.competitors`,
  `answer.evidence`, `answer.sources`, `result.explanation`, etc. directly from
  the raw response. This is a **second, separate rendering path**.

---

## 6. Contract Mismatches — Proven by Code

### 6.1 **CRITICAL: `executiveSummary` string fallback from `raw.report`**

**File:** `src/api/client.ts`, line 267

```typescript
executiveSummary: text(raw.executive_summary) || (typeof raw.report === 'string' ? raw.report : undefined),
```

**Problem:** The `mapAnalysisData` mapping unconditionally treats `raw.report` as a
fall-back string for `executiveSummary`. But `raw.report` can be EITHER:
- A **string** (Markdown narrative) — maps to `executiveSummary`
- An **array** of report objects (with `{ title, sections }`) — maps to `reports`

When the backend returns a **string** `report`, the entire Markdown narrative
becomes the `executiveSummary` and is rendered as the Overview's headline content.
When the backend returns an **array** `report`, it correctly maps to `reports[]`.

**Why this causes the observed bug:** When the backend returns `status: 'partial'`
with a Markdown narrative as `report` (string) and empty arrays for all structured
data, the UI displays the full narrative as "Executive Summary" while all stat
cards show 0 and no structured data renders. The user sees a verbose narrative
that looks like analysis output, with no clear signal that it is unverified
narrative rather than structured findings.

**Proposed fix direction (for backend review):** The backend should return
`executive_summary` as a **short string** (1–3 sentences) only when it is
backed by structured data. A multi-paragraph Markdown narrative should NOT be
returned as `executive_summary` or `report` (string) when there are zero
competitors, zero sources, and `status: 'partial'`. Alternatively, the mapping
could distinguish "narrative summary" from "structured analysis" via a separate
field.

### 6.2 **Missing: `explanation` and `sources` not mapped through `mapAnalysisData`**

**File:** `src/api/client.ts`, `mapCompetitor` (line 291-311), `mapProduct` (313-338),
`mapReport` (419-437), `mapCharts` (453-508)

The `Competitor`, `Product`, `Report`, and `ChartData` types all declare
`explanation?: Explanation`. But none of the mapper functions extract `explanation`
or entity-level `sources` from the wire response. This means the "Explain this"
buttons throughout the dashboard will show "No explanation is available for this
section" when data comes from a live backend — unless the wire format explicitly
includes these fields and the mappers are updated to preserve them.

### 6.3 **Missing: entity status and lookup confidence not surfaced**

**File:** `src/types.ts:265-274` (`entity_statuses`), `src/api/client.ts`

The `OrchestratorResponse` type declares `entity_statuses` with per-competitor
`status`, `missing_fields`, `source`, and `lookupConfidence`. These are **never
read** by `mapAnalysisData` or passed to any UI component. The UI has no way to
display "This competitor came from a web search with 78% confidence" or "This
entity failed to retrieve."

### 6.4 **Numeric coercion is lossy for string-formatted numbers**

**File:** `src/api/client.ts`, `numeric()` (line 598-600)

```typescript
function numeric(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
```

If the backend sends `"12"` (string) or `"12%"` (string), `marketShare` and
`growthRate` become `undefined` → UI shows `—`. If intentionally, the backend
should send actual JSON numbers, not strings.

### 6.5 **No timestamp on `AnalysisData`**

**File:** `src/types.ts:282-319`

`AnalysisData` has no `generatedAt`, `fetchedAt`, or `updatedAt` field. The
Overview header and report cards show dates (`report.date`), but there is no
"when was this analysis generated" timestamp anywhere on the Overview or in the
missing-data banner.

---

## 7. Missing-Data & Empty-State Behavior Summary

| Condition | UI Behavior | Component |
|---|---|---|
| `competitors` is `[]` | `CompetitorsPlaceholder` card | `SectionPlaceholder.tsx:32` |
| `products` is `[]` | `ProductsPlaceholder` card | `SectionPlaceholder.tsx:70` |
| `pricingTiers` is `[]` | `PricingPlaceholder` card (amber) | `SectionPlaceholder.tsx:41` |
| `marketGaps` is `[]` | `MarketGapsPlaceholder` card | `SectionPlaceholder.tsx:51` |
| `insights` + `recommendations` both `[]` | `InsightsPlaceholder` card | `SectionPlaceholder.tsx:79` |
| `reports` is `[]` | `ReportsPlaceholder` card | `SectionPlaceholder.tsx:88` |
| `sources` is `[]` | `SourcesPlaceholder` card (amber) | `SectionPlaceholder.tsx:60` |
| `executiveSummary` AND `businessSummary` both absent/empty | No Executive Summary section renders (conditionally hidden) | `OverviewDashboard.tsx:84` |
| `actionPlan` is `[]` | Action Plan section hidden entirely | `OverviewDashboard.tsx:186` |
| `charts.*.series` is `[]` | Chart section filtered out | `OverviewDashboard.tsx:70` |
| `sampleId === null && sources.length === 0` | Global amber warning banner | `App.tsx:171-175` |

**Critical observation:** The missing-data handling for individual sections (§7)
is **correct** — each shows an explicit placeholder. But the **Executive Summary**
section has no missing-data state: if `executiveSummary` is truthy (even a
multi-paragraph narrative), it always renders. There is no "No summary available"
state for this section.

---

## 8. Field-by-Field Summary Table

The following table maps every wire field (as read by `mapAnalysisData`) to the
UI field and component that consumes it. Only fields proven by code inspection
are listed.

| Wire field (raw) | UI field | Component | Mapping function | Required to render? |
|---|---|---|---|---|
| `business_summary` | `businessSummary` | OverviewDashboard | `mapAnalysisData` | No |
| `executive_summary` | `executiveSummary` | OverviewDashboard | `mapAnalysisData` | No (renders if truthy) |
| `report` (string) | `executiveSummary` | OverviewDashboard | `mapAnalysisData` (fallback) | No — **see §6.1** |
| `report` (array) / `reports` | `reports[]` | ReportCard | `mapReport` | Yes (array exists) |
| `recommendations` / `action_items` | `recommendations[]` | InsightCard (InsightsView) | `mapInsight` | Yes (array exists) |
| `positioning` | `positioning` | OverviewDashboard | `mapAnalysisData` | No |
| `metric_cards` | `metricCards[]` | Stat-like cards | `mapMetric` | No |
| `competitors[]` | `competitors[]` | CompetitorCard | `mapCompetitor` | Yes (array exists) |
| `products[]` | `products[]` | ProductBreakdown | `mapProduct` | Yes (array exists) |
| `pricing_tiers` / `pricingTiers[]` | `pricingTiers[]` | PricingTable | `mapPricingTier` | Yes (array exists) |
| `market_gaps` / `marketGaps[]` | `marketGaps[]` | MarketGapCard | `mapMarketGap` | Yes (array exists) |
| `insights[]` | `insights[]` | InsightCard | `mapInsight` | Yes (array exists) |
| `action_plan` / `actionPlan[]` | `actionPlan[]` | ActionPlanList | `mapActionPlanItem` | Yes (array exists) |
| `charts` (object or array) | `charts.{8 keys}` | Chart | `mapCharts` | Yes (object exists) |
| `swot` | `swot` | SwotGrid | `mapSwot` | No |
| `sources[]` | `sources[]` | SourcesList | `mapSource` | Yes (array exists) |

Per-entity wire fields (consumed inside each `mapX` function):

| Entity | Wire fields read | Mapping function | Key notes |
|---|---|---|---|
| Competitor | `id`, `name`, `logoColor`/`logo_color`, `description`, `funding`, `founded`, `hq`, `marketShare`/`market_share`, `growthRate`/`growth_rate`, `pricingTier`/`pricing_tier`, `marketPosition`/`market_position`, `strengths`, `weaknesses`, `swot` | `mapCompetitor` | `name` required — missing names filtered out; `marketShare`/`growthRate` must be JSON numbers |
| Product | `id`, `competitorId`/`competitor_id`, `name`, `tagline`, `category`, `pricingModel`/`pricing_model`, `startingPrice`/`starting_price`, `features[]` (with `id`, `name`, `description`, `maturity`, `adoption`), `explanation` (NOT mapped) | `mapProduct` | `name` required; features without `name` filtered out |
| PricingTier | `id`, `competitorId`/`competitor_id`, `name`, `priceMonthly`/`price_monthly`, `billing`, `features`, `bestFor`/`best_for`, `pricingModel`/`pricing_model`, `highlighted` | `mapPricingTier` | `name` required; `priceMonthly` accepts number or string |
| MarketGap | `id`, `title`, `description`, `opportunityScore`/`opportunity_score`, `difficultyScore`/`difficulty_score`, `estimatedRevenue`/`estimated_revenue`, `affectedSegments`/`affected_segments` | `mapMarketGap` | `title` required |
| InsightItem | `id`, `title`, `summary`/`description`, `detail`, `category`, `impact`, `confidence`, `relatedCompetitors`/`related_competitors`, `explanation` (NOT mapped) | `mapInsight` | `title` required |
| ActionPlanItem | `id`, `title`, `owner`, `priority`, `horizon`, `effort`, `impact`, `description`, `rationale` | `mapActionPlanItem` | `title` required |
| Report | `id`, `title`, `type`, `date`, `pages`, `summary`, `sections[]` (with `heading`, `body`), `explanation` (NOT mapped) | `mapReport` | `title` required; sections without `heading` filtered out |
| Source | `id`, `title`, `url`, `publisher`, `date`, `snippet` | `mapSource` | `title` required — sources without title filtered out |
| ChartData | `title`/`name`, `kind`/`chart_type`, `xLabel`/`x_label`, `yLabel`/`y_label`, `series`/`datasets`, `explanation` (NOT mapped) | `mapCharts` | Series with no valid points → chart has `series: []` |
| Metric | `id`, `label`/`title`/`name`, `value`, `change` | `mapMetric` | `label` required AND `value` must be string\|number |

---

## 9. Verified vs. Unverified

### Verified by code inspection (these statements are true per the source code)

- The data pipeline: `bootstrap()` → `POST /api/v1/parser/execute` →
  `mapAnalysisData()` → `AnalysisData` → per-tab views (`TabViews.tsx`).
- `mapAnalysisData` is the **only** normalization layer for the bootstrap flow.
- `executiveSummary` gets the value of `raw.executive_summary` OR, as a fallback,
  `raw.report` when it is a string — confirmed at `client.ts:267`.
- `OverviewDashboard` renders `executiveSummary || businessSummary` via `SafeText`
  when truthy — confirmed at `OverviewDashboard.tsx:84-86`.
- `SafeText` renders inline Markdown (bold, italic, code, links) but NOT
  block-level Markdown — confirmed at `SafeText.tsx:30-86`.
- Each dashboard tab correctly shows a placeholder when its array is empty —
  confirmed in `TabViews.tsx` (competitors → `CompetitorsPlaceholder`, etc.).
- The `sampleId === null && data.sources.length === 0` warning banner — confirmed
  at `App.tsx:171-175`.
- `explanation` fields are NOT mapped by any `mapX` function in `mapAnalysisData`
  — confirmed by code inspection of `mapCompetitor`, `mapProduct`, `mapReport`,
  `mapCharts`.
- `entity_statuses`, `lookupConfidence`, and per-entity `status`/`source` are
  never read by `mapAnalysisData` — confirmed by full read of `client.ts`.
- `numeric()` only accepts `typeof === 'number'` — string values like `"12%"`
  yield `undefined`, confirmed at `client.ts:598-600`.
- The sample JSON files (`perfume.json`, `protein.json`) do NOT contain
  `executiveSummary`, `businessSummary`, `metricCards`, or `positioning` —
  confirmed by grep. They are `AnalysisData` objects, not raw wire responses.

### Not verified (open questions — require backend access)

- Whether the live backend at `competitorengine.onrender.com` actually returns
  `executive_summary` as a string, `report` as a string, or both.
- The exact structure of `data.executivesummary` / `data.report` in the real
  partial response from the FlowPilot bootstrap test.
- Whether the backend returns `charts` as an object (named keys) or an array.
- Whether the backend returns `explanation` sub-objects on entities (the mappers
  don't read them regardless, but it confirms whether the backend sends them).
- Whether the backend populates `entity_statuses` and `result_counts`.
- Provider-level diagnostics (WebHunter availability, LLMPing timeouts, API
  credentials) — these require backend access and are out of scope for Phase 1.

---

## 10. Recommended Centralized Mapping Changes (for discussion)

The following are **recommendations** — no code has been changed. They are listed
here so the UI contract and backend contract can be designed together.

1. **Separate `executiveSummary` from `report` string.** The `typeof raw.report === 'string'`
   fallback on line 267 of `client.ts` should be removed or guarded. A text
   narrative should never be silently promoted to the "Executive Summary" headline.
   If `executive_summary` is intended, it should be a short string (1–2 sentences)
   and the backend should not return a verbose Markdown document there.

2. **Map `explanation` and entity-level `sources`** in `mapCompetitor`, `mapProduct`,
   `mapMarketGap`, `mapInsight`, `mapReport`, and `mapCharts` so the "Explain this"
   buttons work on live data. Currently these are only present in the bundled
   sample data.

3. **Surface entity status** from `entity_statuses` so the UI can show confidence
   badges (`lookupConfidence < 60`) and "web" vs "context" source indicators, as
   documented in ORCHESTRATOR.md §5.3 and §6.3.

4. **Accept string-formatted numbers** in `numeric()` (e.g., `"12"` → `12`,
   `"12%"` → `12`) or document that the backend must send JSON numbers exclusively.

5. **Add a `generatedAt` timestamp** to `AnalysisData` so users can see when the
   analysis was produced.

6. **Ensure `executiveSummary` has a missing-data state.** Currently, if it is
   truthy, it always renders. Consider only rendering it when accompanied by
   structured data (e.g., at least some competitors or sources), or render an
   explicit "No narrative summary provided" when absent.
