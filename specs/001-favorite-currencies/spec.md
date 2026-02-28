# Feature Specification: Favorite Currencies

**Feature Branch**: `001-favorite-currencies`  
**Created**: 2026-02-28  
**Status**: Draft  
**Input**: User description: "Add Favorite Currencies feature where users can mark currencies as favorites from dropdown, favorites appear at top, persist in localStorage, and max 5 favorites"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Mark and Unmark Favorite Currencies (Priority: P1)

As a user, I want to mark currencies as favorites directly from currency selectors so I can quickly access my most-used currencies.

**Why this priority**: The core value of the feature is user-controlled favorites management; without it, there is no favorites experience.

**Independent Test**: Can be fully tested by opening the currency selector, toggling favorite status for multiple currencies, and confirming the favorite indicator updates correctly.

**Acceptance Scenarios**:

1. **Given** a user opens a currency selector, **When** they mark a currency as favorite, **Then** that currency is shown as favorite in the selector.
2. **Given** a currency is already favorited, **When** the user removes it from favorites, **Then** it no longer appears as favorite.

---

### User Story 2 - Prioritize Favorites in Currency Lists (Priority: P2)

As a user, I want my favorite currencies to appear at the top of currency lists so selecting frequently used currencies requires fewer steps.

**Why this priority**: Ranking favorites improves daily usability and directly reduces repetitive scrolling.

**Independent Test**: Can be tested by favoriting non-adjacent currencies and confirming they consistently appear before non-favorites in selectors.

**Acceptance Scenarios**:

1. **Given** a user has favorited currencies, **When** they open a selector, **Then** all favorites are displayed before non-favorites.
2. **Given** no favorites exist, **When** the user opens a selector, **Then** currencies follow the standard default ordering.

---

### User Story 3 - Persist and Enforce Favorite Limits (Priority: P3)

As a user, I want my favorite currencies to stay saved between visits while limiting the list to five, so the list remains focused and manageable.

**Why this priority**: Persistence is essential for convenience, and the limit protects readability and keeps prioritization meaningful.

**Independent Test**: Can be tested by selecting favorites, reloading the app, and attempting to add a sixth favorite.

**Acceptance Scenarios**:

1. **Given** a user has saved favorites, **When** they return to the app later, **Then** previously saved favorites are restored.
2. **Given** a user already has five favorites, **When** they try to add a sixth, **Then** the app prevents the addition and informs the user that the limit is five.

---

### Constitution Alignment *(mandatory)*

- Code quality expectations: currency selection and preference modules must remain single-responsibility, use strict typing, and preserve existing validation/error handling behavior.
- Test strategy: update unit/component tests for selector behavior, ordering logic, and persistence; maintain at least 80% line coverage at project level.
- Accessibility scope (WCAG 2.1 AA): favorite controls must be keyboard-operable, expose clear accessible names/state, and preserve visible focus indicators and readable contrast.

### Edge Cases

- Stored favorite data is missing, malformed, or references unsupported currencies.
- A user rapidly toggles favorite status multiple times in one session.
- The currency list has fewer than five available currencies.
- A favorited currency is removed from the available options in a future data update.
- The user tries to favorite a currency that is already favorited.

## Assumptions

- Favorites are user-specific to the current browser profile.
- The five-favorite limit applies to the overall favorites set, not per selector.
- Favorite prioritization applies consistently to all currency selectors in the converter.
- If stored favorite data is invalid, the app safely falls back to no favorites.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to mark any available currency as a favorite from the currency selection experience.
- **FR-002**: System MUST allow users to remove a currency from favorites.
- **FR-003**: System MUST visually distinguish favorite currencies from non-favorites in selection lists.
- **FR-004**: System MUST display favorite currencies before non-favorite currencies in all currency selectors.
- **FR-005**: System MUST persist favorites so they remain available after page reload and future visits on the same browser.
- **FR-006**: System MUST enforce a maximum of five favorite currencies.
- **FR-007**: System MUST prevent saving a sixth favorite when the maximum is reached.
- **FR-008**: System MUST provide user-facing feedback when favorite changes succeed or when the favorite limit prevents an action.
- **FR-009**: System MUST ignore invalid persisted favorite data and continue with a usable default state.
- **FR-010**: System MUST keep existing conversion behavior unchanged when no favorites are configured.

### Key Entities *(include if feature involves data)*

- **Currency**: A selectable monetary unit identified by a unique code and display label.
- **Favorite Currency Set**: A user preference collection containing up to five unique currency codes.
- **Selector View State**: The ordered presentation of currencies where favorites are prioritized over non-favorites.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of users can add or remove a favorite currency in 10 seconds or less during usability testing.
- **SC-002**: 100% of favorited currencies appear above non-favorites in selector lists across all tested scenarios.
- **SC-003**: 100% of favorites selected by a user are restored after reload in persistence tests, up to the five-item limit.
- **SC-004**: 100% of attempts to add more than five favorites are blocked with clear user feedback in acceptance testing.
