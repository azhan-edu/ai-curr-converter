<!--
Sync Impact Report
- Version change: 0.0.0 → 1.0.0
- List of modified principles:
	- Template Principle 1 → I. Code Quality Is Mandatory
	- Template Principle 2 → II. Testing Standard and Coverage Floor (80%)
	- Template Principle 3 → III. Accessibility Compliance (WCAG 2.1 AA)
- Added sections:
	- Quality Enforcement Rules
	- Workflow and Review Requirements
- Removed sections:
	- Template Principle 4
	- Template Principle 5
- Templates requiring updates:
	- ✅ updated: .specify/templates/plan-template.md
	- ✅ updated: .specify/templates/spec-template.md
	- ✅ updated: .specify/templates/tasks-template.md
	- ⚠ pending: .specify/templates/commands/*.md (directory not present)
- Follow-up TODOs:
	- None
-->

# AI Currency Converter Constitution

## Core Principles

### I. Code Quality Is Mandatory
All production changes MUST be strictly typed, readable, and maintainable.
Code MUST follow existing architecture and style patterns, and changes MUST
remain minimal and reversible. Lint and type checks MUST pass before merge.
Use of type escapes (such as broad `any`) MUST be explicitly justified.
Rationale: High code quality lowers defect rate and preserves long-term
development velocity.

### II. Testing Standard and Coverage Floor (80%)
All behavior-changing work MUST include automated tests at appropriate levels
(unit/component/integration/route). Bug fixes MUST include regression tests.
Repository line coverage MUST stay at or above 80%, and no change may reduce
coverage below that floor.
Rationale: A clear coverage threshold and required tests are essential for safe
refactoring and release confidence.

### III. Accessibility Compliance (WCAG 2.1 AA)
All user-facing UI changes MUST satisfy WCAG 2.1 AA requirements, including
keyboard operability, semantic structure, focus visibility, color contrast,
and understandable error states. Accessibility expectations apply to both
desktop and mobile experiences.
Rationale: Accessibility is a baseline quality requirement and part of core
product usability.

## Quality Enforcement Rules

- Every plan MUST include explicit constitution checks for code quality,
	testing coverage, and accessibility.
- Every implementation MUST include verification steps for lint, typecheck,
	tests, and relevant accessibility checks.
- Pull requests MUST fail constitutional review when any of these gates are not
	satisfied.

## Workflow and Review Requirements

- Specifications MUST define independently testable user stories and measurable
	outcomes.
- Task breakdowns MUST include mandatory testing work and coverage validation.
- Review MUST explicitly confirm adherence to code quality standards, 80%
	coverage minimum, and WCAG 2.1 AA obligations for affected UI.

## Governance

This constitution supersedes informal project practices.
Amendments require: documented rationale, semantic version decision,
synchronization across affected templates, and migration notes when workflow
expectations change. Compliance checks are required during planning, tasking,
implementation, and review.

Versioning policy:
- MAJOR: incompatible governance or principle removals/redefinitions.
- MINOR: new principle/section or materially expanded obligations.
- PATCH: wording clarifications and non-semantic refinements.

**Version**: 1.0.0 | **Ratified**: 2026-02-28 | **Last Amended**: 2026-02-28
