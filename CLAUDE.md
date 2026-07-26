# Phoenix Vapers Commerce Platform — agent guide

Governing document: the **Commerce Platform Specification (Edition 1.0)**
(`Phoenix-Vapers-Commerce-Platform-Specification - Updated.docx`, kept in
`D:\GRAPHIC DESIGN PROJECTS\Phoenix Vapers Resdesign\`). When in doubt,
follow the spec — except where the standing project decisions below override it.

## Standing project decisions (user-mandated, override the spec)

1. **No Docker — ever.** Local services run natively on Windows:
   - Redis 8 via winget portable package `taizod1024.redis-windows-fork`;
     start with `pnpm redis:start`.
   - MongoDB (from Phase 1) via `winget install MongoDB.Server`.
2. **Front-ends are JavaScript (JSX), never TSX.** `apps/web` and
   `apps/admin` use `.js`/`.jsx` files. The NestJS API (`apps/api`) stays
   TypeScript.
3. **Clean, properly commented, scalable code.** Comments explain intent and
   constraints (often citing spec sections like `§16.9`), not mechanics.
4. **Use UI libraries for standard components** (shadcn/ui with `tsx: false`
   for JSX output) — never hand-build buttons/inputs/tables that exist in a
   library; only build what is genuinely custom.
5. **Security first.** Zod validation at every boundary; fail-closed auth;
   timing-safe token compare; global Mongoose `sanitizeFilter` (server-built
   operator clauses need `mongoose.trusted()`); helmet + rate limiting;
   media URLs restricted to https///relative (no javascript:); serializers
   whitelist public fields; secrets server-side only.

## Architecture snapshot

- Turborepo + pnpm workspaces. Apps: `web` (storefront, :3000), `admin`
  (console, :3001), `api` (NestJS modular monolith, :4000, routes under `/v1`).
- Shared packages: `@phoenix/design-system` (Tailwind v4 tokens — the ONLY
  styling source; light+dark themes via `:root`/`.dark`; green text uses the
  theme-aware `pine` role, never phoenix-green on light), `@phoenix/utils`
  (money = integer pence, JSDoc'd JS), `@phoenix/config` (Prettier preset).
- Design: Phoenix Green is #08ab5e (from brand assets in
  `D:\GRAPHIC DESIGN PROJECTS\Phoenix Vapers Resdesign\Assets\`); header/
  footer/admin sidebar stay Ink Green in both themes; NO glassy/translucent
  surfaces; reference aesthetic: zellify.app (pill eyebrows, editorial
  Fraunces headlines, rounded-2xl cards, dark CTA bands). Theme init is a
  server-component ThemeScript per app — do NOT add next-themes (React 19
  errors on client-rendered script tags).
- API: env validated with Zod at boot (`common/config/env.validation.ts`);
  shared ioredis client via `REDIS_CLIENT` token; BullMQ queues declared in
  `common/queues/queues.constants.ts`; one feature module per bounded
  context under `src/modules/`. Mongo connection registers only when
  `MONGODB_URI` is set (required from Phase 1).
- Next.js is v16 — check `node_modules/next/dist/docs/` before assuming
  App Router APIs match training data.

## Compliance rules that shape code

- Requirements marked **[COMPLIANCE]** in the spec are mandatory, fail
  closed, and are never descoped or weakened.
- Money is integer pence with itemised net/duty/VAT breakdown.
- Age-verification gates are enforced server-side, never UI-only.
- The "Deep Pine rule": no phoenix-green text on light backgrounds; use
  `deep-pine` (WCAG 2.2 AA is the floor everywhere).

## Working preferences

- The user runs `pnpm install` / system installers himself when asked to —
  prepare package.json edits, then hand over exact commands (he may also
  tell you to go ahead; then run them).
- Build phases are sequenced in spec §32 (Phase 0 foundations → Phase 10
  launch). Phase 0 (foundations) and Phase 1 (catalogue module with locked
  compliance profile, Mongo-adapter search behind a port, storefront
  Home/PLP/PDP/search, admin catalogue console, seed) are done. Phase 2
  (identity & age verification — customer auth, profiles, addresses,
  consents, mock AV provider, fail-closed verification, audit trail,
  storefront account/verify UX, admin customer queue) is done. Next is
  Phase 3 (cart, checkout, payments & duty).
- Interim operator auth: `ADMIN_API_TOKENS` in apps/api/.env + matching
  tokens in apps/admin/.env.local (X-Admin-Token header).
- Local services: `pnpm redis:start`, `pnpm mongo:start` (portable
  binaries in .local/), `pnpm seed`. Seed customers (password
  `PhoenixDev1`): verified@example.dev, unverified@example.dev,
  inconclusive@example.dev, locked@example.dev. Mock AV: set
  `AV_FAULT_MODE=outage` in api/.env to exercise fail-closed paths.
