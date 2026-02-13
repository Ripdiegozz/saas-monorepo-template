import type { Subscription } from "../../domain/subscription";

export interface SubscriptionRepository {
  findByOrganizationId(organizationId: string): Promise<Subscription | null>;
  upsertByOrganizationId(subscription: Subscription): Promise<void>;
  setPolarIds(
    organizationId: string,
    polarCustomerId: string | null,
    polarSubscriptionId: string | null,
    plan: string,
    status: string,
    currentPeriodEnd: Date | null
  ): Promise<void>;
}
