# Competitive Insights

Competitive Insights is a React and TypeScript dashboard for exploring a business's competitive landscape. It turns a business profile or a saved example into a navigable analysis with competitor comparisons, pricing, market gaps, insights, reports, and source links.

## Product overview

Start with a guided business profile or open one of the bundled examples. Saved examples render immediately from local data and can refresh from GitHub. For a live analysis, the UI sends structured requests to the CompetitorEngine parser endpoint. The dashboard then presents the returned data across eight tabs, with contextual explanations and predefined actions tied to the selected entity and current analysis.

### Highlights

- Responsive business questionnaire with competitor and research-goal inputs
- Eight analysis views: Overview, Competitors, Products, Pricing, Market Gaps, Insights, Reports, and Sources
- Custom SVG visualizations and comparison tables without a charting dependency
- Contextual explain, compare, and question actions that preserve analysis context
- Local-first sample loading with GitHub refresh and in-memory caching
- Configurable backend endpoint, health status, loading and error states, and graceful handling of incomplete analysis data
- Typed API mapping from orchestrator responses into UI data models

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · Vitest · Testing Library

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. The bundled perfume and protein examples are available without a running backend. To generate a new analysis or run backend-backed contextual actions, start the CompetitorEngine service and set its URL in the app's endpoint settings. The expected parser route is `POST /api/v1/parser/execute`; the health indicator uses `GET /health`.

Optional sample-data settings are documented in [.env.example](.env.example):

- `VITE_DATA_REPO` and `VITE_DATA_BRANCH` select the GitHub repository and branch used to refresh bundled sample data.

Set backend URLs in the app's endpoint settings; endpoint selections are saved in browser storage.

## Backend contract

The UI posts a `parser_input` object with an intent (`bootstrap`, `compare`, `explain`, or `question`) to `/api/v1/parser/execute`. A bootstrap request includes the business profile as `form_input`. The response should include a `data` object containing the analysis fields supported by the UI. Contextual action responses may also include a status, error, and `missing_data` list. The response mapping and validation live in [src/api/client.ts](src/api/client.ts).

## Project structure

```text
src/
├── App.tsx                 # App state, navigation, and analysis flow
├── actions.ts              # Contextual action registry
├── api/                    # Orchestrator client and saved action handling
├── components/             # Dashboard, questionnaire, tables, charts, and UI primitives
├── data/                   # Local examples and GitHub sample loader
├── types.ts                # Shared domain and API types
└── views/                  # Analysis tab content
```

## Useful commands

```bash
npm run dev        # Start the Vite development server
npm run build      # Type check and create the production build
npm run typecheck  # Run the TypeScript project checks
npm run lint       # Run ESLint
```

## Resume-ready project summary

**Competitive Insights Dashboard** — Built a responsive React and TypeScript application that transforms business profiles and orchestrator responses into an eight-section competitive analysis dashboard. Implemented typed API integration, context-aware explain and compare actions, custom SVG charts, and local-first sample loading with GitHub refresh and caching.

## License

MIT
