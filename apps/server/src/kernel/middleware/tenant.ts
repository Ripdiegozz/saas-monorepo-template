import type { Context, Next } from "hono";

const HEADER_ORGANIZATION_ID = "x-organization-id";

export type TenantVariables = {
  organizationId: string | undefined;
};

/**
 * Reads organization/tenant from header (e.g. x-organization-id or from session later).
 * Protected routes that need tenant should check organizationId and return 401 if missing.
 */
export async function tenantMiddleware(c: Context<{ Variables: TenantVariables }>, next: Next) {
  const organizationId = c.req.header(HEADER_ORGANIZATION_ID) ?? undefined;
  c.set("organizationId", organizationId);
  await next();
}
