import { z } from "zod";
import { Hono } from "hono";
import { Checkout, CustomerPortal, Webhooks } from "@polar-sh/hono";
import { env } from "../../../env";
import { subscriptionDrizzleRepository } from "../infrastructure/repositories/subscription-drizzle-repository";

const polarSubscriptionPayloadSchema = z.object({
  id: z.string().optional(),
  customer_id: z.string().optional(),
  product: z.object({ name: z.string().optional() }).optional(),
  status: z.string().optional(),
  current_period_end: z.string().optional(),
  metadata: z.object({ organizationId: z.string().optional() }).optional(),
});

function parsePolarPayload(payload: unknown): z.infer<typeof polarSubscriptionPayloadSchema> {
  return polarSubscriptionPayloadSchema.parse(payload ?? {});
}

const billingApp = new Hono();

const hasPolarConfig = !!(
  env.POLAR_ACCESS_TOKEN &&
  env.POLAR_WEBHOOK_SECRET &&
  env.BILLING_SUCCESS_URL &&
  env.BILLING_RETURN_URL
);

if (hasPolarConfig) {
  const subscriptionRepo = subscriptionDrizzleRepository();

  billingApp.get(
    "/checkout",
    Checkout({
      accessToken: env.POLAR_ACCESS_TOKEN!,
      successUrl: env.BILLING_SUCCESS_URL!,
      returnUrl: env.BILLING_RETURN_URL!,
      server: env.POLAR_SERVER,
    })
  );

  billingApp.get(
    "/portal",
    CustomerPortal({
      accessToken: env.POLAR_ACCESS_TOKEN!,
      returnUrl: env.BILLING_RETURN_URL!,
      server: env.POLAR_SERVER,
      getCustomerId: async (c) => {
        const organizationId = c.req.query("organizationId");
        if (!organizationId) return "";
        const sub = await subscriptionRepo.findByOrganizationId(organizationId);
        return sub?.polarCustomerId ?? "";
      },
    })
  );

  billingApp.post(
    "/webhooks",
    Webhooks({
      webhookSecret: env.POLAR_WEBHOOK_SECRET!,
      onSubscriptionCreated: async (payload) => {
        const sub = parsePolarPayload(payload);
        const organizationId = sub.metadata?.organizationId;
        if (!organizationId) return;
        const plan = sub.product?.name?.toLowerCase() ?? "pro";
        const status = sub.status ?? "active";
        const currentPeriodEnd = sub.current_period_end
          ? new Date(sub.current_period_end)
          : null;
        await subscriptionRepo.setPolarIds(
          organizationId,
          sub.customer_id ?? null,
          sub.id ?? null,
          plan,
          status,
          currentPeriodEnd
        );
      },
      onSubscriptionUpdated: async (payload) => {
        const sub = parsePolarPayload(payload);
        const organizationId = sub.metadata?.organizationId;
        if (!organizationId) return;
        const plan = sub.product?.name?.toLowerCase() ?? "pro";
        const status = sub.status ?? "active";
        const currentPeriodEnd = sub.current_period_end
          ? new Date(sub.current_period_end)
          : null;
        await subscriptionRepo.setPolarIds(
          organizationId,
          sub.customer_id ?? null,
          sub.id ?? null,
          plan,
          status,
          currentPeriodEnd
        );
      },
      onSubscriptionActive: async (payload) => {
        const sub = parsePolarPayload(payload);
        const organizationId = sub.metadata?.organizationId;
        if (!organizationId) return;
        await subscriptionRepo.setPolarIds(
          organizationId,
          sub.customer_id ?? null,
          sub.id ?? null,
          sub.product?.name?.toLowerCase() ?? "pro",
          "active",
          sub.current_period_end ? new Date(sub.current_period_end) : null
        );
      },
      onSubscriptionCanceled: async (payload) => {
        const sub = parsePolarPayload(payload);
        const organizationId = sub.metadata?.organizationId;
        if (!organizationId) return;
        await subscriptionRepo.setPolarIds(
          organizationId,
          sub.customer_id ?? null,
          sub.id ?? null,
          "pro",
          "canceled",
          null
        );
      },
    })
  );
} else {
  billingApp.get("/checkout", (c) =>
    c.json(
      { error: "Billing not configured. Set POLAR_ACCESS_TOKEN, BILLING_SUCCESS_URL, BILLING_RETURN_URL." },
      503
    )
  );
  billingApp.get("/portal", (c) =>
    c.json({ error: "Billing not configured." }, 503)
  );
  billingApp.post("/webhooks", (c) =>
    c.json({ error: "Webhooks not configured." }, 503)
  );
}

billingApp.get("/plans", (c) =>
  c.json({
    plans: [
      { id: "free", name: "Free", limits: { services: 3, appointments: 50 } },
      { id: "pro", name: "Pro", limits: { services: 20, appointments: 500 } },
      { id: "enterprise", name: "Enterprise", limits: { services: -1, appointments: -1 } },
    ],
  })
);

export const billingRoutes = billingApp;
