# Refresh Rates Feature Plan (Feb 28, 2026)

## Objective
Add a **Refresh Rates** capability to the currency converter with env-configurable cache TTL and robust UX behavior.

## Requirements Summary
- Cache TTL is env-driven in **seconds**.
- If TTL is `0`, rates should be fetched immediately (cache bypass behavior).
- Refresh should target the current conversion context and update current result.
- Keep existing provider fallback flow.
- Add a dedicated **Refresh Rates panel** above the rate display panel.
- Show refresh button only when amount is greater than zero.
- During refresh:
  - show spinner/text: `Refreshing...`
  - disable amount/select/swap controls
- Show notifications:
  - success: `Currency rates are refreshed`
  - failure: `Currency rates refresh failed.`
- On refresh failure, keep previous successful rate/result visible.
- Refresh should not write to conversion history.
- Show last rates update date in Refresh Rates panel.
- Add/update tests in line with project standards.

## Execution Steps
1. Update API route cache logic to use env TTL seconds and support forced refresh.
2. Expand response typing to include metadata used by UI (e.g., last update date).
3. Refactor page conversion flow so refresh updates result without history writes.
4. Add Refresh Rates panel above result/rate display.
5. Add refresh loading/disabled states and notification banners.
6. Ensure existing fallback flow remains unchanged.
7. Update tests for API and page behavior (success, failure, disabled states, no history updates).
8. Validate with lint, typecheck, and tests.

## Validation Checklist
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Manual sanity checks for refresh success/failure and UI states
