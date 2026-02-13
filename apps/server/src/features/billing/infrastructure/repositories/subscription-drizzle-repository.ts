import { z } from "zod";
import type { SubscriptionRepository } from "../../application/ports/subscription-repository";
import type { Subscription } from "../../domain/subscription";
import { db, subscription as subscriptionTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const planSchema = z.enum(["free", "pro", "enterprise"]);
const statusSchema = z.enum(["active", "canceled", "past_due"]);

function toDomain(row: {
  id: string;
  organizationId: string;
  polarSubscriptionId: string | null;
  polarCustomerId: string | null;
  plan: string;
  status: string;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): Subscription {
  return {
    id: row.id,
    organizationId: row.organizationId,
    polarSubscriptionId: row.polarSubscriptionId,
    polarCustomerId: row.polarCustomerId,
    plan: planSchema.parse(row.plan),
    status: statusSchema.parse(row.status),
    currentPeriodEnd: row.currentPeriodEnd,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function subscriptionDrizzleRepository(): SubscriptionRepository {
  return {
    async findByOrganizationId(organizationId) {
      const rows = await db
        .select()
        .from(subscriptionTable)
        .where(eq(subscriptionTable.organizationId, organizationId));
      const row = rows[0];
      return row ? toDomain(row) : null;
    },
    async upsertByOrganizationId(subscription) {
      await db
        .insert(subscriptionTable)
        .values({
          id: subscription.id,
          organizationId: subscription.organizationId,
          polarSubscriptionId: subscription.polarSubscriptionId,
          polarCustomerId: subscription.polarCustomerId,
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
        })
        .onConflictDoUpdate({
          target: subscriptionTable.organizationId,
          set: {
            polarSubscriptionId: subscription.polarSubscriptionId,
            polarCustomerId: subscription.polarCustomerId,
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            updatedAt: new Date(),
          },
        });
    },
    async setPolarIds(
      organizationId,
      polarCustomerId,
      polarSubscriptionId,
      plan,
      status,
      currentPeriodEnd
    ) {
      const id = `sub_${organizationId}`;
      const now = new Date();
      await db
        .insert(subscriptionTable)
        .values({
          id,
          organizationId,
          polarCustomerId,
          polarSubscriptionId,
          plan,
          status,
          currentPeriodEnd,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: subscriptionTable.organizationId,
          set: {
            polarCustomerId: polarCustomerId ?? undefined,
            polarSubscriptionId: polarSubscriptionId ?? undefined,
            plan,
            status,
            currentPeriodEnd: currentPeriodEnd ?? undefined,
            updatedAt: now,
          },
        });
    },
  };
}
