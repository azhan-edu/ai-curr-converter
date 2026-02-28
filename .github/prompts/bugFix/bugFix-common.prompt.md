---
name: bugFixCommon
description: Advanced, test-first bug-fixing workflow for Next.js + TypeScript + Tailwind project.
---

# Advanced Bug-Fix Task Prompt (Next.js App Router)

You are fixing a bug in this repository.  
Follow all project instructions in `.github/copilot-instructions.md`, Next.js best practices, and existing architecture conventions.

## 0) Scope and Context Rules (Mandatory)

- Use only application source context:
  - `/app`, `/components`, `/hooks`, `/utils`, `/types`, `/styles`, `/services`
- Ignore generated/tooling folders and irrelevant files:
  - `docs/`, `.next/`, `.vscode/`, `.git/`, `node_modules/`, `coverage/`, `dist/`, `build/`, `.turbo/`, `.cache/`, `out/`
  - lock files, `.env*`, logs, compiled outputs
- Do not modify configuration files unless explicitly required by the bug.
- Do not introduce broad refactors unless necessary for the fix.

---

## 1) Session Startup Output (Always)

Start with:

1. **Bug summary** (what is failing, expected vs actual).
2. **Classification**:
   - Server Component / Client Component / Route Handler / Utility
3. **Assumptions and unknowns**.
4. **TODO checklist** grouped by:
   - **Code changes**
   - **Tests**
   - **Validation**

Use status markers and keep them updated:
- `[ ]` pending
- `[-]` in progress
- `[x]` completed

---

## 2) Reproduce and Isolate

1. Identify exact reproduction steps.
2. Locate failing module(s) and data flow.
3. Add or run a failing test that reproduces the bug before changing logic.
4. Confirm whether issue is:
   - logic bug
   - type/runtime validation gap
   - server/client boundary misuse
   - async/caching issue
   - UI state/accessibility regression

---

## 3) Root Cause Analysis

Provide:

- **Root cause statement** (single clear sentence).
- **Why it happened** (code path + condition).
- **Impact scope** (what features/components are affected).
- **Risk assessment** (low/medium/high).

---

## 4) Fix Implementation Rules

- Keep fix minimal and targeted.
- Preserve App Router boundaries:
  - Server Components by default
  - `'use client'` only where required
  - no `next/dynamic(..., { ssr: false })` in Server Components
- Validate external/untrusted data (use `zod` where applicable).
- Maintain strict TypeScript (no `any` unless justified).
- Keep UI accessible and semantic.
- Ensure loading/error/empty states remain correct.
- Avoid silent catches; return actionable errors.

---

## 5) Unit Test Workflow (Required After Every Fix)

## 5.1 Create/Update Tests

- Add or update co-located tests:
  - `Component.tsx` → `Component.test.tsx`
  - `route.ts` → `route.test.ts`
  - utility modules → `*.test.ts`
- Include at minimum:
  1. **Regression test** reproducing original bug (fails before fix, passes after).
  2. **Happy path** behavior.
  3. **Edge case(s)** related to fix.
  4. **Error path** handling.

## 5.2 Test Quality Rules

- Prefer behavior-based assertions (not implementation details).
- Use RTL queries by role/label/text for components.
- Mock network with MSW where applicable.
- Mock browser APIs (`localStorage`, URL APIs) only when required.
- Keep tests deterministic (avoid locale/time flakiness unless controlled).

## 5.3 Coverage Check

- Ensure touched file(s) have meaningful coverage and no untested new branches.
- If coverage is low, add focused tests for uncovered fix paths.

---

## 6) Validation and Verification

After implementing fix + tests:

1. Run targeted tests for changed modules.
2. Run broader related suite to check regressions.
3. Verify TypeScript/lint constraints.
4. Confirm no server/client boundary violations.
5. Re-test bug reproduction steps manually if UI/API behavior changed.

---

## 7) Output Format (Required)

Return in this order:

1. **Plan** (short)
2. **Updated TODO checklist** (with statuses)
3. **File-by-file changes**
4. **Tests added/updated**
5. **Verification results**
6. **Change log** for each edit:
   - What changed
   - Why
   - Risk level
   - Follow-up needed

---

## 8) Completion Gate

Do not mark done until all are true:

- [x] Bug reproduced and root cause identified
- [x] Minimal fix implemented
- [x] Regression test added/updated
- [x] Related unit tests updated
- [x] Edge and error paths covered
- [x] Validation checks passed
- [x] No architecture/boundary violations
- [x] Clear change log provided