# Taste File
- UI data types should mirror the backend API contract, with snake_case→camelCase conversion at the API boundary (wire-to-internal mapping). Confidence: 0.7
- Backend API endpoints and response shapes should be documented in the project README. Confidence: 0.6
- Prefer minimal, surgical changes over broad refactors — explicitly constrain scope to only what needs fixing (e.g., remove Y-axis labels without touching layout, colors, spacing, or gridlines). Confidence: 0.7
- Fix issues generically at the component level rather than patching individual instances — apply changes globally so all future uses of the component benefit. Confidence: 0.8
- Prefers pie charts over bar/line/area charts for visualizations. Confidence: 0.7
- Prefers clean, minimal chart design — remove visual clutter (tick labels, axis numbers) while preserving structural elements (gridlines, scaling, hover tooltips) that aid data comprehension. Confidence: 0.6
- Includes a legend with color swatches and labels under each chart (not just inline labels). Confidence: 0.6
- Avoid aggressive CSS overrides (`!important` rules) for theme handling — they often cause the opposite theme to leak through and break light mode. Prefer using `dark:` Tailwind variants over global media-query overrides. Confidence: 0.8
- Uses very casual, blunt language with profanity when frustrated or giving feedback (e.g., "fucked up", "how can you fuck all of them"). Don't be alarmed — match the directness and just fix the issue. Confidence: 0.7
