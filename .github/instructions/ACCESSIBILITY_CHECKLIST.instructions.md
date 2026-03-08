# Accessibility Testing Checklist (WCAG 2.1 AA)

Use this checklist before merging UI changes and before release.

## 1) Keyboard Navigation

- [ ] `Tab` reaches all interactive elements in logical order.
- [ ] `Shift+Tab` reverses correctly without traps.
- [ ] All interactive elements are operable with keyboard only.
- [ ] Visible focus indicator appears on all controls (buttons, links, inputs, selects, summary/details).
- [ ] Skip link is visible on keyboard focus and moves focus to main content.
- [ ] No keyboard trap exists in any panel or control.

## 2) Screen Reader Support

- [ ] Page has one clear `h1` describing the page purpose.
- [ ] Main content is wrapped in a `main` landmark.
- [ ] Form controls have programmatically associated labels.
- [ ] Dynamic status updates use live regions (`role="status"` with polite announcements).
- [ ] Error messages are announced (`role="alert"` where appropriate).
- [ ] Error text is associated to fields via `aria-describedby` and `aria-invalid`.
- [ ] Icon-only controls (e.g., swap button) have an accessible name (`aria-label`).

## 3) Color and Contrast

- [ ] Normal text contrast is at least 4.5:1.
- [ ] Large text contrast is at least 3:1.
- [ ] Button text and status text pass contrast checks in normal, hover, and disabled states.
- [ ] Information is not conveyed by color alone.
- [ ] Focus outlines are visible against surrounding backgrounds.

## 4) Forms and Validation

- [ ] Amount input has clear label, expected format, and constraints.
- [ ] Validation messages are specific and actionable.
- [ ] Invalid fields expose `aria-invalid="true"`.
- [ ] Validation messages are linked to fields by `aria-describedby`.
- [ ] Required fields (if any) are indicated both visually and programmatically.
- [ ] Form can be completed and submitted with keyboard only.

## 5) Structure and Semantics

- [ ] Lists use semantic list markup (`ul/ol/li`) or valid equivalent roles.
- [ ] Tabular rates data uses a semantic `table` with headers.
- [ ] Time values use semantic `<time>` with valid `dateTime` when possible.
- [ ] Heading hierarchy is logical (no skipped levels without reason).

## 6) Responsive and Zoom

- [ ] UI is usable at 320px width without horizontal content loss for core flow.
- [ ] UI remains usable at 200% browser zoom.
- [ ] Text spacing adjustments (line/letter/word spacing) do not break core interactions.

## 7) Motion and Timing

- [ ] Loading indicators do not flash or create seizure risk.
- [ ] No content auto-refreshes or redirects unexpectedly.
- [ ] Time-sensitive interactions (if any) provide user control/extension.

## 8) Automated Checks

- [ ] Run Lighthouse Accessibility audit and review only Failed/Needs Improvement items.
- [ ] Run axe checks in browser/devtools or Playwright axe integration.
- [ ] Run unit/integration tests covering keyboard and a11y semantics.
- [ ] Re-run lint and confirm no new a11y regressions.

## 9) Manual Test Scenarios (Currency Converter)

- [ ] Convert amount using keyboard only (input, from/to selects, swap, refresh).
- [ ] Trigger invalid amount and confirm field + page-level error announcements.
- [ ] Refresh rates and confirm success/failure announcements are spoken once.
- [ ] Navigate to conversion history and activate reload/clear with keyboard.
- [ ] Verify skip link jumps to converter main content and focus lands correctly.

## 10) Sign-off

- [ ] Accessibility checks completed for this PR.
- [ ] Known issues documented with impact and remediation plan.
- [ ] Reviewer verified no new WCAG 2.1 AA regressions.
