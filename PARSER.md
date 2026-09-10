# Parser.md — Dynamic Data, Partial Results & UI Data Flow

## 1. Core Objective

The parser transforms arbitrary real user input into the data structure required by the UI while remaining resilient when some information cannot be retrieved.

The sample data is **not a fixed dataset** — it exists only to demonstrate how the UI looks when data is available.

The complete system must support:

```
User Input
    ↓
Context Resolution
    ↓
Intent Understanding
    ↓
Entity / Requirement Extraction
    ↓
Data Retrieval
    ↓
Partial / Complete Result Handling
    ↓
Normalization
    ↓
Derived Data / Calculations
    ↓
UI Data Model
    ↓
UI Components
    ↓
Rendered Dynamic UI
    ↓
Updated Instance Context
```

---

## 2. UI Component Data Contracts

### 2.1 Reverse-Engineered Component Map

For every UI component, the parser must understand:

```
Component → Data Required → Data Source → Transformation → Rendering → Fallback
```

### 2.2 BusinessProfile (Questionnaire Input)

| Field | Type | Required | Source |
|-------|------|----------|--------|
| `businessName` | string | Yes | user_input |
| `idea` | string | Yes | user_input |
| `industry` | string | Yes | user_input/derived |
| `targetCustomers` | string | Yes | user_input |
| `geography` | string | No | user_input/inferred |
| `pricing` | string | No | user_input/inferred |
| `businessModel` | string | No | user_input/inferred |
| `differentiators` | string[] | No | user_input |
| `researchGoals` | string | No | user_input |
| `competitorNames` | string[] | No | user_input |
| `productCategories` | string[] | No | user_input/derived |

### 2.3 Competitor

```json
{
  "id": "string (slug)",
  "name": "string",
  "description": "string",
  "position": "leader|challenger|niche|new_entrant",
  "marketShare": "number (0-100)",
  "growth": "number (percentage)",
  "website": "string (url)",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "swot": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "opportunities": ["string"],
    "threats": ["string"]
  },
  "status": "complete|partial|loading|failed"
}
```

### 2.4 Product

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "maturity": "ga|beta|roadmap",
  "adoptionRate": "number (0-100)",
  "features": [
    {
      "name": "string",
      "description": "string",
      "maturity": "ga|beta|roadmap"
    }
  ],
  "status": "complete|partial|loading|failed"
}
```

### 2.5 PricingTier

```json
{
  "id": "string",
  "name": "string",
  "monthlyPrice": "number",
  "billingCycle": "monthly|annual",
  "features": ["string"],
  "isPopular": "boolean"
}
```

### 2.6 MarketGap

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "opportunityScore": "number (1-10)",
  "difficultyScore": "number (1-10)",
  "estimatedRevenue": "string"
}
```

### 2.7 InsightItem

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "impact": "high|medium|low",
  "confidence": "number (0-100)"
}
```

### 2.8 ActionPlanItem

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "priority": "P0|P1|P2",
  "horizon": "30d|60d|90d",
  "effort": "low|medium|high",
  "owner": "string"
}
```

### 2.9 Report

```json
{
  "id": "string",
  "title": "string",
  "type": "market|competitive|strategic",
  "sections": [
    {
      "heading": "string",
      "content": "string"
    }
  ]
}
```

### 2.10 ChartData

```json
{
  "id": "string",
  "title": "string",
  "type": "bar|line|area|radar|pie",
  "series": [
    {
      "name": "string",
      "color": "string (hex)",
      "points": [
        { "label": "string", "value": "number" }
      ]
    }
  ]
}
```

### 2.11 Source

```json
{
  "id": "string",
  "title": "string",
  "publisher": "string",
  "date": "string (ISO date)",
  "url": "string",
  "snippet": "string"
}
```

### 2.12 SWOT (Business-level)

```json
{
  "strengths": ["string"],
  "weaknesses": ["string"],
  "opportunities": ["string"],
  "threats": ["string"]
}
```

### 2.13 ChatAsset (Discriminated Union)

| Kind | Component | Required Data |
|------|-----------|---------------|
| `competitor-card` | CompetitorCard | Competitor |
| `comparison-table` | ComparisonTable | `{ title, columns, rows }` |
| `pricing-table` | PricingTable | `{ title, tiers: PricingTier[] }` |
| `product-breakdown` | ProductBreakdown | Product |
| `chart` | Chart | ChartData |
| `swot` | SwotGrid | `{ competitorId, swot }` |
| `market-gap` | MarketGapCard | MarketGap |
| `insight` | InsightCard | InsightItem |
| `report` | ReportCard | Report |
| `action-plan` | ActionPlanList | `{ title, items: ActionPlanItem[] }` |
| `dashboard` | OverviewDashboard | AnalysisData |

### 2.14 AnalysisData (Root State)

```json
{
  "businessName": "string",
  "industry": "string",
  "idea": "string",
  "targetCustomers": "string",
  "geography": "string",
  "pricing": "string",
  "businessModel": "string",
  "differentiators": ["string"],
  "researchGoals": "string",
  "profile": "BusinessProfile",
  "competitors": ["Competitor"],
  "products": ["Product"],
  "pricingTiers": ["PricingTier"],
  "marketGaps": ["MarketGap"],
  "insights": ["InsightItem"],
  "recommendations": ["InsightItem"],
  "actionPlan": ["ActionPlanItem"],
  "reports": ["Report"],
  "charts": {
    "marketShare": "ChartData",
    "marketSharePie": "ChartData",
    "growth": "ChartData",
    "growthPie": "ChartData",
    "pricing": "ChartData",
    "pricingPie": "ChartData",
    "featureAdoption": "ChartData",
    "featureAdoptionPie": "ChartData"
  },
  "swot": "SWOT",
  "sources": ["Source"],
  "conversation": ["ChatMessage"]
}
```

---

## 3. Never Assume a Fixed Number of Results

The UI must **not be hardcoded** to a maximum of five companies, five cards, five results, etc.

Five sample companies means only: *the sample currently contains five companies.*

The parser and UI must support: **0, 1, 2, 3, 5, 10, 20...** results subject to sensible application limits.

The number of displayed results must be determined by the **actual available data and user request**.

---

## 4. Dynamic Result Collection

Every repeatable entity collection should be represented as an array/list:

```json
{
  "competitors": []
}
```

**Never** create fixed fields:

```json
{
  "competitor1": {},
  "competitor2": {},
  "competitor3": {}
}
```

The UI iterates over the collection:

```
competitors → map() → CompetitorCard[]
```

If only three competitors are retrieved: `competitors.length = 3` → UI renders three cards.
If seven are available: `competitors.length = 7` → UI renders seven cards.

---

## 5. Separate "Requested Count" From "Available Count"

The parser must distinguish:

```json
{
  "requested_count": 10,
  "retrieved_count": 7,
  "valid_count": 6,
  "display_count": 6
}
```

If the user asks for 10 companies but only six valid results can be obtained, the application should **not fabricate four additional companies**.

```
Requested: 10
Found: 6
Showing: 6
```

---

## 6. Retrieval Stop Conditions

### User-defined stopping condition

If user says "Show me 8 companies" → `target_count = 8`

Retrieval continues until `valid_results >= 8` or another stopping condition is reached.

### Application-defined stopping condition

```json
{
  "result_policy": {
    "default_target": 5,
    "maximum_results": 20,
    "minimum_useful_results": 1,
    "allow_partial_results": true,
    "continue_until_target": true,
    "stop_on_source_exhaustion": true
  }
}
```

### Retrieval exhaustion

If retrieval produces only three valid results: `requested = 10, valid_results = 3` → stop when no additional useful results can reasonably be obtained.

**Never create fake filler data.**

---

## 7. "Append Until Stop" Collection Model

```
results = []
retrieve result
if valid: append(result)
check stopping conditions
if stop condition reached: stop
otherwise: retrieve next result
```

Stop conditions:
1. Requested target reached
2. Application maximum reached
3. Retrieval source exhausted
4. No additional relevant results available
5. Remaining results fail validation
6. Retrieval error prevents continuation
7. Cost/time/resource threshold reached

---

## 8. Partial Retrieval Must Be a Valid Success State

Partial data is **not automatically an error**.

Example: User asks for 5 companies.
- Company A → complete
- Company B → complete
- Company C → complete
- Company D → retrieval failed
- Company E → retrieval failed

The parser returns:

```json
{
  "status": "partial",
  "competitors": [{}, {}, {}],
  "requested_count": 5,
  "retrieved_count": 3,
  "failed_count": 2
}
```

The UI still renders the three valid companies. **Do not throw away all successfully retrieved data because some results failed.**

---

## 9. Partial Fields Must Also Be Supported

A company may be successfully retrieved while some fields are missing:

```
✓ Name
✓ Website
✓ Description
✓ Industry
✗ Revenue
✗ Employee count
```

This is still a valid company record. Represent unavailable fields explicitly:

```json
{
  "name": "...",
  "website": "...",
  "description": "...",
  "industry": "...",
  "revenue": null,
  "employee_count": null
}
```

The UI decides how to represent missing values: `—`, `Not available`, `Unknown`, `Not provided`.

**Do not invent values solely to make the card look complete.**

---

## 10. Per-Entity Status

Every dynamically retrieved entity should have its own status:

```json
{
  "id": "...",
  "name": "...",
  "status": "partial",
  "data": {},
  "missing_fields": []
}
```

Possible statuses: `loading`, `complete`, `partial`, `failed`, `unavailable`

This allows the UI to show:
```
Company A     Complete
Company B     Complete
Company C     Partial
Company D     Failed
```

without destroying the rest of the results.

---

## 11. Do Not Let One Failure Break the Entire UI

**Bad behavior:**
```
Company 1 ✓
Company 2 ✓
Company 3 ✗
→ entire result set fails
```

**Correct behavior:**
```
Company 1 ✓
Company 2 ✓
Company 3 ✗
Company 4 ✓
→ render 1, 2 and 4
→ preserve information about 3 if useful
```

Errors should be isolated to the smallest possible unit.

---

## 12. Parser Pipeline

```
                USER INPUT
                    │
                    ▼
             ┌─────────────┐
             │    PARSER   │
             └──────┬──────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
     Intent      Entities    Constraints
        │           │           │
        └───────────┼───────────┘
                    ▼
             Operation Plan
                    │
                    ▼
          Retrieval / Processing
                    │
                    ▼
             Normalized Data
                    │
        ┌───────────┼────────────┐
        ▼           ▼            ▼
     Raw Data   Derived Data   Metadata
        │           │            │
        └───────────┼────────────┘
                    ▼
              UI Data Model
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       Header     Cards     Charts
          │         │         │
          ▼         ▼         ▼
       Filters   Tables   Statistics
          │         │         │
          └─────────┼─────────┘
                    ▼
                UI STATE
                    │
                    ▼
                RENDER UI
```

### Step 1: Intent Classification

| Intent | Description |
|--------|-------------|
| `bootstrap` | Initial business description — generate full analysis |
| `question` | Ask about existing data — return answer + optional ChatAsset |
| `refine` | Modify existing data (add/remove competitor, adjust values) |
| `compare` | Compare entities side-by-side |
| `explain` | Explain a specific insight/data point |
| `regenerate` | Recreate a specific section |
| `follow-up` | Reference previous context (requires instance context) |

### Step 2: Entity Extraction

```json
{
  "business_names": [],
  "product_names": [],
  "competitor_names": [],
  "industries": [],
  "metrics": [],
  "features": [],
  "pricing_mentions": [],
  "geographic_mentions": [],
  "comparisons": [],
  "constraints": []
}
```

### Step 3: Semantic Intermediate Representation

```json
{
  "intent": "bootstrap|question|refine|compare|explain|regenerate|follow-up",
  "entities": {},
  "facts": {},
  "constraints": [],
  "requested_operations": [],
  "missing_information": [],
  "confidence": {}
}
```

### Step 4: Gap Analysis

Determine what data already exists vs. what must be retrieved.

### Step 5: Operation Planning

| Operation | When Needed |
|-----------|-------------|
| `extract` | Always — pull values from user text |
| `infer` | Fill gaps from industry knowledge (marked with lower confidence) |
| `calculate` | Derive metrics (market share totals must = 100%) |
| `normalize` | Standardize formats, casing, units |
| `categorize` | Assign positions, maturity levels, priorities |
| `generate` | Create charts, action plans, reports from extracted data |

### Step 6: Retrieval with Append Model

Append valid results until stop condition reached.

### Step 7: Validation

Validate each returned record independently.

### Step 8: Normalization

| Field | Normalization |
|-------|---------------|
| `marketShare` | Number 0-100, sum to 100 across competitors |
| `growth` | Number (percentage, can be negative) |
| `adoptionRate` | Number 0-100 |
| `confidence` | Number 0-100 |
| `opportunityScore` | Number 1-10 |
| `difficultyScore` | Number 1-10 |
| `position` | One of: leader, challenger, niche, new_entrant |
| `maturity` | One of: ga, beta, roadmap |
| `impact` | One of: high, medium, low |
| `priority` | One of: P0, P1, P2 |
| `horizon` | One of: 30d, 60d, 90d |
| `effort` | One of: low, medium, high |
| `pricing` | One of: budget, mid, premium, luxury |
| `id` | URL-safe slug derived from name |

### Step 9: Derive

Calculate required statistics, rankings, summaries from actual data.

### Step 10: UI State

Create/update the state consumed by the frontend.

### Step 11: Context Update

Store compact summary for follow-up requests.

---

## 13. Single Source of Truth

The parser produces a canonical application state. The UI consumes this state rather than independently interpreting the LLM response.

```
LLM / Parser → Canonical Application Data → Frontend State → Components
```

Do not allow individual components to independently guess or reinterpret what the LLM meant.

---

## 14. Data Ownership

### LLM / Parser
- Understanding natural language, intent, entity extraction
- Semantic interpretation, context resolution
- Determining required operations, transforming retrieved information
- Producing structured data

### Data/Retrieval Layer
- Fetching information, APIs, search, database queries
- External sources, retrieval failures

### Processing Layer
- Calculations, sorting, filtering, ranking, aggregation
- Normalization, validation

### UI State Layer
- Current displayed data, loading state, error state, partial state
- Selection, filters, pagination/expansion

### UI Components
- Rendering, presentation, interaction
- Displaying available/missing information

---

## 15. Dynamic Cards / Lists

Any UI component representing a collection must be data-driven:

```
for each item in data.items:
    render Card(item)
```

Applies to: companies, products, people, recommendations, search results, statistics, categories, comparison rows, timeline entries, sources, tags.

---

## 16. Dynamic Statistics

Statistics must be calculated from actual data:

```
Companies = competitors.length
Average = calculate(valid_items)
Highest = max(valid_items)
Lowest = min(valid_items)
```

If insufficient data exists: `Average = unavailable` rather than an invented value.

---

## 17. Dynamic Empty States

The UI must correctly handle `competitors = []` — produce the designed empty state rather than a broken layout.

Do not force an empty card merely to preserve the sample layout.

---

## 18. Dynamic Loading States

When retrieval takes time, the UI should represent `loading` without pretending that the final data already exists.

Partial progressive results may be supported:

```
Searching...
Company A ✓
Company B ✓
Company C loading...
```

---

## 19. Dynamic Result Count in UI

The UI should derive its count from the actual state:

```
Found 3 companies
```

when three valid companies exist. Not "Found 5 companies" because the sample contains five.

If user requested 10 but only three were found: `Showing 3 of 10 requested`

---

## 20. Data Lifecycle Through the Application

### Stage 1 — Input
User enters natural language

### Stage 2 — Context
Current browser-instance context is loaded

### Stage 3 — Interpretation
Input + Context → intent, entities, constraints, requested output

### Stage 4 — Planning
What data already exists? What is missing? What must be retrieved/calculated/transformed?

### Stage 5 — Retrieval
Retrieve only what is necessary

### Stage 6 — Validation
Validate each returned record independently

### Stage 7 — Append
Append valid entities to the appropriate collection

### Stage 8 — Stop
Evaluate stopping policy: target reached? maximum reached? source exhausted? no useful results remaining? error?

### Stage 9 — Normalize
Convert everything into the canonical schema

### Stage 10 — Derive
Calculate required statistics, rankings, summaries

### Stage 11 — UI State
Create/update the state consumed by the frontend

### Stage 12 — Render
Components render the actual available data

### Stage 13 — Context Update
Store compact summary of the new state for follow-up requests

---

## 21. Parser Output Contract

```json
{
  "intent": "bootstrap|question|refine|compare|explain|regenerate|follow-up",
  "status": "success|partial|error",
  "data": {},
  "derived_data": {
    "charts_generated": [],
    "calculations_performed": [],
    "statistics": {}
  },
  "ui_state": {
    "active_tab": "chat|overview|competitors|products|pricing|gaps|insights|reports|sources",
    "highlighted_entities": [],
    "result_counts": {
      "requested": 0,
      "retrieved": 0,
      "valid": 0,
      "displayed": 0
    }
  },
  "operations_performed": ["extract", "infer", "calculate", "normalize"],
  "missing_data": [
    {
      "field": "string",
      "reason": "string",
      "severity": "critical|warning|info"
    }
  ],
  "context_update": {},
  "error": null
}
```

---

## 22. Browser Instance Context

### 22.1 Storage

Use `sessionStorage` (cleared when tab/browser closes):

```typescript
const CONTEXT_KEY = 'competitor_analysis_context';
```

### 22.2 Context Structure

```json
{
  "version": 1,
  "business": {
    "name": "string",
    "industry": "string",
    "pricing": "string",
    "model": "string"
  },
  "entities": {
    "competitors": ["id1", "id2"],
    "products": ["id1", "id2"],
    "focus": "current focus entity id"
  },
  "result_meta": {
    "requested_count": 5,
    "retrieved_count": 3,
    "filters": ["technology", "India"]
  },
  "constraints": {
    "included": ["what to include"],
    "excluded": ["what to exclude"]
  },
  "keywords": ["compact", "keyword", "list"]
}
```

### 22.3 What to Store

| Category | Examples |
|----------|----------|
| Business identity | name, industry, pricing tier, model |
| Active entities | competitor IDs being discussed |
| Result metadata | requested/retrieved counts, current filters |
| Active constraints | "exclude X", "focus on Y", "compare A vs B" |
| Current focus | Which entity/product is the active subject |
| Keyword tags | 5-10 compact keywords for reference resolution |

### 22.4 What NOT to Store

- Full conversation history
- Complete AnalysisData payload
- Raw user messages
- Generated reports/insights text
- Chart data (regenerate on demand)
- Sensitive business data beyond session

### 22.5 Context Update Strategy

```
New User Input
       ↓
Combine with Current Context
       ↓
Resolve References ("it", "that one", "cheaper option")
       ↓
Parse + Process
       ↓
Generate Compact Context Summary
       ↓
Overwrite (don't append) Context in sessionStorage
```

### 22.6 Context Compression Example

**Before:**
```json
{
  "business": { "name": "Maison Velora", "industry": "perfume" },
  "entities": { "competitors": ["chanel", "dior", "tom-ford"] },
  "constraints": { "included": ["luxury"], "excluded": [] },
  "keywords": ["niche", "fragrance", "premium"]
}
```

**User says:** "Actually focus on mass market instead, and add Zara"

**After:**
```json
{
  "business": { "name": "Maison Velora", "industry": "perfume" },
  "entities": { "competitors": ["zara", "h&m", "chanel"] },
  "constraints": { "included": ["mass-market"], "excluded": ["luxury"] },
  "keywords": ["mass", "market", "accessible", "zara"]
}
```

---

## 23. Context Must Track Result Collections

The instance context should not store every complete result. Instead store a compact representation:

```json
{
  "active_topic": "company comparison",
  "entities": ["Company A", "Company B", "Company C"],
  "requested_count": 5,
  "retrieved_count": 3,
  "filters": ["technology", "India"],
  "keywords": ["valuation", "revenue", "employees"]
}
```

Full records remain in the application state/data layer. The context only needs enough information to understand subsequent requests.

---

## 24. Context and UI State Are Different

### UI Data
Contains what the application currently needs to render. Can be relatively detailed.

### Instance Context
Contains a compact semantic summary needed for future interpretation. Should be small.

**Example:**
- UI Data → complete company records
- Instance Context → "User is comparing 3 technology companies in India; revenue and valuation are currently selected."

---

## 25. Follow-Up Input Must Modify Existing State

If user says "Remove Company B":

```
Current Context + Current UI State + New Input → Updated UI State
```

Not start from zero.

If user says "Add two more" and three companies currently exist: `3 + 2 = 5` subject to retrieval success and application limits.

If only one additional company can be retrieved: `3 + 1 = 4`. The UI renders four.

---

## 26. User-Requested Count Is a Target, Not a Guarantee

`user_request = 10 companies` means `target = 10`, not `always return exactly 10`.

Valid outcomes:
- 10 available → show 10
- 7 available → show 7
- 3 available → show 3
- 0 available → show empty state

**Never fabricate data to satisfy the requested count.**

---

## 27. Configurable Result Policy

```json
{
  "result_policy": {
    "default_target": 5,
    "maximum_results": 20,
    "minimum_useful_results": 1,
    "allow_partial_results": true,
    "continue_until_target": true,
    "stop_on_source_exhaustion": true
  }
}
```

These values should be configuration, not scattered magic numbers throughout the code.

---

## 28. Never Hardcode UI Limits Into the Parser

Avoid: `companies.slice(0, 5)` unless `5` is explicitly the configured application maximum.

Prefer: `companies.slice(0, MAX_RESULTS)` where `MAX_RESULTS` comes from configuration.

Better still, if the UI naturally supports all valid results, do not unnecessarily slice the collection.

---

## 29. Graceful Degradation

Priority:
```
Complete data → Partial but useful data → Explicit unavailable state → Empty state → Error state
```

**Never:** Partial data → Discard everything → Broken UI

---

## 30. Parser Must Be UI-Aware but Not UI-Coupled

The parser must understand what data the UI requires. However, it should not contain presentation logic.

**Correct:**
```json
{
  "competitor": {
    "name": "...",
    "status": "active"
  }
}
```

**Incorrect:**
```json
{
  "competitorCard": {
    "textColor": "blue",
    "fontSize": 24
  }
}
```

---

## 31. Reference Resolution

| Reference Pattern | Resolution |
|-------------------|------------|
| "it" / "that one" | Use `context.entities.focus` |
| "the cheaper one" | Find lowest `monthlyPrice` in current data |
| "the leader" | Find competitor with `position: "leader"` |
| "compare them" | Use last two entities mentioned |
| "remove that" | Remove from context.entities |
| "add X" | Add to context.entities, trigger regeneration |
| "the other one" | Use non-focus entity from context |
| "same industry" | Use `context.business.industry` |

---

## 32. Dynamic Operations by Intent

### 32.1 Bootstrap (Initial Analysis)

**Trigger:** User provides business description for first time.

**Operations:**
1. Extract business facts from input
2. Infer industry, positioning, target market
3. Append competitors until stop condition (user target or policy max)
4. Generate products based on business type
5. Generate pricing tiers (infer range from pricing tier)
6. Generate market gaps based on industry
7. Generate insights from competitor analysis
8. Generate 90-day action plan
9. Generate reports
10. Generate charts from actual competitor data
11. Generate sources
12. Generate SWOT
13. Create initial greeting conversation

### 32.2 Question (Query Existing Data)

**Trigger:** User asks about displayed data.

**Operations:**
1. Identify referenced entity from context
2. Retrieve relevant data
3. Generate text response
4. Include relevant ChatAsset for visual display
5. Update context focus

### 32.3 Refine (Modify Data)

**Trigger:** User requests changes.

**Operations:**
1. Identify what to modify
2. Apply change (add/remove/update)
3. Regenerate affected derived data
4. Update charts if competitors/metrics changed
5. Update context constraints

### 32.4 Compare

**Trigger:** User wants side-by-side comparison.

**Operations:**
1. Identify entities to compare (from context if ambiguous)
2. Generate comparison-table ChatAsset
3. Update context focus to compared entities

### 32.5 Regenerate Section

**Trigger:** User wants fresh version of a section.

**Operations:**
1. Identify section from context
2. Regenerate that section's data
3. Preserve other sections
4. Update affected charts

---

## 33. ChatAsset Selection Guide

| User Ask | Primary Response | ChatAsset |
|----------|------------------|-----------|
| "Who are my competitors?" | Overview text | `competitor-card` for top 2-3 |
| "Compare X and Y" | Comparison summary | `comparison-table` |
| "What pricing should I use?" | Pricing strategy text | `pricing-table` |
| "Show market share" | Market overview | `chart` (marketShare) |
| "What are my strengths?" | SWOT summary | `swot` |
| "Any opportunities?" | Gap analysis | `market-gap` |
| "What should I do?" | Action summary | `action-plan` |
| "Give me a report" | Report intro | `report` |
| "Any insights?" | Key insight summary | `insight` |
| "Show everything" | Dashboard summary | `dashboard` |

---

## 34. Error Handling

### 34.1 Structured Error Response

```json
{
  "status": "partial",
  "data": {},
  "missing_data": [
    {
      "field": "competitors",
      "reason": "No competitors mentioned and none could be inferred",
      "severity": "warning"
    }
  ],
  "error": null
}
```

### 34.2 Error Types

| Type | When | Response |
|------|------|----------|
| `insufficient_input` | Cannot identify business type | Ask for clarification |
| `ambiguous_reference` | Cannot resolve "it"/"that" | List possible referents |
| `calculation_error` | Math doesn't work out | Recalculate, flag if persists |
| `validation_failure` | Output doesn't match schema | Fix structure, retry |

### 34.3 UI Error States

- `loading` — show during processing
- `partial` — render available data, show missing indicators
- `error` — show error message, preserve previous valid state
- `empty` — show questionnaire for new input

---

## 35. Implementation Notes

### 35.1 The Parser is NOT a Formatter

The parser is a **semantic-to-UI data pipeline**:

```
UNDERSTAND → EXTRACT → RESOLVE → RETRIEVE → CALCULATE → TRANSFORM → NORMALIZE → VALIDATE → STRUCTURE → UPDATE CONTEXT → POPULATE UI
```

### 35.2 Frontend Responsibility

```
RECEIVE STRUCTURED STATE → RENDER COMPONENTS → ACCEPT USER INPUT → SEND INPUT BACK
```

### 35.3 Never Hardcode to Sample

The perfume/protein samples are schema references only. The parser must handle:

- Different industries (tech, food, fashion, services, etc.)
- Different business models (B2B, B2C, marketplace, SaaS, etc.)
- Different scales (startup, SMB, enterprise)
- Different information completeness (full paragraph vs. sparse notes)
- Different result counts (0, 1, 3, 5, 10, 20...)

### 35.4 Data Consistency Rules

1. Chart `series` must reference real competitor IDs
2. `marketShare` pie chart must match bar chart data
3. Chart colors must be consistent across charts for same entity
4. `actionPlan` items should reference insights/competitors mentioned
5. `sources` should cite real publications when possible
6. `pricingTiers` should align with business pricing tier
7. Statistics must reflect actual data counts, not sample counts

---

## 36. Example: Parsing New User Input

### Input:
> "I'm starting a sustainable sneaker brand in Europe targeting eco-conscious millennials. My main competitors are Allbirds and Veja."

### Intermediate Representation:
```json
{
  "intent": "bootstrap",
  "entities": {
    "business_names": ["user's brand (unnamed)"],
    "competitor_names": ["Allbirds", "Veja"],
    "industries": ["sustainable fashion", "footwear"],
    "geographic_mentions": ["Europe"]
  },
  "facts": {
    "product_type": "sneakers",
    "target_market": "eco-conscious millennials",
    "sustainability_focus": true
  },
  "constraints": ["sustainable", "European market", "millennial target"],
  "missing_information": ["brand name", "pricing tier", "specific features"],
  "requested_count": null
}
```

### Operations Performed:
1. Extract: Allbirds, Veja, Europe, sustainable, sneakers, millennials
2. Infer: pricing likely "premium" (sustainable), model "DTC"
3. Append competitors until target reached (default 5 or policy max)
4. Calculate: market shares distributed among valid competitors
5. Generate: products, pricing, gaps, insights, charts from actual data
6. Normalize: all enum values, IDs, chart structures

### Context Stored:
```json
{
  "version": 1,
  "business": {
    "name": "Your Brand",
    "industry": "sustainable footwear",
    "pricing": "premium",
    "model": "DTC"
  },
  "entities": {
    "competitors": ["allbirds", "veja", "rothys", "nike-sustainable"],
    "focus": null
  },
  "result_meta": {
    "requested_count": 5,
    "retrieved_count": 4,
    "filters": ["sustainable", "europe"]
  },
  "constraints": {
    "included": ["sustainable", "eco-conscious"],
    "excluded": []
  },
  "keywords": ["sneakers", "sustainable", "millennials", "europe", "dtc"]
}
```

---

## 37. Acceptance Criteria

The implementation is correct only if all of the following are true:

### Dynamic input
A user can enter information substantially different from the sample data.

### Dynamic result count
The UI works with 0, 1, 2, 3, 5, 10 or any other supported number of results.

### No sample dependency
Sample values are never required for the application to function.

### Partial retrieval
If only some entities are retrieved, valid entities still appear.

### Partial entity
If some fields of an entity are unavailable, the entity can still appear.

### Failure isolation
One failed retrieval does not destroy unrelated successful results.

### No hallucinated filler
Missing results are never fabricated merely to satisfy a requested count.

### Configurable limits
Maximum result limits are configuration-driven.

### Append model
Results are added dynamically until a valid stop condition is reached.

### Dynamic statistics
Counts and aggregates reflect actual data.

### Dynamic UI
All repeatable UI components render from arrays/collections.

### Context continuity
Follow-up requests can reference previously established information.

### Context compactness
Only useful semantic context is stored in the browser instance.

### State separation
UI state, semantic context, raw data, and presentation logic remain appropriately separated.

### Graceful degradation
The application remains usable when retrieval is incomplete.

---

## 38. Final Principle

The entire application must behave as a **data-driven dynamic system**, not a sample-data-driven interface.

```
                 ANY USER INPUT
                       │
                       ▼
              ┌─────────────────┐
              │ LLM + PARSER    │
              └────────┬────────┘
                       │
                       ▼
              SEMANTIC UNDERSTANDING
                       │
                       ▼
               OPERATION PLANNER
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      RETRIEVE      CALCULATE    TRANSFORM
          │            │            │
          └────────────┼────────────┘
                       ▼
                 VALIDATE
                       │
                       ▼
              APPEND VALID RESULTS
                       │
                       ▼
              CHECK STOP CONDITION
                 │           │
              continue       stop
                 │           │
                 └─────┬─────┘
                       ▼
                NORMALIZE DATA
                       │
                       ▼
               CANONICAL UI STATE
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
       HEADER        CARDS         TABLES
          │            │             │
          └────────────┼─────────────┘
                       ▼
                 DYNAMIC UI
                       │
                       ▼
             COMPACT CONTEXT UPDATE
                       │
                       ▼
                  NEXT INPUT
```

**The UI must render what actually exists, not what the sample suggests should exist.**

- If 3 competitors are available, render 3.
- If 8 are available and permitted, render 8.
- If 0 are available, render the empty state.
- If one company has incomplete data, render that company with appropriate missing-field states.
- If one retrieval fails, continue with everything else that succeeded.

The parser's job is to continuously convert **real user intent + available information + current instance context** into the **best valid UI state possible**, without relying on fixed sample values or fixed result counts.
