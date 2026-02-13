# Deploy with Dokploy

One-click deploy of the Booking SaaS on Dokploy.

## 1. Connect repository

In Dokploy, add the repository and choose "Docker Compose".

## 2. Configure environment variables

Use Dokploy's variables panel. Reference in `dokploy.template.json`:

**Required:**

- `DATABASE_URL` – auto-generated if Dokploy manages Postgres
- `BETTER_AUTH_SECRET` – `openssl rand -base64 32`
- `BETTER_AUTH_URL` – `https://api.yourdomain.com`
- `BETTER_AUTH_TRUSTED_ORIGINS` – `https://app.yourdomain.com`
- `APP_URL` – `https://app.yourdomain.com` (frontend URL for invitation links)
- `NEXT_PUBLIC_API_URL` – `https://api.yourdomain.com`
- `NEXT_PUBLIC_APP_URL` – `https://app.yourdomain.com`

**Optional (billing – Better Auth Polar):**

- `POLAR_ACCESS_TOKEN`
- `POLAR_WEBHOOK_SECRET`
- `POLAR_SERVER` – `production`
- `POLAR_PRODUCT_ID_PRO` – Pro product ID from Polar dashboard
- `BILLING_SUCCESS_URL`
- `BILLING_RETURN_URL`

Webhook URL to register in Polar: `https://api.yourdomain.com/auth/polar/webhooks`

## 3. Domains

- UI: `app.yourdomain.com` → port 3000
- API: `api.yourdomain.com` → port 4000

## 4. Compose

Dokploy will use `infra/compose/compose.noproxy.yml` as reference. Proxy and SSL are managed by Dokploy.
