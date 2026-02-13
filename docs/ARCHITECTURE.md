# Architecture

## Multi-tenant

Tenant is modeled with Better Auth **organization**. Each organization has:

- `id` (UUID)
- `slug` (unique, used in URLs: `/tenant/[slug]`)
- `name`, `logo`, `metadata`

Business tables (`service`, `appointment`, `subscription`) filter by `organizationId`.

## Auth (Better Auth)

- **Core**: user, session, account, verification
- **Organization plugin**: organization, member, invitation
- Routes: `POST/GET /auth/*` delegated to Better Auth handler
- `trustedOrigins` for CORS with the frontend
- `activeOrganizationId` in session for current context

## API (Hono + Clean Architecture)

```
Presentation (Hono routes)
    ↓
Application (Use cases)
    ↓
Domain (Entities, errors)
    ↑
Infrastructure (Drizzle repositories)
```

- **Features**: auth, organization, booking, billing, realtime
- **Documented routes**: OpenAPI at `/doc`, Scalar at `/scalar`
- **Tenant**: `x-organization-id` header on requests

## Realtime (SSE)

`GET /api/realtime` – SSE stream with heartbeats. The frontend can subscribe to refresh lists (bookings, calendar).

## Billing (Polar)

- **Checkout**: `GET /api/billing/checkout?products=...`
- **Portal**: `GET /api/billing/portal?organizationId=...`
- **Webhooks**: `POST /api/billing/webhooks` – idempotent by `organizationId`
- **Plans**: Free, Pro, Enterprise

## Infra (Docker)

```
compose.dev.yml     → development, hot reload (web + server + postgres)
compose.noproxy    → production, exposed ports (external proxy / Dokploy / Coolify)
compose.aio        → production with embedded Caddy proxy + SSL (self-signed or Let's Encrypt)
```

## Flow diagram

```
[User] → [Next.js UI] → [Hono API] → [PostgreSQL]
               ↓              ↓
        TenantContext    Better Auth
        api-client       Drizzle repos
```
