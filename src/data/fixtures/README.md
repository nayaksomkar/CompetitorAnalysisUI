# Dynamic test fixtures

`flowpilot-dynamic-input.json` is an input-only record of a real dynamic test. It is intentionally not registered as a predefined sample and is not loaded automatically.

To reproduce it, run `npm run dev`, open <http://localhost:5173/CompetitorAnalysisUI/>, choose **Create your own**, copy the values from `request.parser_input.form_input` into the matching questionnaire fields, and submit. The submission sends a new live bootstrap request to the configured CompetitorEngine endpoint; results can differ from the recorded partial response.
