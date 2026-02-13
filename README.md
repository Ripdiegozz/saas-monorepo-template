# Multi-Tenant Booking SaaS Template

Self-hosted multi-tenant booking SaaS template (Dokploy / Coolify / Docker CE). Includes auth (Better Auth + organization), billing (Polar), booking with slot conflict detection, and realtime (SSE).

## Stack

- **UI**: Next.js 16 (App Router)
- **API**: Hono + TypeScript + Clean Architecture
- **DB**: Drizzle ORM + PostgreSQL
- **Auth**: Better Auth (multi-tenant organization)
- **Billing**: Polar.sh + Better Auth plugin (Free / Pro / Enterprise)
- **API Docs**: OpenAPI + Scalar

## Local Development

### With Docker (recommended)

```bash
# Start UI (:3000), API (:4000) and Postgres (:5432) with hot reload
docker compose -f compose.dev.yml up

# First run: apply migrations (in another terminal)
docker compose -f compose.dev.yml exec server pnpm --filter @workspace/db db:push
```

### Without Docker

```bash
# 1. Postgres
docker compose -f infra/compose/postgres.yml up -d

# 2. Migrations
pnpm --filter @workspace/db db:migrate

# 3. Services
pnpm dev
```

## Production & Self-Hosting

- **[PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md)** – Pre-launch checklist (also available at `/docs` in the app)
- **[DEPLOY_AIO.md](docs/DEPLOY_AIO.md)** – All-in-one: Caddy + SSL (self-signed or Let's Encrypt), domain configurable
- **[DEPLOY_SELFHOST.md](docs/DEPLOY_SELFHOST.md)** – Docker CE on VPS, env vars, external proxy (Caddy/Nginx)
- **[FILES.md](docs/FILES.md)** – File reference for production and AIO
- **[DEPLOY_DOKPLOY.md](docs/DEPLOY_DOKPLOY.md)** – One-click deploy with Dokploy
- **[DEPLOY_COOLIFY.md](docs/DEPLOY_COOLIFY.md)** – One-click deploy with Coolify
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** – Multi-tenant model, auth flows, SSE

## AIO Script

```bash
./scripts/install.sh noproxy   # UI + API + Postgres
./scripts/install.sh aio       # With Caddy proxy and SSL (self-signed or Let's Encrypt)
```

## Monorepo Structure

```
apps/
  web/          # Next.js (tenant pages: /tenant/[slug]/dashboard, /tenant/[slug]/services)
  server/       # Hono API (auth, booking, billing, SSE)
packages/
  db/           # Drizzle schema, migrations, client
  ui/           # shadcn components
infra/
  compose/      # compose.dev, postgres, noproxy, aio
```

## API

- **OpenAPI doc**: `GET /doc`
- **Scalar UI**: `GET /scalar`
- **Health**: `GET /api/health`
