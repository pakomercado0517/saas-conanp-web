export type SubscriptionsFeatureReady = true;

/** Clave de sessionStorage para el plan elegido desde la landing (flujo registro → login → suscripción) */
export const PENDING_PLAN_ID_STORAGE_KEY = "conanp_pending_plan_id";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "past_due"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired";

export type BillingCycle = "monthly" | "yearly";

/** Límites opcionales del plan según backend (features.limits) */
export interface SubscriptionPlanFeaturesLimits {
  areas?: number;
  prestadores?: number;
  activos?: number;
  [key: string]: number | undefined;
}

/** Funcionalidades del plan según backend (features.functionalities) */
export type SubscriptionPlanFunctionalities = string[];

export interface SubscriptionPlanFeatures {
  limits?: SubscriptionPlanFeaturesLimits | null;
  functionalities?: SubscriptionPlanFunctionalities | null;
}

/** Contrato alineado con GET /api/v1/subscription-plans (docs/api_routes/subscription-plans.md) */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  priceMonthly?: number | null;
  priceYearly?: number | null;
  stripePriceIdMonthly?: string | null;
  stripePriceIdYearly?: string | null;
  stripeProductId?: string | null;
  features?: SubscriptionPlanFeatures | null;
  maxOrganizations?: number | null;
  maxUsers?: number | null;
  maxEventos?: number | null;
  maxActividades?: number | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
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

/** Paginación opcional en GET /subscription-plans */
export interface SubscriptionPlansPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Respuesta cruda de GET /subscription-plans (lista o paginada) */
export interface SubscriptionPlansListResponse {
  success: true;
  data: SubscriptionPlan[];
  pagination?: SubscriptionPlansPagination;
  message?: string;
  timestamp?: string;
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
