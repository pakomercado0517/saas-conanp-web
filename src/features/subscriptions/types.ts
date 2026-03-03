export type SubscriptionsFeatureReady = true;

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "past_due"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired";

export type BillingCycle = "monthly" | "yearly";

export interface SubscriptionPlan {
  id: string;
  name: string;
  active?: boolean;
  maxUsers?: number | null;
  maxEventos?: number | null;
  maxActividades?: number | null;
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
  stripePriceId?: string | null;
  trialEnd?: string | null;
  createdAt: string;
  updatedAt: string;
  Organization?: { id: string; name: string };
  SubscriptionPlan?: SubscriptionPlan;
}

export interface CurrentSubscriptionResponse {
  success: true;
  data: Subscription | null;
  message?: string;
}

/** Respuesta de GET /subscription-plans */
export interface SubscriptionPlansResponse {
  success: true;
  data: SubscriptionPlan[];
  message?: string;
}

/** Payload para contratar o cambiar plan */
export interface SubscribeOrChangePlanPayload {
  planId: string;
  billingCycle: BillingCycle;
}

/** Respuesta de contratar/cambiar cuando hay Stripe Checkout */
export interface SubscribeCheckoutResponse {
  success: true;
  data: { checkoutUrl: string };
  message?: string;
}

/** Respuesta de contratar/cambiar cuando no hay redirección */
export interface SubscribeSuccessResponse {
  success: true;
  data: { subscription: Subscription };
  message?: string;
}

export type SubscribeResponse = SubscribeCheckoutResponse | SubscribeSuccessResponse;
