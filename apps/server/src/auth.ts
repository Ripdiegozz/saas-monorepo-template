import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, organization } from "better-auth/plugins";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { db, superAdmin } from "@workspace/db";
import * as schema from "@workspace/db/schema";
import { env } from "./env";
import { subscriptionDrizzleRepository } from "./features/billing/infrastructure/repositories/subscription-drizzle-repository";

async function getSuperAdminUserIds(): Promise<string[]> {
  const rows = await db.select({ userId: superAdmin.userId }).from(superAdmin);
  return rows.map((r: { userId: string }) => r.userId);
}

function getPolarPlugins() {
  const hasPolar =
    env.POLAR_ACCESS_TOKEN &&
    env.POLAR_WEBHOOK_SECRET &&
    env.BILLING_SUCCESS_URL &&
    env.BILLING_RETURN_URL &&
    env.POLAR_PRODUCT_ID_PRO;

  if (!hasPolar) return [];

  const polarClient = new Polar({
    accessToken: env.POLAR_ACCESS_TOKEN!,
    server: env.POLAR_SERVER,
  });

  const subscriptionRepo = subscriptionDrizzleRepository();

  const syncSubscription = async (payload: unknown) => {
    const p = payload as {
      customer_id?: string;
      id?: string;
      product?: { name?: string };
      status?: string;
      current_period_end?: string;
      metadata?: { organizationId?: string; reference_id?: string };
    };
    const organizationId =
      p.metadata?.organizationId ?? p.metadata?.reference_id;
    if (!organizationId) return;
    const plan = (p.product?.name ?? "pro").toLowerCase();
    const status = p.status ?? "active";
    const currentPeriodEnd = p.current_period_end
      ? new Date(p.current_period_end)
      : null;
    await subscriptionRepo.setPolarIds(
      organizationId,
      p.customer_id ?? null,
      p.id ?? null,
      plan,
      status,
      currentPeriodEnd
    );
  };

  return [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: env.POLAR_PRODUCT_ID_PRO!,
              slug: "pro",
            },
          ],
          successUrl: env.BILLING_SUCCESS_URL!,
          returnUrl: env.BILLING_RETURN_URL!,
          authenticatedUsersOnly: true,
        }),
        portal({ returnUrl: env.BILLING_RETURN_URL! }),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET!,
          onSubscriptionCreated: syncSubscription,
          onSubscriptionUpdated: syncSubscription,
          onSubscriptionActive: syncSubscription,
          onSubscriptionCanceled: async (payload) => {
            const p = payload as {
              customer_id?: string;
              id?: string;
              metadata?: { organizationId?: string; reference_id?: string };
            };
            const organizationId =
              p.metadata?.organizationId ?? p.metadata?.reference_id;
            if (!organizationId) return;
            await subscriptionRepo.setPolarIds(
              organizationId,
              p.customer_id ?? null,
              p.id ?? null,
              "pro",
              "canceled",
              null
            );
          },
        }),
      ],
    }),
  ];
}

export async function createAuth() {
  const adminUserIds = await getSuperAdminUserIds();
  const polarPlugins = getPolarPlugins();

  return betterAuth({
    emailAndPassword: { enabled: true },
    database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      organization: schema.organization,
      member: schema.member,
      invitation: schema.invitation,
    },
  }),
  secret: env.BETTER_AUTH_SECRET,
  basePath: "/auth",
  baseURL: env.BETTER_AUTH_URL ?? `http://localhost:${env.PORT}`,
  trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS
    ? env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:3000"],
  plugins: [
    ...polarPlugins,
    organization({
      allowUserToCreateOrganization: true,
      async sendInvitationEmail(data) {
        const baseUrl = env.APP_URL
          ?? env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")[0]?.trim()
          ?? "http://localhost:3000";
        const inviteLink = `${baseUrl}/accept-invitation/${data.id}`;
        // TODO: Integrate Resend, SendGrid, etc. for production
        console.log(`[Invitation] Email: ${data.email}, Link: ${inviteLink}`);
      },
    }),
    adminPlugin({ adminUserIds }),
  ],
  });
}

export let auth: Awaited<ReturnType<typeof createAuth>>;

export async function initAuth() {
  auth = await createAuth();
  return auth;
}
