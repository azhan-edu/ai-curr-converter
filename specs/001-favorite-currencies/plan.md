# Implementation Plan: Favorite Currencies

**Branch**: `001-favorite-currencies` | **Date**: 2026-02-28 | **Spec**: `specs/001-favorite-currencies/spec.md`
**Input**: Feature specification from `specs/001-favorite-currencies/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a favorites capability to currency selection so users can mark/unmark currencies, keep favorites ordered first in selectors, persist favorites in localStorage, and enforce a maximum of five favorites with clear feedback. The approach extends existing client-side selector and storage utilities with a focused favorites preference model, accessibility-safe controls, and regression tests for ordering, persistence, and limit enforcement.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x, React 19.x, Next.js 16.x  
**Primary Dependencies**: Next.js App Router, React, Tailwind CSS, Jest, React Testing Library  
**Storage**: Browser localStorage (client-side preferences)  
**Testing**: Jest + React Testing Library (`jsdom`)  
**Target Platform**: Modern desktop/mobile browsers (Next.js web app)
**Project Type**: Web application (single Next.js project)  
**Performance Goals**: Favorite toggle and selector reordering complete within a single interaction frame; no perceptible delay for current currency list size  
**Constraints**: Max 5 favorites, no server/client boundary violations, preserve existing conversion behavior, WCAG 2.1 AA keyboard + semantics + focus compliance  
**Scale/Scope**: Two selector instances on the converter page, shared currency dataset, single-browser-profile persistence

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Code Quality Gate: planned implementation is strictly typed, minimal,
  maintainable, and aligned with existing architecture.
- Testing Gate: planned test strategy covers all behavior changes and preserves
  a minimum 80% line coverage.
- Accessibility Gate: UI-impacting work includes WCAG 2.1 AA requirements and
  verification approach (keyboard, focus, contrast, semantics).

Initial gate assessment: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-favorite-currencies/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
app/
├── page.tsx
└── page.test.tsx

components/
├── CurrencySelect.tsx
├── CurrencySelect.test.tsx
└── [other UI components]

utils/
├── currency.ts
└── storage.ts

types/
└── index.ts
```

**Structure Decision**: Use the existing single Next.js App Router project structure and implement favorites by extending selector UI, shared storage utilities, and converter page state orchestration. Keep feature-local changes in `components/`, `utils/`, `types/`, and converter page tests.

## Phase 0: Research Plan

- Resolve UI interaction pattern for "favorite from dropdown" with current native selector architecture.
- Confirm deterministic ordering strategy for favorites-first while preserving stable non-favorite ordering.
- Define resilient localStorage schema and invalid-data recovery behavior.
- Confirm accessibility requirements for favorite controls and status announcements.

## Phase 1: Design Plan

- Produce data model for favorite preference set, selector view state, and storage record.
- Define interface contract(s) for storage payload and selector interaction boundaries.
- Produce quickstart validation flow for manual and automated verification.
- Update agent context using `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`.

## Post-Design Constitution Check

- Code Quality Gate: PASS — design keeps changes modular (selector + storage + page state), strictly typed, and aligned with current architecture.
- Testing Gate: PASS — includes unit/component/page test updates and explicit 80% coverage floor preservation.
- Accessibility Gate: PASS — design specifies keyboard-operable controls, semantic labels/states, and focus/contrast checks for favorite interactions.

## Complexity Tracking

No constitution violations identified; no complexity exceptions are required.
