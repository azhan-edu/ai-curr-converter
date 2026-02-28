# Contract: Favorites UI and Persistence Boundary

## Scope
Defines externally observable behavior between converter page state, selector UI, and browser persistence for Favorite Currencies.

## Inputs
- `supportedCurrencies: Currency[]` (canonical currency catalog).
- `favoriteCodes: string[]` (persisted preference candidate).
- `toggleCurrencyCode: string` (user action target).

## Output Behaviors
1. Ordering contract
   - The selector options MUST render with all valid favorite currencies first.
   - Non-favorites MUST remain in canonical order after favorites.
2. Limit contract
   - At most 5 favorite codes may exist after any mutation.
   - Attempting to add a 6th favorite MUST not change persisted favorites.
3. Persistence contract
   - Favorites MUST be serialized as JSON string array at key `currency-converter-favorites`.
   - Invalid persisted payloads MUST be sanitized to a safe valid set (possibly empty).
4. Feedback contract
   - Successful add/remove actions MUST produce user-visible confirmation.
   - Limit violations MUST produce user-visible actionable feedback.
5. Accessibility contract
   - Favorite controls MUST be keyboard operable.
   - Favorite controls MUST expose an accessible name and state semantics.

## Error Handling
- JSON parse errors: recover with empty favorites set.
- Unknown currency codes in stored payload: ignore invalid entries.
- Duplicates in stored payload: deduplicate while preserving first valid occurrence.

## Non-goals
- No server-side favorites sync.
- No cross-device profile synchronization.
