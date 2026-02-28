# Quickstart: Favorite Currencies

## 1) Implement
- Extend storage utilities to read/write/clear favorite currency codes with sanitization and max=5 enforcement.
- Extend selector-related UI to let users toggle favorite status for selected currencies from selector context.
- Apply favorites-first ordering to both currency selectors while preserving existing conversion behavior.
- Add user feedback for success and limit-reached actions.

## 2) Validate manually
1. Start app: `npm run dev`
2. Open converter and mark 1-5 currencies as favorites.
3. Confirm favorites appear first in both selectors.
4. Reload page and confirm favorites persist.
5. Attempt to add a 6th favorite and verify it is blocked with clear feedback.
6. Remove a favorite and verify a new favorite can then be added.
7. Verify keyboard-only operation of favorite controls and visible focus indication.

## 3) Validate automated checks
- Run focused tests for changed modules (selector, storage, page behavior): `npm test -- CurrencySelect storage page`
- Run full tests: `npm test`
- Run typecheck: `npx tsc --noEmit`

## 4) Coverage + accessibility gate
- Confirm repository line coverage stays >= 80%.
- Confirm favorite controls expose accessible names and state semantics and are keyboard operable.

## 5) Verification outcomes (2026-02-28)
- Focused tests: PASS (`npm test -- components/CurrencySelect.test.tsx utils/currency.test.ts utils/storage.test.ts app/page.test.tsx`)
- Full test suite: PASS (`npm test`) — 7/7 suites, 42/42 tests
- Typecheck: PASS (`npx tsc --noEmit`)
- Coverage: PASS floor check (`npm test -- --coverage`) — overall lines: 87.35% (>=80%)
- Accessibility checks captured:
	- Favorite toggle controls expose explicit accessible names (e.g., "Add USD to favorites", "Remove USD from favorites")
	- Favorite controls expose state semantics via `aria-pressed`
	- Favorite controls remain keyboard operable via native button semantics with visible focus ring classes
