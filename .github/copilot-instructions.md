# Copilot Custom Instructions — ai-curr-converter

> Project: **Next.js (App Router) + TypeScript + Tailwind CSS** currency converter  
> Scope: Applies to all generated/modified code and tests in this repository.

---

## 1) Operating Rules for Every Coding Session

### 1.1 Session Startup Checklist
Before making changes, Copilot should:

1. Read relevant files in the target feature area.
2. Identify whether code belongs to:
   - Server Component
   - Client Component
   - Route Handler (`app/api/**/route.ts`)
   - Shared utility (`lib/`, `utils/`, `types/`)
3. Create a concise TODO list grouped by:
   - **Code changes**
   - **Tests**
   - **Validation/verification**
4. Call out assumptions and unknowns explicitly.

### 1.2 TODO / Progress Tracking Standard
For multi-step tasks, maintain a running checklist in responses:

- `[ ]` pending
- `[-]` in progress
- `[x]` completed

Always update status after each meaningful step.  
Do not mark complete until tests are added/updated and edge cases are addressed.

### 1.3 Change Logging
For each code edit, provide a brief structured log:

- **What changed**
- **Why**
- **Risk level** (low/medium/high)
- **Follow-up needed** (if any)

Prefer small, atomic edits over broad rewrites.

---

## 2) Architecture & Code Design Rules

## 2.1 Next.js App Router Boundaries
- Use **Server Components by default**.
- Add `'use client'` only when interactivity/browser APIs/hooks are required.
- Never use `next/dynamic(..., { ssr: false })` inside Server Components.
- Do not call internal Route Handlers from Server Components for shared logic.
  - Extract logic to `lib/` or `utils/` and reuse directly.
- Route handlers must validate inputs and return typed, consistent JSON errors.

## 2.2 Folder & Module Conventions
- Keep route-specific UI near route folder under `app/`.
- Shared UI in `components/`.
- Shared business logic in `utils/` or `lib/`.
- Types in `types/`.
- Avoid creating example/demo files unless explicitly requested.

## 2.3 Component Patterns
- Build small, composable components (single responsibility).
- Prefer explicit prop interfaces.
- Keep presentational components stateless when possible.
- Use semantic HTML and accessible controls/labels.
- Use clear loading/empty/error UI states.

## 2.4 Hooks & State Management
- Prefer local state for local UI concerns.
- Extract repeated client logic into custom hooks (e.g., conversion form handling).
- Avoid prop-drilling by lifting state only as needed.
- For server state, prefer Server Components and cached fetching patterns.
- Implement optimistic UI only when it improves UX and can recover safely.

## 2.5 TypeScript Standards
- Strict typing; no `any` unless unavoidable (and justified with comment).
- Use discriminated unions for state machines (idle/loading/success/error).
- Parse and validate external data with `zod`.
- Use type guards for error narrowing.

---

## 3) Currency Converter Domain Rules

## 3.1 Data & Conversion
- Treat external API responses as untrusted; validate shape.
- Support fallback rate providers in deterministic order.
- Use stable decimal handling and display rounding rules.
- Keep conversion logic pure and testable (no DOM/network side effects).

## 3.2 Caching & Revalidation
- Cache rates for 1 hour where applicable.
- Use modern Next.js caching patterns when available.
- Ensure cache invalidation strategy is explicit and documented in code comments.

## 3.3 URL & History Behavior
- Persist user selections in query params.
- Keep conversion history capped at last 10 entries.
- Validate and sanitize query values before use.
- Storage operations must fail gracefully (SSR/client boundary-safe).

---

## 4) Error Handling & Resilience

- Validate all user inputs with clear field-level messages.
- Handle timeout/network/SSL/provider errors distinctly.
- Surface friendly messages in UI; avoid leaking internal stack traces.
- Use defensive defaults when one provider fails (fallback chain).
- Every async path must include loading + error handling.

---

## 5) Testing Conventions (Jest + RTL + MSW)

## 5.1 Test Scope Requirements
Add/update tests whenever behavior changes:

1. **Unit tests** for pure utilities (`utils/`, conversion math, storage helpers).
2. **Component tests** for UI states and user interactions.
3. **API route tests** for success/failure/fallback and validation.
4. Regression tests for bug fixes.

## 5.2 Test Organization
- Co-locate tests with source files:
  - `Component.tsx` + `Component.test.tsx`
  - `route.ts` + `route.test.ts`
- Use descriptive `describe/it` blocks with behavior-focused names.

## 5.3 Mocking Strategy
- Use **MSW** for network behavior.
- Mock browser-only APIs (`localStorage`, `URLSearchParams` interactions) as needed.
- Avoid brittle implementation-detail assertions.

## 5.4 Minimum Assertions for Critical Flows
For conversion flow tests, assert:
- Validation errors appear for invalid input.
- Loading state appears during async conversion.
- Result and rate render correctly on success.
- Provider fallback path works when primary source fails.
- History add/reload/clear behavior works and respects cap=10.

---

## 6) Critical Gotchas (Must Not Miss)

1. **Server vs Client boundaries**
   - Never use hooks in Server Components.
   - Never access `window/localStorage` on server.

2. **Async request APIs in modern Next.js**
   - Treat request-bound APIs carefully; avoid accidental dynamic rendering.

3. **Do not trust external rate APIs**
   - Validate response shape and numeric ranges.

4. **Floating-point precision**
   - Use controlled formatting/rounding strategy; test edge values.

5. **Query params as input**
   - Parse/validate before use; protect against malformed values.

6. **Tailwind consistency**
   - Keep class usage readable; avoid random one-off styling patterns.

7. **Accessibility**
   - Inputs require labels, error messaging should be screen-reader friendly.
   - Buttons/selects must be keyboard accessible.

8. **No silent failures**
   - All catch blocks should either recover with fallback or return actionable error.

---

## 7) Response Format for Copilot in This Repo

When proposing code:
1. Start with a short plan.
2. Provide file-by-file edits.
3. Include tests in same response.
4. End with a brief verification checklist:
   - Typecheck
   - Lint
   - Tests

When uncertain, ask a focused clarifying question before large refactors.

---

## 8) Quality Gate Before Marking Task Done

Only consider a task complete when all are true:

- [x] Requirements implemented
- [x] Types are strict and clean
- [x] Error states handled
- [x] Tests added/updated and meaningful
- [x] No server/client boundary violations
- [x] No unnecessary files introduced
- [x] Changes logged with rationale

# 0. CODE ANALYSIS & CONTEXT RESTRICTIONS (CRITICAL)

When analyzing the repository or generating code, GitHub Copilot MUST ignore
the following directories and files completely.

These folders are considered generated, build, tooling, or irrelevant to
application logic and must NEVER be used as context for:

- Code analysis
- Architecture decisions
- Refactoring suggestions
- Dependency inference
- Business logic generation
- Import suggestions

## ❌ Forbidden Folders

Copilot must ignore:

- `logs/`
- `docs/`
- `.next/`
- `.vscode/`
- `.git/`
- `node_modules/`
- `coverage/`
- `dist/`
- `build/`
- `.turbo/`
- `.cache/`
- `out/`

## ❌ Forbidden Files

- Lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`)
- Auto-generated type definitions
- Compiled JavaScript files
- Environment files (`.env*`)
- Log files

## ❌ Forbidden Behaviors

- Do NOT read compiled output inside `.next`
- Do NOT analyze bundled or transpiled files
- Do NOT infer architecture from generated files
- Do NOT modify configuration files unless explicitly requested
- Do NOT use hidden IDE metadata (e.g., `.vscode/settings.json`)

## ✅ Allowed Context

Copilot may only use:

- `/app`
- `/components`
- `/hooks`
- `/utils`
- `/types`
- `/styles`
- `/services`
- Explicit configuration files (next.config.js, tsconfig.json) when necessary

## Rationale

Generated folders often contain compiled artifacts that:
- Mislead static analysis
- Introduce duplicate code
- Break type assumptions
- Cause incorrect import paths
- Lead to invalid refactoring

Copilot must treat them as non-existent.

Failure to follow this rule may result in incorrect architecture decisions.