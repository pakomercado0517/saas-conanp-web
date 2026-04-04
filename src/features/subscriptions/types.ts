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

/**
 * Suscripción según GET/POST/PATCH en docs/api_routes/subscriptions.md.
 * El API usa `dependenciaId`; `organizationId` no viene en los ejemplos y se omite.
 */
export interface Subscription {
  id: string;
  dependenciaId?: string | null;
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
  Dependencia?: { id: string; name: string };
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

/** Body POST crear suscripción o upgrade FREE → plan de pago (docs/api_routes/subscriptions.md) */
export interface CreateSubscriptionPayload {
  planId: string;
  billingCycle: BillingCycle;
  paymentMethodId?: string | null;
  trialEnd?: string | null;
}

/**
 * Body PATCH cambiar plan. El API exige al menos uno de planId, billingCycle, prorate.
 * El caller debe enviar al menos un campo.
 */
export interface ChangeSubscriptionPlanPayload {
  planId?: string;
  billingCycle?: BillingCycle;
  prorate?: boolean;
}

/** Body POST cancelar suscripción */
export interface CancelSubscriptionBody {
  cancelAtPeriodEnd?: boolean;
  reason?: string | null;
}

/** Respuesta exitosa POST crear suscripción: `data` es la suscripción (no anidada). */
export interface PostSubscriptionResponse {
  success: true;
  data: Subscription;
  message?: string;
  timestamp?: string;
}

/** Respuesta exitosa PATCH plan */
export interface PatchSubscriptionPlanResponse {
  success: true;
  data: Subscription;
  message?: string;
  timestamp?: string;
}

export interface CancelSubscriptionResponse {
  success: true;
  data: Subscription;
  message?: string;
  timestamp?: string;
}

export interface ReactivateSubscriptionResponse {
  success: true;
  data: Subscription;
  message?: string;
  timestamp?: string;
}
