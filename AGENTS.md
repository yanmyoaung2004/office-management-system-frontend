# AGENTS.md — STI Office Management System (frontend)

Next.js 16.1.6 · React 19 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui (new-york)

## Commands

| Purpose | Command |
|---|---|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Production start | `npm run start` |
| Lint | `npm run lint` |
| Typecheck | `npx tsc --noEmit` |

No test framework is configured.

## Architecture

- **App Router** with department-based route groups: `admission/`, `exam/`, `finance/`, `operation/`, `users/`, `share/[token]`
- **Auth**: `AuthContext` stores session in `localStorage` key `auth_token`. Session validated on mount via `POST /auth/validate`. Token auto-attached in `api-client.ts`.
- **API client**: `lib/api-client.ts` exports `apiGet`/`apiPost`/`apiPut`/`apiPatch`/`apiDelete` + `swrFetcher`. Base URL from `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000/api`). Errors surfaced via `sonner` toast.
- **Data fetching**: SWR via `SwrProvider` in root layout; `shouldRetryOnError: false`.
- **Route guards**: Each department layout wraps in `<PermissionGuard>`. Unknown routes redirect to `/dashboard` via `proxy.ts` middleware.
- **Navigation**: `components/navigation.tsx` — department-based tab bar, role/permission-filtered. Hidden on `/login`.
- **Imports**: `@/*` maps to project root.
- **Shared entity types**: `types/entities/*.ts` — split by domain (teacher, student, major, intake, exam, user, finance, notification). Re-exported via `types/index.ts`.
- **Form infrastructure**: `components/entity-form.tsx` (generic `EntityFormDialog<T>` with react-hook-form + zod + shadcn Dialog), `components/entity-list.tsx` (generic `EntityList<T>` with shadcn Table + search + sort + pagination + skeleton), `components/entity-page.tsx` (page template combining list + form + delete). Per-entity schemas in `schemas/*.ts`, form configs in `form-configs/*.ts`.
- **Semantic CSS tokens**: `--success`, `--warning`, `--info` available in `globals.css` with light/dark variants alongside existing primary/accent/destructive tokens.
- **Spacing scale**: `--space-xs` through `--space-2xl` defined as CSS vars (4/8/16/24/32/48px).

## Docker

- `next.config.ts` sets `output: "standalone"`
- Multi-stage Dockerfile; pass `NEXT_PUBLIC_API_BASE_URL` as build arg
- `docker compose up --build` or `docker build --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api -t next-app .`

## Notable

- CSS uses Tailwind v4 (`@import "tailwindcss"`) with oklch custom properties in `globals.css`. No `tailwind.config`, the `@theme inline` directive replaces it.
- shadcn components live under `components/ui/`; register new ones with `npx shadcn@latest add <component>`.
- Document generation libs: `docx`, `pdfkit`, `exceljs`, `xlsx`. Sample output files in `sample/`.
- `.env` is committed — contains `NEXT_PUBLIC_API_BASE_URL` and `NODE_ENV=production`.
- `app/time-table.tsx` is a standalone prototype (genetic algorithm scheduler), imported only by `app/exam/page.tsx`.
- Lint config: `eslint.config.mjs` uses `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`; ignores `.next/`, `out/`, `build/`, `next-env.d.ts`.
- **Migrated entities**: Teacher (exam), User (users), Major (admission), Enquiry (admission), Exam schedule (exam), Finance intake (exam/finance). Each uses EntityList/EntityFormDialog pattern with schema/form-config files.
- **Deprecated/removed**: `confirmation-popup.tsx`, `report-management.tsx`, `notice-word.ts`, `test.ts` deleted (all dead code / unused). `pagination.tsx` still referenced by `intake-detail.tsx`, `inquiry-management.tsx`, and `exam/[id]/page.tsx`.
