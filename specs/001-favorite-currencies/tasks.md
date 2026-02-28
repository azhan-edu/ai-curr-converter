# Tasks: Favorite Currencies

**Input**: Design documents from `/specs/001-favorite-currencies/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED for behavior-changing work and bug fixes.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared feature scaffolding and test entry points.

- [ ] T001 Create feature constants for favorites storage key and max size in utils/storage.ts
- [ ] T002 [P] Add favorite-related shared types/interfaces in types/index.ts
- [ ] T003 [P] Add test skeleton for storage favorites behavior in utils/storage.test.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities required by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Implement read/sanitize helper for favorite currency codes in utils/storage.ts
- [ ] T005 Implement write/remove favorite helpers with max=5 enforcement in utils/storage.ts
- [ ] T006 [P] Implement deterministic favorites-first ordering helper in utils/currency.ts
- [ ] T007 [P] Add utility tests for ordering logic and edge cases in utils/currency.test.ts
- [ ] T008 Add storage utility tests for malformed payload recovery and deduplication in utils/storage.test.ts

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Mark and Unmark Favorite Currencies (Priority: P1) 🎯 MVP

**Goal**: Let users toggle favorite state from the currency selector context.

**Independent Test**: Open converter, toggle favorite on selected currency, verify indicator and state changes without touching ordering/persistence-specific assertions.

### Tests for User Story 1 (REQUIRED) ⚠️

- [ ] T009 [P] [US1] Add component tests for favorite toggle actions and ARIA pressed state in components/CurrencySelect.test.tsx
- [ ] T010 [P] [US1] Add page interaction tests for mark/unmark flow and feedback message in app/page.test.tsx

### Implementation for User Story 1

- [ ] T011 [US1] Extend currency selector props and UI to expose favorite toggle control for selected currency in components/CurrencySelect.tsx
- [ ] T012 [US1] Add favorite toggle state handling and feedback messaging in app/page.tsx
- [ ] T013 [US1] Ensure keyboard operability and visible focus styles for favorite controls in components/CurrencySelect.tsx

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Prioritize Favorites in Currency Lists (Priority: P2)

**Goal**: Render favorite currencies first in all selectors with stable deterministic ordering.

**Independent Test**: Favorite multiple currencies and verify both From/To selectors list favorites first and preserve canonical order for remaining items.

### Tests for User Story 2 (REQUIRED) ⚠️

- [ ] T014 [P] [US2] Add selector ordering tests for favorites-first behavior in components/CurrencySelect.test.tsx
- [ ] T015 [P] [US2] Add page-level regression test for synchronized ordering in both selectors in app/page.test.tsx

### Implementation for User Story 2

- [ ] T016 [US2] Integrate favorites ordering helper into page selector data flow in app/page.tsx
- [ ] T017 [US2] Update selector rendering to consume preordered currency list safely in components/CurrencySelect.tsx

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Persist and Enforce Favorite Limits (Priority: P3)

**Goal**: Persist favorites across reloads and block additions beyond five.

**Independent Test**: Save up to five favorites, reload app to verify restoration, then attempt sixth favorite and verify block with clear feedback.

### Tests for User Story 3 (REQUIRED) ⚠️

- [ ] T018 [P] [US3] Add storage persistence tests for load/reload lifecycle in utils/storage.test.ts
- [ ] T019 [P] [US3] Add limit-enforcement and user-feedback tests in app/page.test.tsx

### Implementation for User Story 3

- [ ] T020 [US3] Hydrate favorite state from storage on page load with invalid-data fallback in app/page.tsx
- [ ] T021 [US3] Persist favorite mutations using storage helpers in app/page.tsx
- [ ] T022 [US3] Enforce max=5 at interaction boundary and show actionable limit message in app/page.tsx

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates across all stories.

- [ ] T023 [P] Update feature documentation and manual verification notes in specs/001-favorite-currencies/quickstart.md
- [ ] T024 Run full test suite and fix feature-related regressions in app/page.test.tsx
- [ ] T025 [P] Run typecheck and resolve feature-related typing issues in app/page.tsx
- [ ] T026 [P] Run coverage validation to confirm >=80% line coverage in coverage/lcov-report/index.html
- [ ] T027 [P] Execute WCAG 2.1 AA keyboard/focus/label verification and capture outcomes in specs/001-favorite-currencies/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; starts immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **User Story Phases (Phase 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 and is the MVP slice.
- **US2 (P2)**: Starts after Phase 2; depends functionally on ordered list pipeline but remains independently testable.
- **US3 (P3)**: Starts after Phase 2; persists and enforces limit independent of US2 ordering checks.

### Within Each User Story

- Tests first (must fail before implementation).
- Update behavior implementation.
- Validate accessibility and regression coverage.

### Story Completion Order

1. US1 (MVP)
2. US2
3. US3

---

## Parallel Opportunities

- **Setup**: T002 and T003 can run in parallel after T001.
- **Foundational**: T006 and T007 can run in parallel while T004/T005 proceed; T008 follows storage implementation.
- **US1**: T009 and T010 parallel; T011/T012 sequential; T013 follows UI update.
- **US2**: T014 and T015 parallel; T016 then T017.
- **US3**: T018 and T019 parallel; T020/T021/T022 sequential.
- **Polish**: T023, T025, T026, T027 parallel after T024 kickoff.

---

## Parallel Example: User Story 1

```bash
# Run US1 test tasks in parallel:
Task: "T009 [US1] Add component tests for favorite toggle actions and ARIA pressed state in components/CurrencySelect.test.tsx"
Task: "T010 [US1] Add page interaction tests for mark/unmark flow and feedback message in app/page.test.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Run US3 test tasks in parallel:
Task: "T018 [US3] Add storage persistence tests for load/reload lifecycle in utils/storage.test.ts"
Task: "T019 [US3] Add limit-enforcement and user-feedback tests in app/page.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete US1 tasks (T009-T013).
3. Validate US1 independently via tests and manual keyboard checks.
4. Demo/deploy MVP.

### Incremental Delivery

1. Deliver MVP (US1).
2. Add ordering improvements (US2) and validate independently.
3. Add persistence and limit enforcement (US3) and validate independently.
4. Run polish quality gates.

### Parallel Team Strategy

1. Team aligns on Phase 1 and Phase 2.
2. After foundation:
   - Developer A: US1
   - Developer B: US2
   - Developer C: US3
3. Merge story slices with phase-level checkpoints.

---

## Notes

- [P] tasks target different files or independent verification tracks.
- Every user story remains independently demonstrable and testable.
- Keep changes minimal and aligned with current Next.js App Router boundaries.
