# Mini ERP — frontend (my-next-app)

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (`@supabase/ssr`) · Montserrat.

## Run

```bash
npm install
cp .env.example .env.local      # fill in the 3 variables (local Supabase: run `supabase status`)
npm run dev                     # http://localhost:3000
```

Without `.env.local` the app shows a setup page instead of crashing.
`npm run build` and `npm run typecheck` must pass before any phase is considered done.

## Status

Phase 2 (Foundation) is done. Modules are placeholders until their phase. See `docs/FRONTEND_NOTES.md`
for what exists, what is verified, and the backend constraints that shape later phases.

Developer-only component preview: `/dev/ui-kit` (development mode only; 404 in production; not linked in the app).

## Structure

```
src/app/            routes ((app) = authenticated shell, login, select-tenant, api/tenant/switch, auth/signout)
src/components/ui/  reusable UI kit (button, form, table, dialog/drawer, toast, charts, states, ...)
src/components/shell/  sidebar, header, breadcrumbs, command search, app shell
src/features/       feature code by module (tenant switching; module placeholders)
src/lib/            supabase clients, session/tenant context, i18n (en/ar), formatting, Egypt helpers, nav config
src/types/database.ts   row types for the 74 tables (generated from the migrations)
```

## Rules this codebase follows

- Browser code uses the anon key only; every query is subject to RLS. The service-role key lives only in
  `src/lib/supabase/admin.ts` (guarded by `server-only`) and is used by server routes after verifying the caller.
- UI hiding is convenience; the database is the authority.
- Select explicit columns — some columns (costs, invitation tokens) are not readable from the browser.
- All user-facing text goes through `src/lib/i18n` (English + Arabic). Layout uses logical properties (`ms-`, `ps-`, `start-`…) so RTL works.
