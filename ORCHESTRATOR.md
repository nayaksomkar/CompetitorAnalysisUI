# ORCHESTRATOR.md — How the Main Orchestrator & Parser Work

This document describes how the orchestrator (CompetitorEngine), the parser contract, and Docker-hosted services fit together so the UI team can format requests correctly and consume responses reliably.

---

## 1. System Overview

```
┌────────────────────┐
│  UI (Browser)      │
│  - Renders cards   │
│  - Holds context   │
│  - Sends requests  │
└─────────┬──────────┘
          │  HTTP POST
          │  (parser-formatted input)
          ▼
┌─────────────────────────────────────────────────────────┐
│              Orchestrator (Docker Container)            │
│  CompetitorEngine — FastAPI service (port 8001)         │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │  Parser API  │───▶│ Orchestrator │───▶│ Validators│ │
│  │  /parser/    │    │   .execute() │    │  & Retry  │ │
│  │  execute     │    │              │    │           │ │
│  └──────────────┘    └──────┬───────┘    └───────────┘ │
│                            │                            │
│            ┌───────────────┼───────────────┐            │
│            ▼               ▼               ▼            │
│      ┌──────────┐   ┌──────────┐   ┌──────────┐         │
│      │ WebHunter│   │  LLMPing │   │  Cache   │         │
│      └────┬─────┘   └────┬─────┘   └──────────┘         │
└───────────┼──────────────┼─────────────────────────────┘
            │              │
            ▼              ▼
┌────────────────┐  ┌─────────────────┐
│  WebHunter     │  │  LLMPing        │
│  (research)    │  │  (reasoning)    │
│  port 8000     │  │  port 8002      │
└────────────────┘  └─────────────────┘
```

All three services run in **separate Docker containers**. The orchestrator is a stateless backend — it never touches the UI directly.

---

## 2. Docker Architecture (Localhost)

### 2.1 Container Topology

| Container | Port | Role | Environment Variables |
|-----------|------|------|----------------------|
| `competitor-orchestrator` | 8001 | Orchestrator (this service) | `LLMPING_URL`, `WEBHUNTER_URL` |
| `webhunter` | 8000 | External research | — |
| `llmping` | 8002 | LLM reasoning | — |

### 2.2 Docker Compose Example

```yaml
version: "3.9"
services:
  llmping:
    build: ./llmping
    container_name: llmping
    ports:
      - "8002:8002"

  webhunter:
    build: ./webhunter
    container_name: webhunter
    ports:
      - "8000:8000"

  orchestrator:
    build: .
    container_name: competitor-orchestrator
    ports:
      - "8001:8001"
    environment:
      - LLMPING_URL=http://llmping:8002
      - WEBHUNTER_URL=http://webhunter:8000
    depends_on:
      - llmping
      - webhunter
```

### 2.3 Running Locally (Docker)

```bash
# Build and start all three containers
docker compose up --build

# Or run individually:
docker build -t competitor-orchestrator .
docker run -d \
  -p 8001:8001 \
  -e LLMPING_URL=http://localhost:8002 \
  -e WEBHUNTER_URL=http://localhost:8000 \
  competitor-orchestrator
```

### 2.4 Running Without Docker (Development)

```bash
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt

export LLMPING_URL=http://localhost:8002
export WEBHUNTER_URL=http://localhost:8000

uvicorn app.main:app --reload --port 8001
```

---

## 3. API Endpoints

The orchestrator exposes **three endpoints**. The UI should use `/api/v1/parser/execute` for all new flows.

| Endpoint | Purpose | When to Use |
|----------|---------|-------------|
| `POST /api/v1/analyze` | Legacy full-analysis endpoint | Legacy UI flows only |
| `POST /api/v1/chat` | Chat follow-up with context | Conversation only |
| `POST /api/v1/parser/execute` | **Parser-driven flow** | **All new UI flows** |

---

## 4. Parser-Driven Flow (Recommended)

### 4.1 Request Format

**Endpoint:** `POST /api/v1/parser/execute`

```json
{
  "parser_input": {
    "intent": "bootstrap",
    "entities": {
      "business_names": ["MyStartup"],
      "competitor_names": ["CompetitorA", "CompetitorB"],
      "industries": ["SaaS"],
      "geographic_mentions": ["US"],
      "product_names": ["Dashboard"]
    },
    "facts": {
      "product_type": "AI analytics",
      "target_market": "SMBs",
      "pricing_tier": "Premium"
    },
    "constraints": ["US market only"],
    "requested_operations": ["extract", "infer", "calculate", "normalize"],
    "missing_information": ["founding date", "employee count"],
    "requested_count": 3,
    "form_input": {
      "business_name": "MyStartup",
      "idea": "AI analytics platform",
      "industry": "SaaS",
      "products_services": ["Dashboard"],
      "target_customers": "SMBs",
      "geography": "US",
      "pricing": "$49/month",
      "business_model": "Subscription",
      "competitors": ["CompetitorA", "CompetitorB"],
      "differentiators": "AI-first approach",
      "research_goals": ["competitor_research"],
      "user_query": "How to compete?"
    }
  }
}
```

### 4.2 Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `intent` | string | Yes | One of: `bootstrap`, `question`, `refine`, `compare`, `explain`, `regenerate`, `follow-up` |
| `entities` | object | No | Extracted entities (competitor_names, industries, etc.) |
| `facts` | object | No | Extracted facts (product_type, target_market, etc.) |
| `constraints` | string[] | No | Active constraints from context |
| `requested_operations` | string[] | No | Operations to perform |
| `missing_information` | string[] | No | Fields the UI couldn't extract |
| `requested_count` | int | No | Max competitors (1-3, default 3) |
| `form_input` | object | Yes* | Required for bootstrap/refine/regenerate |
| `session_id` | string | No | For chat follow-ups |
| `message` | string | No | For question/compare/explain intents |
| `current_analysis` | object | No | Previous analysis for follow-ups |

### 4.3 Intent Routing

The orchestrator routes based on `intent`:

| Intent | Behavior |
|--------|----------|
| `bootstrap` | Full analysis: research → reasoning → validation |
| `question` | Answer a question using existing context or fresh research |
| `follow-up` | Same as question |
| `refine` | Modify existing data (add/remove competitor) |
| `compare` | Generate side-by-side comparison |
| `explain` | Explain a specific data point |
| `regenerate` | Re-run full analysis with same input |

---

## 5. Response Format

### 5.1 Success Response

```json
{
  "intent": "bootstrap",
  "status": "success",
  "data": {
    "business_summary": "MyStartup is an AI analytics platform...",
    "profile": {
      "business_name": "MyStartup",
      "idea": "AI analytics platform",
      "industry": "SaaS",
      "products_services": ["Dashboard"],
      "target_customers": "SMBs",
      "geography": "US",
      "pricing": "$49/month",
      "business_model": "Subscription",
      "competitors": ["CompetitorA", "CompetitorB"],
      "differentiators": "AI-first approach",
      "research_goals": ["competitor_research"],
      "user_query": "How to compete?",
      "summary": "AI analytics for SMBs"
    },
    "executive_summary": "Strong opportunity in SMB analytics.",
    "market_info": { "size": "$5B", "growth": "12%" },
    "positioning": "AI-first, affordable.",
    "gaps": ["No mobile app"],
    "opportunities": ["Expand to EU"],
    "risks": ["Big competitors entering"],
    "competitors": [
      {
        "name": "CompetitorA",
        "description": "Established player",
        "strengths": ["Brand"],
        "weaknesses": ["Price"],
        "pricing": "$99/mo",
        "market_position": "Leader",
        "source": "research",
        "explanation": "Main rival"
      }
    ],
    "swot": {
      "strengths": [{ "point": "AI-first", "explanation": "Unique", "source": "analysis" }],
      "weaknesses": [],
      "opportunities": [],
      "threats": []
    },
    "comparisons": [],
    "charts": [
      {
        "chart_type": "bar",
        "title": "Pricing Comparison",
        "labels": ["MyStartup", "CompetitorA"],
        "datasets": [{ "label": "Price", "data": [49, 99] }],
        "explanation": "MyStartup undercuts"
      }
    ],
    "metric_cards": [
      { "label": "Market size", "value": 5000000000, "unit": "USD" }
    ],
    "insights": [],
    "recommendations": [
      {
        "title": "Launch free tier",
        "description": "Capture SMBs",
        "priority": "high",
        "rationale": "Lower CAC",
        "explanation": "SMBs want to try before buying"
      }
    ],
    "action_plan": [
      {
        "action": "Ship free tier",
        "timeline": "Month 1",
        "priority": "high",
        "expected_outcome": "3x signups",
        "explanation": "Removes friction"
      }
    ],
    "report": "# MyStartup Analysis\n\nStrong opportunity...",
    "sources": [
      { "source": "https://example.com/a", "type": "web", "relevance": "" }
    ],
    "metadata": {
      "generated_at": "2026-09-10T12:00:00+00:00",
      "model_used": "llm-brain",
      "confidence": 0.85,
      "processing_time_ms": 4500
    }
  },
  "missing_data": [],
  "context_update": {
    "version": 1,
    "business": {
      "name": "MyStartup",
      "industry": "SaaS",
      "pricing": "$49/month",
      "model": "Subscription"
    },
    "entities": {
      "competitors": ["competitora", "competitorb"],
      "focus": null
    },
    "result_meta": {
      "requested_count": 3,
      "retrieved_count": 1,
      "filters": []
    },
    "constraints": {
      "included": ["AI-first approach"],
      "excluded": []
    },
    "keywords": ["SaaS", "Subscription", "US", "AI-first approach"]
  },
  "error": null,
  "result_counts": {
    "requested": 3,
    "retrieved": 1,
    "valid": 1,
    "displayed": 1
  },
  "operations_performed": ["extract", "infer", "calculate", "normalize"],
  "entity_statuses": {
    "competitors": [
      {
        "id": "competitora",
        "name": "CompetitorA",
        "status": "complete",
        "missing_fields": []
      }
    ]
  }
}
```

### 5.2 Status Values

| Status | Meaning | UI Action |
|--------|---------|-----------|
| `success` | All data retrieved successfully | Render normally |
| `partial` | Some data missing or failed | Render valid data, show warnings |
| `error` | Critical failure | Show error state, preserve any valid data |

### 5.3 Entity Status Values

Each competitor (and other entities) has a per-entity status:

| Status | Meaning | UI Action |
|--------|---------|-----------|
| `complete` | All required fields present | Render normally |
| `partial` | Some optional fields missing | Render with "—" for missing fields |
| `failed` | Entity could not be generated | Skip entity, show in missing_data |

---

## 6. Fault Tolerance & Error Handling

### 6.1 Retry Policy

The orchestrator retries failed operations:

| Operation | Max Retries | Delay | Fallback |
|-----------|-------------|-------|----------|
| Bootstrap (full analysis) | 2 | 1s | Return partial data |
| Chat question | 0 | — | Return error |
| Single entity generation | 1 | 500ms | Skip entity |

### 6.2 Failure Isolation

**One failure does NOT break everything:**

```
Competitor A ✓ → Render
Competitor B ✓ → Render
Competitor C ✗ → Skip, report in missing_data
Competitor D ✓ → Render
```

### 6.3 Partial Results

If some entities fail, the orchestrator returns only valid data:

```json
{
  "status": "partial",
  "data": {
    "competitors": [
      { "name": "Competitor A", "status": "complete" },
      { "name": "Competitor B", "status": "complete" }
    ]
  },
  "missing_data": [
    {
      "field": "competitors[2]",
      "reason": "Failed to generate profile for Competitor C",
      "severity": "warning"
    }
  ]
}
```

### 6.4 No Hallucination

The orchestrator **never fabricates missing results** to satisfy the requested count. If 1 competitor is available, it returns 1 — not 3.

---

## 7. Dynamic Company Limit

**Maximum 3 competitors for dynamically generated data.**

| Requested | Available | Returned |
|-----------|-----------|----------|
| 3 | 3 | 3 |
| 3 | 2 | 2 |
| 3 | 1 | 1 |
| 3 | 0 | 0 (empty/error) |
| 2 | 2 | 2 |
| 1 | 1 | 1 |

The UI must handle 0-3 competitors dynamically. The `result_counts` field tells the UI exactly what was retrieved and validated.

---

## 8. Context Management

### 8.1 Context Update (What UI Should Store)

After each response, the UI should store `context_update` in `sessionStorage`:

```typescript
const CONTEXT_KEY = 'competitor_analysis_context';
sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(response.context_update));
```

### 8.2 Context Structure

```json
{
  "version": 1,
  "business": {
    "name": "MyStartup",
    "industry": "SaaS",
    "pricing": "$49/month",
    "model": "Subscription"
  },
  "entities": {
    "competitors": ["competitora", "competitorb"],
    "focus": null
  },
  "result_meta": {
    "requested_count": 3,
    "retrieved_count": 1,
    "filters": []
  },
  "constraints": {
    "included": ["AI-first"],
    "excluded": []
  },
  "keywords": ["SaaS", "US", "AI-first"]
}
```

### 8.3 What NOT to Store

- Full conversation history
- Complete analysis data (regenerate from orchestrator)
- Raw user messages
- Generated report text
- Chart data (regenerate on demand)

### 8.4 Reference Resolution

When user references previous context:

| User Says | UI Should Resolve To |
|-----------|---------------------|
| "it" / "that one" | `context.entities.focus` |
| "the cheaper one" | Lowest `priceMonthly` |
| "the leader" | Competitor with `market_position: "Leader"` |
| "compare them" | Last two entities mentioned |
| "add X" | Add to `context.entities.competitors` (max 3) |

---

## 9. UI Integration Guide

### 9.1 Sending a Bootstrap Request

```javascript
const response = await fetch('http://localhost:8001/api/v1/parser/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    parser_input: {
      intent: 'bootstrap',
      entities: {
        business_names: ['MyStartup'],
        competitor_names: ['CompetitorA'],
        industries: ['SaaS']
      },
      facts: {
        product_type: 'AI analytics',
        target_market: 'SMBs'
      },
      requested_count: 3,
      form_input: {
        business_name: 'MyStartup',
        idea: 'AI analytics platform',
        industry: 'SaaS',
        competitors: ['CompetitorA']
      }
    }
  })
});

const data = await response.json();

if (data.status === 'success' || data.status === 'partial') {
  // Render data.data.competitors (0-3 items)
  // Store data.context_update in sessionStorage
  // Show warnings from data.missing_data
}

if (data.status === 'error') {
  // Show error message from data.error
  // Check data.missing_data for details
}
```

### 9.2 Sending a Chat Follow-Up

```javascript
const context = JSON.parse(sessionStorage.getItem('competitor_analysis_context'));

const response = await fetch('http://localhost:8001/api/v1/parser/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    parser_input: {
      intent: 'question',
      message: 'Who is the cheapest competitor?',
      session_id: context.session_id,
      current_analysis: { /* last full response */ }
    }
  })
});
```

### 9.3 Handling Partial Results

```javascript
const { status, data, missing_data, entity_statuses } = response;

// Render valid competitors only
data.competitors.forEach(comp => {
  const status = entity_statuses.competitors.find(s => s.id === slugify(comp.name));
  if (status.status !== 'failed') {
    renderCompetitorCard(comp, status);
  }
});

// Show warnings
if (missing_data.length > 0) {
  showWarnings(missing_data.filter(m => m.severity === 'warning'));
}
```

### 9.4 Updating Context After Each Response

```javascript
function updateContext(response) {
  if (response.context_update) {
    sessionStorage.setItem(
      'competitor_analysis_context',
      JSON.stringify(response.context_update)
    );
  }
}
```

---

## 10. Field Mapping (Orchestrator → UI)

The orchestrator returns data in a structured format. Here's how each field maps to UI components:

| Orchestrator Field | UI Component |
|--------------------|--------------|
| `data.competitors[]` | Competitor cards |
| `data.swot` | SWOT grid |
| `data.charts[]` | Chart visualizations |
| `data.metric_cards[]` | KPI cards |
| `data.recommendations[]` | Recommendation list |
| `data.action_plan[]` | Action plan timeline |
| `data.insights[]` | Insight cards |
| `data.report` | Full report viewer |
| `data.sources[]` | Sources list |
| `entity_statuses.competitors[]` | Per-card status badges |
| `result_counts` | Result count indicators |
| `missing_data[]` | Warning notifications |
| `context_update` | SessionStorage data |

---

## 11. Error Handling

### 11.1 HTTP Status Codes

| Code | Meaning | UI Action |
|------|---------|-----------|
| 200 | Success or partial success | Parse response body for `status` field |
| 422 | Validation error (malformed request) | Show "Invalid request format" |
| 500 | Internal server error | Show "Service unavailable, try again" |
| 502 | Upstream service (WebHunter/LLMPing) failed | Show "Research service down, partial data available" |

### 11.2 Structured Error Response

```json
{
  "intent": "bootstrap",
  "status": "error",
  "data": { /* empty AnalysisResult */ },
  "error": "Analysis failed: LLMPing timeout after 3 attempts",
  "missing_data": [
    {
      "field": "analysis",
      "reason": "LLMPing timeout after 3 attempts",
      "severity": "critical"
    }
  ]
}
```

The UI should always check `response.status` before rendering. Even on error, `response.data` may contain partial data that can be rendered.

---

## 12. Performance & Cost Optimization

### 12.1 Minimize LLM Calls

- Use `intent: "question"` for follow-ups (no full re-analysis)
- Store `context_update` to avoid re-extracting known data
- Only request fresh research when explicitly needed

### 12.2 Company Limit

The 3-company cap reduces LLM token usage by ~25%. The UI should:
- Not request more than 3 competitors
- Handle 0-3 competitors dynamically
- Use `result_counts` to show accurate counts

### 12.3 Retry Avoidance

The orchestrator handles retries internally. The UI should:
- Not retry failed requests (orchestrator already retries)
- Show error messages immediately if `status === "error"`

---

## 13. Testing the Integration

### 13.1 Health Check

```bash
curl http://localhost:8001/health
```

Response:
```json
{ "status": "ok", "service": "orchestrator", "version": "2.0.0" }
```

### 13.2 Quick Test Request

```bash
curl -X POST http://localhost:8001/api/v1/parser/execute \
  -H "Content-Type: application/json" \
  -d '{
    "parser_input": {
      "intent": "bootstrap",
      "requested_count": 3,
      "form_input": {
        "business_name": "TestCo",
        "idea": "AI analytics",
        "industry": "SaaS"
      }
    }
  }'
```

### 13.3 Verify Context Update

Check that the response includes `context_update` with compact data:

```json
{
  "context_update": {
    "business": { "name": "TestCo", "industry": "SaaS" },
    "entities": { "competitors": ["comp1", "comp2"] },
    "keywords": ["SaaS", "AI"]
  }
}
```

---

## 14. Migration from Legacy Endpoints

If the UI currently uses `/api/v1/analyze` or `/api/v1/chat`:

### 14.1 From `/api/v1/analyze` to `/api/v1/parser/execute`

**Old request:**
```json
{
  "business_name": "MyStartup",
  "idea": "AI analytics",
  "industry": "SaaS",
  "competitors": ["CompetitorA"]
}
```

**New request:**
```json
{
  "parser_input": {
    "intent": "bootstrap",
    "form_input": {
      "business_name": "MyStartup",
      "idea": "AI analytics",
      "industry": "SaaS",
      "competitors": ["CompetitorA"]
    },
    "requested_count": 3
  }
}
```

### 14.2 From `/api/v1/chat` to `/api/v1/parser/execute`

**Old request:**
```json
{
  "session_id": "abc-123",
  "message": "Tell me about CompetitorA"
}
```

**New request:**
```json
{
  "parser_input": {
    "intent": "question",
    "session_id": "abc-123",
    "message": "Tell me about CompetitorA"
  }
}
```

### 14.3 Response Changes

The new endpoint adds:
- `status` field (success/partial/error)
- `missing_data` array
- `context_update` object
- `result_counts` object
- `entity_statuses` object
- `operations_performed` array

The legacy endpoints will continue to work but won't include these parser-specific fields.

---

## 15. Summary

**Key Points for the UI:**

1. **Use `/api/v1/parser/execute`** for all new flows
2. **Always check `status`** before rendering data
3. **Handle 0-3 competitors dynamically** — never assume a fixed count
4. **Store `context_update`** in sessionStorage after each response
5. **Use `entity_statuses`** to show per-card warnings
6. **Never retry failed requests** — orchestrator handles retries
7. **Render partial data** when `status === "partial"`
8. **Check `missing_data`** for warnings and errors

**The orchestrator guarantees:**
- Fault-tolerant execution with retries
- Partial results when some data fails
- No hallucinated filler data
- Per-entity status tracking
- Compact context updates
- Maximum 3 companies for dynamic data
