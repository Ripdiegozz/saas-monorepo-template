/**
 * Subscription domain entity. No framework dependencies.
 */
export type SubscriptionPlan = "free" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "canceled" | "past_due";

export type Subscription = {
  id: string;
  organizationId: string;
  polarSubscriptionId: string | null;
  polarCustomerId: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
