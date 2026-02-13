# Deploy with AIO Compose (Caddy + SSL)

> See **[FILES.md](FILES.md)** for a reference of all pertinent files (compose, env, scripts).

All-in-one compose with embedded Caddy reverse proxy and SSL support. Ideal for self-hosting on a single VPS with your own domain.

## Features

- **Caddy** reverse proxy (terminates SSL)
- **Self-signed certificates** – for development or internal use (`TLS_SELF_SIGNED=true`)
- **Let's Encrypt / ACME** – automatic trusted certificates when domain points to your server (`TLS_SELF_SIGNED=false`)
- **User-defined domain** – set `APP_DOMAIN` and `API_DOMAIN` in `.env`

## Requirements

- Docker and Docker Compose
- Domain pointed to your VPS (for ACME / Let's Encrypt)
- Ports 80 and 443 available

## 1. Configure environment

```bash
cp apps/server/.env.example .env
```

Edit `.env` and set at minimum:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<generate-secure>
POSTGRES_DB=saas

# Auth (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=<your-secret>

# Domains - choose your app and API subdomains
APP_DOMAIN=app.yourdomain.com
API_DOMAIN=api.yourdomain.com

# TLS mode
TLS_SELF_SIGNED=false
# Use true for self-signed certs (dev, internal); false for Let's Encrypt

# URLs - must match your domains (https when using SSL)
BETTER_AUTH_URL=https://api.yourdomain.com
BETTER_AUTH_TRUSTED_ORIGINS=https://app.yourdomain.com
APP_URL=https://app.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com

# Billing (optional)
BILLING_SUCCESS_URL=https://app.yourdomain.com/tenant/default/dashboard
BILLING_RETURN_URL=https://app.yourdomain.com/tenant/default/dashboard
```

### Self-signed vs Let's Encrypt

| Mode | `TLS_SELF_SIGNED` | Use case |
|------|-------------------|----------|
| Let's Encrypt (ACME) | `false` | Production, domain resolves to your server |
| Self-signed | `true` | Local dev, staging, internal networks |

For self-signed with local testing, you can use:
- `APP_DOMAIN=app.localhost`
- `API_DOMAIN=api.localhost`

(`*.localhost` resolves to `127.0.0.1` on most systems.)

## 2. Start the stack

Run from the repository root (so `.env` is found):

```bash
docker compose --env-file .env -f infra/compose/compose.aio.yml up -d --build
```

Or with the install script:

```bash
./scripts/install.sh aio
```

## 3. Verify

- **UI**: `https://app.yourdomain.com` (or `https://app.localhost` with self-signed)
- **API**: `https://api.yourdomain.com`

For Let's Encrypt, ensure:
1. DNS for `app.yourdomain.com` and `api.yourdomain.com` points to your VPS
2. Ports 80 and 443 are open

## 4. Migrations

Migrations run automatically on first startup. To re-run manually:

```bash
docker compose --env-file .env -f infra/compose/compose.aio.yml run --rm migrate
```

## Polar webhook

If using billing, register:
```
https://api.yourdomain.com/api/billing/webhooks
```
