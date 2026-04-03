# Shadi Bazaar – Project Structure

This React app is the new frontend for the Shadi Bazaar wedding marketplace. The Laravel backend (APIs) lives in `../shadi-bazaar-v2` and is consumed via `VITE_API_BASE_URL`.

## Scripts

- `npm run dev` – Start Vite dev server
- `npm run build` – Production build
- `npm run lint` – Run ESLint
- `npm run lint:fix` – ESLint with auto-fix
- `npm run typecheck` – TypeScript check (no emit)
- `npm run validate` – typecheck + lint (e.g. for CI)

## Folder structure

- **`src/app/`** – App shell: routes, layouts, pages, app-specific components, mock data
- **`src/core/`** – Constants and API client (shared, non-UI)
  - `constants.ts` – App name, tagline, `ROUTES`, `API_BASE_URL`
  - `api/client.ts` – Base API request helpers, Bearer token (Passport), `apiRequest` / `apiData`
  - `api/types.ts` – Laravel API response types (`ApiResponse<T>`, `isApiSuccess`)
  - `api/services/` – Typed services: **auth**, **meta** (categories, cities, conditions, itemTypes), **posts**, **feed**, **favourites**
- **`API_COMPATIBILITY.md`** – Laravel v2 API ↔ React mapping and compatible endpoints
- **`src/shared/components/`** – Reusable UI building blocks
  - `PageContainer`, `SearchBox` – use in any page
- **`src/app/components/ui/`** – Low-level UI primitives (buttons, inputs, etc.)

## Environment

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your Laravel API base (e.g. `http://localhost:8000/api/v1`).

## Git hooks (Husky)

- **pre-commit**: runs `lint-staged` (ESLint --fix on staged `.ts`/`.tsx`) and `npm run typecheck`.
