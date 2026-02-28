# Data Model: Favorite Currencies

## Entity: FavoriteCurrencySet
- Purpose: Stores user preference for prioritized currencies.
- Fields:
  - `codes: string[]` — ordered unique currency codes.
  - `updatedAt: number` (optional in-memory metadata, not required for persistence).
- Validation rules:
  - Max length: 5.
  - Uniqueness: no duplicate currency codes.
  - Membership: each code must exist in current supported currency catalog.
  - Sanitization: invalid values removed during load.

## Entity: FavoriteStorageRecord
- Purpose: Serialized browser persistence payload.
- Fields:
  - `codes: string[]`.
- Storage key:
  - `currency-converter-favorites`.
- Validation rules on read:
  - Must be valid JSON array.
  - Elements must be strings.
  - Unknown/invalid codes discarded.
  - Result clipped to max 5 unique valid codes.

## Entity: CurrencySelectorViewState
- Purpose: Computed selector list with favorites promoted.
- Fields:
  - `favorites: Currency[]`.
  - `nonFavorites: Currency[]`.
  - `orderedCurrencies: Currency[]`.
- Derivation rules:
  - `orderedCurrencies = favorites + nonFavorites`.
  - Relative order within each group follows canonical source order.

## State Transitions
1. `idle` → `favorite_added`
   - Trigger: toggle favorite on an unfavorited code and current count < 5.
   - Effects: update set, persist record, recompute selector order, show success feedback.
2. `idle` → `favorite_removed`
   - Trigger: toggle favorite on an existing favorite.
   - Effects: update set, persist record, recompute selector order.
3. `idle` → `limit_reached`
   - Trigger: attempt to add favorite when count == 5.
   - Effects: do not mutate set, emit user-facing limit message.
4. `startup` → `hydrated`
   - Trigger: load from localStorage.
   - Effects: sanitize record, initialize favorite set, continue with safe default on parse errors.

## Relationships
- `FavoriteCurrencySet.codes` references `Currency.code` values from shared catalog in `utils/currency.ts`.
- `CurrencySelectorViewState` is a projection derived from `FavoriteCurrencySet` + canonical currency list.
