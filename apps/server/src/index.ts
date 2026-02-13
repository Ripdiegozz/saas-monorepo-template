import { serve } from "@hono/node-server";
import { initAuth } from "./auth";
import { app } from "./app";
import { env } from "./env";

const port = env.PORT;

const auth = await initAuth();

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
