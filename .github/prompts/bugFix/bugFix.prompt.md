---
name: bugFix
description: Users can select same currency in From and To dropdowns.
---
Fix bug in Page.ts:

Problem: Users can select same currency in From and To dropdowns.

Expected: When selecting a currency equal to the opposite side,
automatically swap the currencies.

Example:
- From: USD, To: EUR
- User changes To to USD
- Result: From becomes EUR, To becomes USD (swapped)

Use this for common bug-fix workflow:
${prompt:bugFixCommon}
