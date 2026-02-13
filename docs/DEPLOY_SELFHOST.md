# Self-Hosted Deploy (Docker CE on VPS)

Steps to deploy manually on a VPS (Ubuntu, Hetzner, etc.) with Docker CE.

## Requirements

- Docker and Docker Compose installed
- Domain pointed to the VPS (optional; without SSL, ports are used)

## 1. Clone and configure

```bash
git clone <repo-url> booking-saas
cd booking-saas
cp apps/server/.env.example .env
```

## 2. Environment variables

Edit `.env`:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<generate-secure>
POSTGRES_DB=saas

# Auth
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://api.yourdomain.com
BETTER_AUTH_TRUSTED_ORIGINS=https://app.yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com

# Billing (optional)
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_SERVER=production
BILLING_SUCCESS_URL=https://app.yourdomain.com/tenant/default/dashboard
BILLING_RETURN_URL=https://app.yourdomain.com/tenant/default/dashboard
```

## 3. Start the stack

```bash
docker compose -f infra/compose/compose.noproxy.yml up -d
```

## 4. Migrations

```bash
# With pnpm on the host
DATABASE_URL=postgresql://postgres:<PASS>@localhost:5432/saas \
  pnpm --filter @workspace/db db:migrate
```

## 5. Proxy and SSL (Caddy/Traefik/Nginx)

Configure the proxy for:

- `app.yourdomain.com` → `http://localhost:3000`
- `api.yourdomain.com` → `http://localhost:4000`

With Caddy, example:

```
app.yourdomain.com {
  reverse_proxy localhost:3000
}
api.yourdomain.com {
  reverse_proxy localhost:4000
}
```

## 6. Polar webhooks

Register the webhook URL in Polar: `https://api.yourdomain.com/api/billing/webhooks`
