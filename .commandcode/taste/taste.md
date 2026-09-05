# Taste File

## Project Structure
- UI data types should mirror the backend API contract, with snake_case→camelCase conversion at the API boundary (wire-to-internal mapping). Confidence: 0.7
- Backend API endpoints and response shapes should be documented in the project README. Confidence: 0.6

## Code Changes
- Prefer minimal, surgical changes over broad refactors — explicitly constrain scope to only what needs fixing (e.g., remove Y-axis labels without touching layout, colors, spacing, or gridlines). Confidence: 0.7
- Fix issues generically at the component level rather than patching individual instances — apply changes globally so all future uses of the component benefit. Confidence: 0.8

## Visual Design / Charts
- Prefer clean, minimal chart design — remove visual clutter (tick labels, axis numbers) while preserving structural elements (gridlines, scaling, hover tooltips) that aid data comprehension. Confidence: 0.6
