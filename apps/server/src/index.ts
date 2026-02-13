import { serve } from "@hono/node-server";
import { initAuth } from "./auth";
import { app } from "./app";
import { env } from "./env";

const port = env.PORT;

const auth = await initAuth();

const hasPolar =
  !!env.POLAR_ACCESS_TOKEN &&
  !!env.POLAR_WEBHOOK_SECRET &&
  !!env.POLAR_PRODUCT_ID_PRO &&
  !!env.BILLING_SUCCESS_URL &&
  !!env.BILLING_RETURN_URL;

app.on(["GET", "POST"], "/auth/checkout", async (c) => {
  if (!hasPolar) {
    return c.json(
      { error: { message: "Billing (Polar) is not configured. Set POLAR_ACCESS_TOKEN, POLAR_PRODUCT_ID_PRO, BILLING_SUCCESS_URL, BILLING_RETURN_URL in server .env." } },
      503
    );
  }
  const res = await auth.handler(c.req.raw);
  return res ?? c.json({ error: "Auth handler did not respond" }, 500);
});

app.on(["GET", "POST"], "/auth/*", async (c) => {
  const res = await auth.handler(c.req.raw);
  return res ?? c.json({ error: "Auth handler did not respond" }, 500);
});

serve({
  fetch: app.fetch,
  port,
}, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`OpenAPI doc: http://localhost:${port}/doc`);
  console.log(`Scalar UI: http://localhost:${port}/scalar`);
});
