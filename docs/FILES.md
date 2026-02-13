# File Reference – Production & Self-Hosting

Quick reference of files relevant for production deployment and the AIO (all-in-one) stack.

## Compose & Infrastructure

| File | Purpose |
|------|---------|
| `compose.dev.yml` | Dev stack: hot reload, postgres, web (3000), server (4000). No SSL. |
| `infra/compose/compose.noproxy.yml` | Production without proxy: exposes ports. Use with external proxy (Dokploy, Coolify, Caddy). |
| `infra/compose/compose.aio.yml` | Production with embedded Caddy: SSL (self-signed or Let's Encrypt), proxy, migrations. |
| `infra/compose/Dockerfile.migrate` | One-off migration runner (used by compose.aio). |
| `infra/compose/caddy/Dockerfile` | Caddy image with dynamic Caddyfile entrypoint. |
| `infra/compose/caddy/entrypoint.sh` | Generates Caddyfile from `APP_DOMAIN`, `API_DOMAIN`, `TLS_SELF_SIGNED`. |

## Environment & Config

| File | Purpose |
|------|---------|
| `apps/server/.env.example` | Template for `.env`. Contains dev defaults and AIO block (APP_DOMAIN, API_DOMAIN, TLS_SELF_SIGNED). |
| `.env` | Runtime config (not committed). Copy from `apps/server/.env.example`. |

## Deployment Docs

| File | Purpose |
|------|---------|
| `docs/DEPLOY_AIO.md` | AIO: Caddy + SSL, self-signed or Let's Encrypt, domain configurable. |
| `docs/DEPLOY_SELFHOST.md` | Manual VPS: Docker CE, external proxy (Caddy/Nginx), env vars. |
| `docs/DEPLOY_DOKPLOY.md` | Dokploy one-click deploy. |
| `docs/DEPLOY_COOLIFY.md` | Coolify one-click deploy. |
| `docs/ARCHITECTURE.md` | Multi-tenant model, auth, billing, compose layout. |
| `docs/FILES.md` | This file – file reference. |

## Scripts

| File | Purpose |
|------|---------|
| `scripts/install.sh` | Self-host installer: `./scripts/install.sh noproxy` or `aio`. Creates `.env` from example if missing. |

## App Build (Production)

| File | Purpose |
|------|---------|
| `apps/server/Dockerfile` | API server image. |
| `apps/web/Dockerfile` | Next.js image. Accepts `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL` as build args. |

## Production Checklist

| File | Purpose |
|------|---------|
| `apps/web/app/[locale]/docs/page.tsx` | Production checklist UI and item ids. |
| `apps/web/messages/en.json` | Checklist translations (under `docsPage.checklist`). |
| `apps/web/messages/es.json` | Same in Spanish. |
