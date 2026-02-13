# Deploy with Coolify

One-click deploy of the Booking SaaS on Coolify.

## 1. Add application

Create a new application from Git repository with type "Docker Compose".

## 2. Environment variables

Configure in Coolify according to your environment:

**Required:**

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` – public API URL
- `BETTER_AUTH_TRUSTED_ORIGINS` – frontend URL
- `APP_URL` – frontend URL (for invitation links)
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`

**Billing (optional):**

- `POLAR_ACCESS_TOKEN`
- `POLAR_WEBHOOK_SECRET`
- `POLAR_SERVER` – `production`
- `BILLING_SUCCESS_URL`
- `BILLING_RETURN_URL`

## 3. Domains and SSL

Coolify manages domains and Let's Encrypt. Configure:

- UI: `app.yourdomain.com`
- API: `api.yourdomain.com`

## 4. Migrations

Run migrations after the first deploy:

```bash
# In the server container or from host
pnpm --filter @workspace/db db:migrate
```
