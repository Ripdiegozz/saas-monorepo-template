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

## Billing (Polar + Better Auth)

Uses **Better Auth Polar plugin** for checkout, portal, and webhooks. Requires login before payment.

### Flow (landing → checkout)

1. User clicks "Try Pro" on landing → redirects to `/login?callbackUrl=/checkout/pro` if not logged in
2. After login (or signup) → redirect to `/checkout/pro`
3. If user has no organization → redirect to `/onboarding?callbackUrl=/checkout/pro`
4. User creates org (or selects existing) → redirect to `/checkout/pro`
5. `authClient.checkout({ slug: "pro", referenceId: organizationId })` → redirects to Polar checkout
6. Subscription is linked to user + organization via `referenceId`

### Endpoints

- **Checkout**: via Better Auth Polar plugin – `authClient.checkout()` from client
- **Portal**: `authClient.customer.portal()` – customer self-service
- **Webhooks**: `POST /auth/polar/webhooks` – sync subscription state by `organizationId` / `reference_id`
- **Plans**: Free, Pro, Enterprise (Pro plan requires product in Polar dashboard)

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
