# ORCHESTRATOR PROMPT — Build the CompetitorEngine Backend

You are building the **CompetitorEngine orchestrator** — the brain of a competitive intelligence system. The orchestrator receives natural-language questions from a UI, decides what to search, synthesizes answers using an LLM, and returns structured responses.

## System Architecture

```
UI (Browser) → POST /api/v1/parser/execute → Orchestrator (this service)
                                              ↓
                                    ┌─────────┴─────────┐
                                    ↓                   ↓
                              WebHunter              LLMPing
                              (web search)          (LLM reasoning)
```

### Docker Services

| Service          | Host port | Container port | Purpose                    |
|------------------|-----------|----------------|----------------------------|
| competitorengine | 8001      | 8001           | Orchestrator (this service)|
| llmping          | 8000      | 8000           | LLM analysis               |
| webhunter        | 8765      | 8000           | Web search / harvesting    |

The orchestrator **refuses to start** without `LLMPING_URL` and `WEBHUNTER_URL` environment variables set.

## Your Task

Build a FastAPI service that exposes `POST /api/v1/parser/execute` and implements the full intent routing, web search, LLM synthesis, and response formatting described below.

---

## API Contract

### Request

```json
{
  "parser_input": {
    "intent": "question",
    "message": "tell me about Fragante as compared to other relevant companies in this list",
    "session_id": "abc-123",
    "context_update": {
      "version": 1,
      "business": { "name": "Scentra", "industry": "Fragrance" },
      "entities": { "competitors": ["forest-essentials", "kama-ayurveda"], "focus": null },
      "result_meta": { "requested_count": 3, "retrieved_count": 2, "filters": [] },
      "constraints": { "included": [], "excluded": [] },
      "keywords": ["Fragrance", "Premium"]
    },
    "form_input": null,
    "requested_count": 3,
    "current_analysis": null
  }
}
```

### Response

```json
{
  "intent": "question",
  "status": "success",
  "data": null,
  "answer": {
    "summary": "Fragante is a mid-range Indian fragrance brand...",
    "competitors": [
      {
        "id": "fragante",
        "name": "Fragante",
        "source": "web",
        "lookupConfidence": 78,
        "profile": {
          "description": "...",
          "pricingTier": "Mid-range",
          "marketPosition": "Emerging",
          "marketShare": null,
          "growthRate": null,
          "funding": null,
          "founded": "2019",
          "hq": "Mumbai, India",
          "strengths": ["..."],
          "weaknesses": ["..."]
        },
        "sources": [
          { "id": "fragante-s1", "title": "...", "url": "...", "publisher": "...", "date": "..." }
        ]
      }
    ],
    "comparedTo": [],
    "question": null,
    "explanation": null,
    "evidence": null,
    "sources": null
  },
  "missing_data": [],
  "context_update": { "version": 1, "business": {...}, "entities": {...}, ... },
  "evicted_entities": [],
  "error": null,
  "result_counts": { "requested": 1, "retrieved": 1, "valid": 1, "displayed": 1 },
  "operations_performed": ["extract", "infer"],
  "entity_statuses": {
    "competitors": [
      { "id": "fragante", "name": "Fragante", "status": "complete", "missing_fields": [], "source": "web", "lookupConfidence": 78 }
    ]
  }
}
```

---

## Intent Routing

The orchestrator receives `intent` and `message`. It must:

1. **Classify** the intent (or trust the UI's classification):
   - `bootstrap` — full analysis (research → reasoning → validation)
   - `question` — answer a question, possibly about a new company
   - `follow-up` — same as question, with pronoun resolution
   - `refine` — add/remove/change a competitor
   - `compare` — side-by-side comparison of named entities
   - `explain` — drill into a single data point
   - `regenerate` — re-run bootstrap with same input

2. **Plan** the work:
   - Extract company/brand names from `message`
   - Check which are already in `context_update.entities.competitors`
   - For unknown companies → WebHunter search → LLMPing extraction
   - For known companies → use cached profile from context

3. **Execute**:
   - Call WebHunter for unknown entities (parallel if multiple)
   - Call LLMPing to synthesize profiles from search results
   - Merge results

4. **Validate**:
   - If `lookupConfidence < 40` or `sourceCount < 2` → mark entity `partial`
   - Never fabricate entities to fill a count

5. **Return** the structured response

---

## WebHunter Integration

WebHunter is a web search service running at `WEBHUNTER_URL` (e.g., `http://localhost:8765`).

### Search Query Templates

For each unknown company, run these searches (pick the best 2-3 based on context):

```
"{company} company profile {industry}"
"{company} pricing {industry}"
"{company} competitors market share"
"{company} funding headquarters"
```

### WebHunter Response Format

```json
{
  "results": [
    {
      "title": "Fragante launches new fragrance line",
      "url": "https://example.com/fragante",
      "publisher": "Business Today",
      "date": "2026-08-15",
      "snippet": "Fragante, a Mumbai-based fragrance brand founded in 2019..."
    }
  ]
}
```

Keep the top 5 results per entity. Deduplicate by domain.

---

## LLMPing Integration

LLMPing is an LLM service running at `LLMPING_URL` (e.g., `http://localhost:8000`).

### Profile Extraction Prompt

Send this to LLMPing for each unknown company:

```
Extract a company profile from these web sources.

Company: {company_name}
Industry: {industry}

Sources:
1. {title_1} - {snippet_1}
2. {title_2} - {snippet_2}
...

Return JSON:
{
  "name": "...",
  "description": "1-2 sentence summary",
  "pricingTier": "Premium | Mid-range | Budget | Ultra-Premium | unknown",
  "marketPosition": "Leader | Challenger | Niche | Emerging | unknown",
  "marketShare": null,
  "growthRate": null,
  "funding": null,
  "founded": null,
  "hq": null,
  "strengths": ["up to 3"],
  "weaknesses": ["up to 3"],
  "confidence": 0-100,
  "sourceCount": 5
}
```

---

## Context Management

The UI stores `context_update` in sessionStorage and sends it back with every request. The orchestrator must:

1. **Read** `context_update.entities.competitors` to know which companies are already known
2. **Update** `context_update.entities.competitors` with new entity slugs (max 3 active)
3. **Evict** the oldest entity when cap is hit → add to `evicted_entities[]`
4. **Cache** evicted entities for 24 hours (so follow-ups can still answer)

### Pronoun Resolution

| User Says | Resolve To |
|-----------|-----------|
| "it" / "that one" | `context.entities.focus` |
| "the cheaper one" | Lowest `priceMonthly` |
| "the leader" | `marketPosition: "Leader"` |
| "compare them" | Last two entities mentioned |

---

## Eviction Policy

Maximum 3 active competitors. When a 4th is added:

1. Add the new entity
2. Move the oldest `in_context` entity to `evicted_entities[]`
3. Cache the evicted entity's profile for 24 hours
4. Report in `evicted_entities[]` so UI can show a toast

---

## Error Handling

### Retry Policy

| Operation | Max Retries | Delay | Fallback |
|-----------|-------------|-------|----------|
| WebHunter search | 2 | 1s | Mark entity `failed` |
| LLMPing extraction | 2 | 500ms | Use raw sources only |
| Bootstrap | 2 | 1s | Return partial data |

### Failure Isolation

One entity failing must not break the whole response. Return valid entities + `missing_data` for failed ones.

---

## Implementation Requirements

### FastAPI App Structure

```
app/
├── main.py              # FastAPI app, lifespan, CORS
├── config.py            # Settings (LLMPING_URL, WEBHUNTER_URL, etc.)
├── models.py            # Pydantic request/response models
├── router.py            # /api/v1/parser/execute endpoint
├── services/
│   ├── webhunter.py     # WebHunter client
│   ├── llmping.py       # LLMPing client
│   ├── planner.py       # Intent classification + planning
│   ├── executor.py      # Run the plan
│   └── validator.py     # Entity validation
└── requirements.txt
```

### Environment Variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `LLMPING_URL` | yes | — | Full URL to LLMPing |
| `WEBHUNTER_URL` | yes | — | Full URL to WebHunter |
| `LLMPING_TIMEOUT` | no | 60 | Seconds per request |
| `WEBHUNTER_TIMEOUT` | no | 30 | Seconds per request |
| `SERVICE_HOST` | no | 0.0.0.0 | Bind address |
| `SERVICE_PORT` | no | 8001 | Port |
| `LOG_LEVEL` | no | INFO | DEBUG/INFO/WARNING/ERROR |

### Health Endpoint

```bash
curl http://localhost:8001/health
# → { "status": "ok", "service": "orchestrator", "version": "2.1.0" }
```

---

## Testing

### 1. Health Check
```bash
curl http://localhost:8001/health
```

### 2. Bootstrap
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

### 3. Question (lookup)
```bash
curl -X POST http://localhost:8001/api/v1/parser/execute \
  -H "Content-Type: application/json" \
  -d '{
    "parser_input": {
      "intent": "question",
      "message": "tell me about Fragante",
      "session_id": "test-123",
      "context_update": {
        "version": 1,
        "business": { "name": "TestCo", "industry": "Fragrance" },
        "entities": { "competitors": [], "focus": null },
        "result_meta": { "requested_count": 3, "retrieved_count": 0, "filters": [] },
        "constraints": { "included": [], "excluded": [] },
        "keywords": ["Fragrance"]
      }
    }
  }'
```

Expected: `answer.competitors[0].name === "Fragante"`, `source: "web"`, `lookupConfidence > 0`

### 4. Compare
```bash
curl -X POST http://localhost:8001/api/v1/parser/execute \
  -H "Content-Type: application/json" \
  -d '{
    "parser_input": {
      "intent": "compare",
      "message": "compare Fragante and Jo Malone India",
      "session_id": "test-123",
      "context_update": { "version": 1, "business": {...}, "entities": { "competitors": ["jo-malone-india"], "focus": null }, ... }
    }
  }'
```

Expected: `answer.competitors[0]` is Fragante (web), `answer.comparedTo[0]` is Jo Malone India (context)

---

## Key Design Principles

1. **Orchestrator decides everything** — the UI is a thin renderer
2. **Never fabricate** — if WebHunter fails, mark entity `failed`, don't invent data
3. **Cache aggressively** — `context_update` carries compact profiles; follow-ups about cached entities cost zero WebHunter calls
4. **Parallelize** — when a message names multiple new entities, run WebHunter searches in parallel
5. **Bound the work** — max 3 WebHunter searches per request, top 5 sources per entity to LLMPing
6. **Partial results** — one failure doesn't break the response; return what worked + `missing_data`

---

## Deliverables

1. Complete FastAPI app in `app/` directory
2. `requirements.txt` with all dependencies
3. `Dockerfile` for containerization
4. `docker-compose.yml` that starts all 3 services
5. README with setup instructions
6. All test cases passing

Build this now.
