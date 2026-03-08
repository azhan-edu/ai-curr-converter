# AI Currency Converter

![CI](https://github.com/azhan-edu/ai-curr-converter/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Lint](https://img.shields.io/badge/lint-passing-brightgreen)
![Unit Tests](https://img.shields.io/badge/unit%20tests-passing-brightgreen)
![E2E Tests](https://img.shields.io/badge/e2e-passing-brightgreen)
![Status](https://img.shields.io/badge/status-active-success)
![License: ISC](https://img.shields.io/badge/license-ISC-lightgrey)

A modern currency converter built with Next.js App Router, TypeScript, and Tailwind CSS.

The app converts amounts between major currencies, supports manual refresh of exchange rates, handles provider failures with safe fallback behavior, and stores recent conversions with a Prisma-backed history API.

## Features

- Real-time currency conversion with selectable source/target currencies.
- Exchange-rate refresh flow with success/error notifications.
- Fallback rate handling when external providers are unavailable.
- Conversion history persistence (list, create, clear) via API routes.
- Input and payload validation with Zod.
- Unit/integration tests (Jest + Testing Library) and end-to-end coverage (Playwright).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Validation:** Zod
- **Database/ORM:** SQLite + Prisma
- **Testing:** Jest, React Testing Library, MSW, Playwright

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env` in the project root:

```env
DATABASE_URL="file:./dev.db"
```

### 3) Run Prisma migrations

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 4) Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

- `npm run dev` — Start local development server.
- `npm run build` — Build production bundle.
- `npm run start` — Run production server.
- `npm run typecheck` — Run TypeScript checks.
- `npm run lint` — Run ESLint.
- `npm run test` — Run Jest tests.
- `npm run e2e` — Run Playwright end-to-end tests.
- `npm run e2e:ui` — Run Playwright in UI mode.
- `npm run prisma:migrate` — Apply Prisma migrations.
- `npm run prisma:generate` — Generate Prisma client.
- `npm run prisma:studio` — Open Prisma Studio.

## API Endpoints

- `GET /api/rates` — Fetch normalized exchange rates (cached).
- `GET /api/rates?refresh=1` — Force refresh rates.
- `POST /api/rates` — Manually update cached rates (dev/test utility).
- `GET /api/conversions?limit=10` — List recent conversion history.
- `POST /api/conversions` — Create a conversion history entry.
- `DELETE /api/conversions` — Clear conversion history.

## Testing

```bash
npm run lint
npm run test
npm run e2e
```

## Project Structure

- `app/` — App Router pages and API route handlers.
- `components/` — Reusable UI components.
- `hooks/` — Client-side behavior and converter state logic.
- `lib/` — Data access and Prisma-backed repository logic.
- `utils/` — Pure utilities for currency math, storage, and validation.
- `types/` — Shared TypeScript types.
- `prisma/` — Prisma schema and migrations.

## Notes

- Exchange rates are cached for 1 hour by default (`RATES_CACHE_TTL_SECONDS` to override).
- If the rates provider is unavailable, the app returns validated fallback rates.
