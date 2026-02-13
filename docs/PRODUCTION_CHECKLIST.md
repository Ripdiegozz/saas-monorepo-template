# Production Checklist

Pre-launch checklist of things to verify before going live. You can also use the [interactive checklist](/docs) in the deployed app.

- [ ] **DATABASE_URL configured**  
  PostgreSQL connection string for your database.

- [ ] **BETTER_AUTH_SECRET set (32+ chars)**  
  Generate with: `openssl rand -base64 32`

- [ ] **BETTER_AUTH_URL and BETTER_AUTH_TRUSTED_ORIGINS**  
  Production API URL and comma-separated allowed origins (e.g. `https://app.example.com`).

- [ ] **NEXT_PUBLIC_API_URL and NEXT_PUBLIC_APP_URL**  
  Frontend env vars pointing to your API and app domains.

- [ ] **(AIO) APP_DOMAIN, API_DOMAIN, TLS_SELF_SIGNED**  
  When using compose.aio: set domains and `TLS_SELF_SIGNED=true` for self-signed, `false` for Let's Encrypt.

- [ ] **Database migrations applied**  
  Run `pnpm --filter @workspace/db db:push` or `db:migrate`.

- [ ] **First super admin created**  
  Complete the bootstrap flow on first run.

- [ ] **SSL/HTTPS via reverse proxy**  
  Use compose.aio (Caddy built-in, self-signed or Let's Encrypt) or external Caddy/Traefik/Nginx.

- [ ] **(Optional) Polar billing configured (Better Auth)**  
  `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_SERVER=production`, `POLAR_PRODUCT_ID_PRO` (Pro product ID from Polar), `BILLING_SUCCESS_URL`, `BILLING_RETURN_URL`.

- [ ] **(Optional) Polar webhook registered**  
  Add `https://api.yourdomain.com/auth/polar/webhooks` in Polar dashboard (Better Auth Polar plugin).

## References

- [ARCHITECTURE.md](ARCHITECTURE.md) – Multi-tenant model, auth, billing, compose layout
- [FILES.md](FILES.md) – File reference for production
- [DEPLOY_AIO.md](DEPLOY_AIO.md) – AIO (Caddy + SSL)
- [DEPLOY_SELFHOST.md](DEPLOY_SELFHOST.md) – Self-hosted VPS
- [DEPLOY_DOKPLOY.md](DEPLOY_DOKPLOY.md) – Dokploy
- [DEPLOY_COOLIFY.md](DEPLOY_COOLIFY.md) – Coolify
