# Phoenix Vapers — Commerce Platform

Compliance-first commerce platform for Phoenix Vapers Limited, built to the
**Commerce Platform Specification (Edition 1.0)**. A Turborepo + pnpm
monorepo: Next.js storefront and admin console, NestJS modular-monolith API,
MongoDB, and Redis-backed background jobs (BullMQ).

> **Project decisions that intentionally deviate from the spec document:**
> 1. **No Docker.** All local services (Redis, MongoDB) run natively on
>    Windows. The spec's docker-compose stack is not used.
> 2. **Front-ends are JavaScript (JSX), not TypeScript.** `apps/web` and
>    `apps/admin` use `.js`/`.jsx`. The NestJS API remains TypeScript.

## Layout

```
phoenix-platform/
├─ apps/
│  ├─ web/         # Next.js storefront (customer PWA)      → :3000
│  ├─ admin/       # Next.js admin & operations console     → :3001
│  └─ api/         # NestJS modular-monolith backend        → :4000
├─ packages/
│  ├─ design-system/   # Phoenix tokens — the only styling source
│  ├─ utils/           # Shared helpers (money in integer pence, …)
│  └─ config/          # Shared tooling presets (Prettier, …)
└─ scripts/            # Local dev helpers (start-redis.ps1)
```

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 20 | nodejs.org |
| pnpm | 11 | `npm install -g pnpm` |
| Redis (Windows) | 8.x | `winget install taizod1024.redis-windows-fork --scope user` |
| MongoDB | 8.x | `winget install MongoDB.Server` (admin shell) — required from Phase 1 |

## Getting started

```powershell
pnpm install          # install every workspace
pnpm redis:start      # start local Redis if not already running
pnpm dev              # all three apps in watch mode via Turborepo
```

Or individually: `pnpm dev:web`, `pnpm dev:admin`, `pnpm dev:api`.

The API validates its environment at boot and refuses to start if
configuration is malformed. Copy `apps/api/.env.example` to `apps/api/.env`
for local defaults. Secrets never live in the repository.

### Verify the stack

```powershell
curl http://localhost:4000/v1/health           # liveness + Redis status
curl -X POST http://localhost:4000/v1/health/queue   # push a BullMQ heartbeat job
```

`GET /v1/health` then reports `services.lastQueueHeartbeat` — proof the
queue worker is processing.

## Conventions (spec §16.10)

- **Money is integer pence.** Never floats — use `@phoenix/utils/money`.
- **One styling source.** Apps import tokens from `@phoenix/design-system`;
  no app defines its own colours or type scale. Green text on light
  backgrounds uses `deep-pine`, never `phoenix-green` (the Deep Pine rule).
- **Bounded contexts.** API feature modules live in `apps/api/src/modules/`,
  one per domain; no module touches another module's collections.
- **[COMPLIANCE] requirements fail closed** and are never descoped.
- Conventional Commits; kebab-case files; PascalCase components/classes.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` / `build` / `lint` / `test` | Run across all workspaces via Turborepo |
| `pnpm redis:start` | Start local Redis (no-op if already running) |
| `pnpm format` | Prettier over the whole repo |
