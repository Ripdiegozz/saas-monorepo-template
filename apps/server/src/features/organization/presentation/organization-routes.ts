import { Hono } from "hono";
import { db, organization } from "@workspace/db";
import { eq } from "drizzle-orm";

const api = new Hono();

api.get("/by-slug", async (c) => {
  const slug = c.req.query("slug");
  if (!slug) {
    return c.json({ error: "slug query param required" }, 400);
  }
  const rows = await db.select().from(organization).where(eq(organization.slug, slug));
  const org = rows[0];
  if (!org) {
    return c.json({ error: "Organization not found" }, 404);
  }
  return c.json({ id: org.id, name: org.name, slug: org.slug });
});

export const organizationRoutes = api;
