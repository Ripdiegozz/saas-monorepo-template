import type { Context } from "hono";
import { Hono } from "hono";
import { db, superAdmin, organization, member, user, appointment } from "@workspace/db";
import { eq, sql, gte } from "drizzle-orm";
import { authSessionMiddleware } from "../../../kernel/middleware/auth-session";
import type { SessionVariables } from "../../../kernel/middleware/auth-session";

const adminApp = new Hono<{ Variables: SessionVariables }>().use(
  "*",
  authSessionMiddleware
);

async function requireSuperAdmin(c: Context<{ Variables: SessionVariables }>): Promise<Response | null> {
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const rows = await db.select().from(superAdmin).where(eq(superAdmin.userId, userId));
  if (rows.length === 0) {
    return c.json({ error: "Forbidden: super admin required" }, 403);
  }
  return null;
}

adminApp.get("/status", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ isSuperAdmin: false, needsBootstrap: false });
  }
  const rows = await db.select().from(superAdmin).where(eq(superAdmin.userId, userId));
  const anySuperAdmin = await db.select().from(superAdmin).limit(1);
  return c.json({
    isSuperAdmin: rows.length > 0,
    needsBootstrap: anySuperAdmin.length === 0,
  });
});

adminApp.post("/bootstrap", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const existing = await db.select().from(superAdmin).limit(1);
  const first = existing[0];
  if (first) {
    const isMe = first.userId === userId;
    return c.json({
      success: true,
      isSuperAdmin: isMe,
      message: isMe ? "Already super admin" : "Super admin already exists",
    });
  }
  const id = `sa_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  await db.insert(superAdmin).values({ id, userId });

  // Create default organization for the first admin (so /tenant/default/dashboard works)
  const existingOrg = await db.select().from(organization).where(eq(organization.slug, "default")).limit(1);
  if (existingOrg.length === 0) {
    const orgId = `org_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const memberId = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await db.insert(organization).values({
      id: orgId,
      name: "Default",
      slug: "default",
      createdBy: userId,
    });
    await db.insert(member).values({
      id: memberId,
      organizationId: orgId,
      userId,
      role: "owner",
    });
  }

  return c.json({ success: true, isSuperAdmin: true, message: "Bootstrap complete" });
});

/** Creates default org if missing (fixes deployments that ran bootstrap before we added org creation). */
adminApp.post("/ensure-default-org", async (c) => {
  const err = await requireSuperAdmin(c);
  if (err) return err;
  const userId = c.get("userId")!;
  const existing = await db.select().from(organization).where(eq(organization.slug, "default")).limit(1);
  if (existing.length > 0) {
    return c.json({ created: false });
  }
  const orgId = `org_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const memberId = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  await db.insert(organization).values({
    id: orgId,
    name: "Default",
    slug: "default",
    createdBy: userId,
  });
  await db.insert(member).values({
    id: memberId,
    organizationId: orgId,
    userId,
    role: "owner",
  });
  return c.json({ created: true });
});

adminApp.get("/organizations", async (c) => {
  const err = await requireSuperAdmin(c);
  if (err) return err;
  const orgs = await db.select({
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    createdAt: organization.createdAt,
  }).from(organization);
  return c.json(orgs);
});

adminApp.get("/users", async (c) => {
  const err = await requireSuperAdmin(c);
  if (err) return err;
  const users = await db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  }).from(user);
  return c.json(users);
});

adminApp.get("/stats", async (c) => {
  const err = await requireSuperAdmin(c);
  if (err) return err;
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [totalOrgs, totalUsers, totalBookings, orgsByMonth, usersByMonth, bookingsByMonth] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(organization),
    db.select({ count: sql<number>`count(*)::int` }).from(user),
    db.select({ count: sql<number>`count(*)::int` }).from(appointment),
    db
      .select({
        month: sql<string>`to_char(${organization.createdAt}, 'YYYY-MM')`,
        count: sql<number>`count(*)::int`,
      })
      .from(organization)
      .where(gte(organization.createdAt, sixMonthsAgo))
      .groupBy(sql`to_char(${organization.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${organization.createdAt}, 'YYYY-MM')`),
    db
      .select({
        month: sql<string>`to_char(${user.createdAt}, 'YYYY-MM')`,
        count: sql<number>`count(*)::int`,
      })
      .from(user)
      .where(gte(user.createdAt, sixMonthsAgo))
      .groupBy(sql`to_char(${user.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${user.createdAt}, 'YYYY-MM')`),
    db
      .select({
        month: sql<string>`to_char(${appointment.createdAt}, 'YYYY-MM')`,
        count: sql<number>`count(*)::int`,
      })
      .from(appointment)
      .where(gte(appointment.createdAt, sixMonthsAgo))
      .groupBy(sql`to_char(${appointment.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${appointment.createdAt}, 'YYYY-MM')`),
  ]);

  const orgMap = new Map(orgsByMonth.map((r) => [r.month, r.count]));
  const userMap = new Map(usersByMonth.map((r) => [r.month, r.count]));
  const bookingMap = new Map(bookingsByMonth.map((r) => [r.month, r.count]));
  const chartData: { month: string; orgs: number; users: number; bookings: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const m = d.toISOString().slice(0, 7);
    chartData.push({
      month: m,
      orgs: orgMap.get(m) ?? 0,
      users: userMap.get(m) ?? 0,
      bookings: bookingMap.get(m) ?? 0,
    });
  }

  return c.json({
    totalOrgs: totalOrgs[0]?.count ?? 0,
    totalUsers: totalUsers[0]?.count ?? 0,
    totalBookings: totalBookings[0]?.count ?? 0,
    chartData,
  });
});

export const adminRoutes = adminApp;
