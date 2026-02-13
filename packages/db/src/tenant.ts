/**
 * Helpers for tenant (organization) scoped queries.
 * No business logic — only patterns for filtering by organizationId.
 */

import { eq } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/**
 * Builds eq(column, organizationId) for use in where clauses.
 * Use when all queries in a feature are scoped by the same tenant.
 */
export function tenantWhere(
  column: PgColumn,
  organizationId: string
) {
  return eq(column, organizationId);
}
