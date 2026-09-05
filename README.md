# Competitive Insights — AI Competitive Analysis UI

A React + TypeScript app that helps you analyze your competitors. Think ChatGPT meets business research — you answer a few questions about your business, and get back interactive charts, competitor profiles, SWOT analyses, and action plans.

## What It Does

- **Ask about your business** — Fill out a short form (or pick a sample)
- **Get a full analysis** — Competitors, market gaps, pricing comparisons, insights
- **Chat with your data** — Ask follow-up questions, get interactive answers
- **9 tabs to explore** — Overview, Competitors, Products, Pricing, Market Gaps, Insights, Reports, Sources
- **"Explain this" everywhere** — Click any chart, table, or insight to see why it matters

## Quick Start

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>.

Other commands:
- `npm run build` — Build for production
- `npm run preview` — Preview the production build
- `npm run typecheck` — Check for TypeScript errors

## Connecting to Your Backend

This app works out of the box with mock data. To connect it to a real backend:

### 1. Your API needs two endpoints:

| Method | Path | What it does |
|--------|------|--------------|
| `GET` | `/health` | Health check → `{ status: "ok" }` |
| `POST` | `/api/v1/analyze` | Main analysis endpoint |

### 2. Send this to `/api/v1/analyze`:

```json
{
  "business_name": "Your Company",
  "idea": "What your business does",
  "industry": "Your industry",
  "competitors": ["Competitor 1", "Competitor 2"],
  "research_goals": ["competitor_pricing", "market_gaps"]
}
```

Only `business_name`, `idea`, and `industry` are required. The rest is optional.

### 3. You'll get back:

```json
{
  "competitors": [...],
  "swot": { "strengths": [...], "weaknesses": [...], "opportunities": [...], "threats": [...] },
  "charts": [...],
  "insights": [...],
  "recommendations": [...],
  "action_plan": [...],
  "report": { ... },
  "sources": [...]
}
```

Every item includes an `explanation` field — use it for "Explain This" tooltips.

### 4. Chart data looks like:

```json
{
  "chart_type": "bar",
  "labels": ["Le Labo", "Byredo", "Replica"],
  "datasets": [
    { "name": "Market Share", "color": "#10a37f", "values": [8, 6, 11] }
  ]
}
```

Chart types: `bar`, `line`, `area`, `radar`, `pie`

### 5. Wire it up:

In `src/api/client.ts`, swap one line:

```ts
import { HttpApi } from './http';

export const api: ApiClient = new HttpApi({
  baseUrl: import.meta.env.VITE_API_URL,
});
```

Add to your `.env`:
```
VITE_API_URL=https://your-api.com
```

The `HttpApi` class handles all the translation — your backend sends snake_case, the UI uses camelCase automatically.

## Project Structure

```
src/
├── App.tsx              # Main app shell + sidebar
├── types.ts             # All TypeScript types
├── api/
│   ├── client.ts        # API client (swap mock ↔ real here)
│   └── http.ts          # Real backend client
├── data/                # Mock data samples
├── components/          # UI pieces (charts, cards, tables)
└── views/              # Tab content
```

## Design Notes

- No external UI library — custom components with Tailwind CSS
- No charting library — custom SVG charts (bar, line, area, radar, pie)
- Chat-first, but everything has a home in the tabs
- Sources are always visible — trust over polish

## License

MIT
