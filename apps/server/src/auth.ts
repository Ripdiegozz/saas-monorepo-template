import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, organization } from "better-auth/plugins";
import { db, superAdmin } from "@workspace/db";
import * as schema from "@workspace/db/schema";
import { env } from "./env";

async function getSuperAdminUserIds(): Promise<string[]> {
  const rows = await db.select({ userId: superAdmin.userId }).from(superAdmin);
  return rows.map((r: { userId: string }) => r.userId);
}

export async function createAuth() {
  const adminUserIds = await getSuperAdminUserIds();
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
