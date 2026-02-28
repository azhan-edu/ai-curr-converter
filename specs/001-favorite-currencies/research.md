# Research: Favorite Currencies

## Decision 1: Favorite interaction model in selector context
- Decision: Keep native `<select>` for currency choice and add adjacent per-selector favorite toggle controls bound to the currently selected currency (not inline controls inside `<option>` rows).
- Rationale: Native `<select>` does not support reliable interactive controls within options; adjacent controls preserve accessibility, browser consistency, and existing architecture.
- Alternatives considered:
  - Build a fully custom combobox/listbox with inline star actions (rejected: larger scope and higher accessibility risk for this feature).
  - Add a separate global favorites management modal (rejected: does not satisfy "from dropdown" interaction expectation as directly).

## Decision 2: Ordering algorithm
- Decision: Apply deterministic favorites-first ordering with stable secondary sort: favorites grouped first in their existing canonical currency order, followed by non-favorites in canonical order.
- Rationale: Predictable ordering avoids visual churn and test brittleness while meeting requirement that favorites appear at the top.
- Alternatives considered:
  - Sort by most recently favorited first (rejected: less predictable and requires extra metadata).
  - Alphabetical full resort after each toggle (rejected: may reorder unexpectedly relative to existing app ordering).

## Decision 3: Persistence schema and validation
- Decision: Persist favorites as a JSON array of currency codes under a dedicated localStorage key (e.g., `currency-converter-favorites`) with strict runtime sanitization (unique strings, valid known currencies, max 5).
- Rationale: Array-of-codes is minimal, portable, easy to migrate, and simple to validate.
- Alternatives considered:
  - Object map `{ code: true }` (rejected: less readable in storage and redundant for small capped sets).
  - Persist full currency objects (rejected: duplicates source-of-truth data and raises stale-data risk).

## Decision 4: Favorite limit feedback behavior
- Decision: Block the 6th favorite and surface immediate user-facing message near controls and/or existing notification pattern.
- Rationale: Explicit feedback is required and prevents silent failure.
- Alternatives considered:
  - Implicitly replace oldest favorite (rejected: surprising behavior and data loss risk).
  - Disable all favorite actions at limit (rejected: users must still be able to un-favorite).

## Decision 5: Accessibility verification scope
- Decision: Favorite toggle controls must be keyboard reachable, have accessible names and pressed state semantics (`aria-pressed` where applicable), and preserve visible focus styling with sufficient contrast.
- Rationale: Aligns with WCAG 2.1 AA and project constitution requirements for UI changes.
- Alternatives considered:
  - Icon-only controls without explicit labels (rejected: poor screen reader clarity).
  - Mouse-only affordance via hover controls (rejected: fails keyboard operability).

## Resolved Clarifications
- No unresolved "NEEDS CLARIFICATION" items remain.
- Feature remains client-side and does not require API route changes.
