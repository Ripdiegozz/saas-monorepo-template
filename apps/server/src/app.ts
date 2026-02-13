import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from '@scalar/hono-api-reference'
import { db, superAdmin } from "@workspace/db";
import { corsMiddleware } from "./kernel/middleware/cors";
import { errorHandler } from "./kernel/middleware/error-handler";
import { requestIdMiddleware } from "./kernel/middleware/request-id";
import { tenantMiddleware } from "./kernel/middleware/tenant";
import { createBookingModule } from "./features/booking/booking-module";
import { billingRoutes } from "./features/billing/presentation/billing-routes";
import { organizationRoutes } from "./features/organization/presentation/organization-routes";
import { adminRoutes } from "./features/admin/presentation/admin-routes";
import { realtimeRoutes } from "./features/realtime/presentation/realtime-routes";

const app = new OpenAPIHono<{
  Variables: { organizationId?: string };
}>()
  .use("*", requestIdMiddleware)
  .use("*", corsMiddleware())
  .onError(errorHandler);

app.use("/api/*", tenantMiddleware);

app.get("/api/health", (c) => {
  return c.json({ status: "ok", ts: new Date().toISOString() });
});

app.route("/api", createBookingModule());
app.route("/api/billing", billingRoutes);
app.route("/api/organizations", organizationRoutes);
// Public: no auth required - used to show welcome/first-admin flow
app.get("/api/admin/needs-setup", async (c) => {
  const rows = await db.select().from(superAdmin).limit(1);
  return c.json({ needsSetup: rows.length === 0 });
});
app.route("/api/admin", adminRoutes);
app.route("/api", realtimeRoutes);

// @ts-expect-error - doc exists on OpenAPIHono, chain type narrows to Hono
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Booking API",
    version: "1.0.0",
    description: "Multi-tenant booking SaaS API",
  },
  servers: [{ url: "/", description: "Current" }],
});

app.get(
  "/scalar",
  Scalar({
    url: "/doc",
    pageTitle: "Booking API",
  })
);

export { app };
