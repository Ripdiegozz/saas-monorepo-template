import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db, organization, member, user } from "@workspace/db";
import { authSessionMiddleware } from "../../../kernel/middleware/auth-session";
import type { SessionVariables } from "../../../kernel/middleware/auth-session";
import { subscriptionDrizzleRepository } from "../../billing/infrastructure/repositories/subscription-drizzle-repository";

const HEADER_ORGANIZATION_ID = "x-organization-id";

const profileApp = new Hono<{ Variables: SessionVariables }>().use(
  "*",
  authSessionMiddleware
);

profileApp.get("/", async (c) => {
  const userId = c.get("userId");
  const organizationId = c.req.header(HEADER_ORGANIZATION_ID);

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  if (!organizationId) {
    return c.json({ error: "Organization context required (x-organization-id header)" }, 400);
  }

  const [memberRow, orgRow] = await Promise.all([
    db
      .select()
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.organizationId, organizationId)))
      .limit(1),
    db.select().from(organization).where(eq(organization.id, organizationId)).limit(1),
  ]);

  const mem = memberRow[0];
  const org = orgRow[0];

  if (!mem || !org) {
    return c.json({ error: "Organization not found or you are not a member" }, 404);
  }

  const userRow = await db
    .select({ id: user.id, name: user.name, email: user.email, image: user.image })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const currentUser = userRow[0];
  if (!currentUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const isOwner = mem.role === "owner";
  let plan: string | null = null;
  let subscriptionStatus: string | null = null;
  let currentPeriodEnd: string | null = null;

  if (isOwner) {
    const subRepo = subscriptionDrizzleRepository();
    const sub = await subRepo.findByOrganizationId(organizationId);
    if (sub) {
      plan = sub.plan;
      subscriptionStatus = sub.status;
      currentPeriodEnd = sub.currentPeriodEnd?.toISOString() ?? null;
    } else {
      plan = "free"; // Default when no Polar subscription
    }
  }

  return c.json({
    user: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      image: currentUser.image,
    },
    member: {
      role: mem.role,
      isOwner,
    },
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      createdAt: org.createdAt.toISOString(),
    },
    subscription: isOwner
      ? {
          plan: plan ?? "free",
          status: subscriptionStatus ?? "active",
          currentPeriodEnd,
        }
      : null,
  });
});

export const profileRoutes = profileApp;
