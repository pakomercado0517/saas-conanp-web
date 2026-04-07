import { apiRequest } from "@/shared/lib/api";
import type {
  CancelSubscriptionBody,
  CancelSubscriptionResponse,
  ChangeSubscriptionPlanPayload,
  CreateCheckoutSessionPayload,
  CreateSubscriptionPayload,
  CurrentSubscriptionResponse,
  PatchSubscriptionPlanResponse,
  PostCheckoutSessionResponse,
  PostSubscriptionResponse,
  ReactivateSubscriptionResponse,
  SubscriptionPlan,
  SubscriptionPlansListResponse,
} from "../types";

const ORG_BASE = "/api/v1/organizations";
const SUBS_BASE = "/api/v1/subscriptions";
const PLANS_BASE = "/api/v1/subscription-plans";

export async function getCurrentSubscription(
  organizationId: string
): Promise<CurrentSubscriptionResponse> {
  return apiRequest<CurrentSubscriptionResponse>(
    `${ORG_BASE}/${organizationId}/subscriptions/current`,
    {
      method: "GET",
    }
  );
}

/** Respuesta cruda de GET /subscription-plans (paginada o lista) */
export async function getSubscriptionPlans(): Promise<SubscriptionPlansListResponse> {
  return apiRequest<SubscriptionPlansListResponse>(PLANS_BASE, {
    method: "GET",
  });
}

/** Catálogo normalizado: siempre array de planes para consumo en UI */
export async function getSubscriptionPlansCatalog(): Promise<SubscriptionPlan[]> {
  const res = await getSubscriptionPlans();
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * Crear suscripción o upgrade FREE → plan de pago (POST bajo área/organización).
 * @see docs/api_routes/subscriptions.md
 */
export async function postOrganizationSubscription(
  areaId: string,
  payload: CreateSubscriptionPayload
): Promise<PostSubscriptionResponse> {
  return apiRequest<PostSubscriptionResponse>(
    `${ORG_BASE}/${areaId}/subscriptions`,
    {
      method: "POST",
      body: payload,
    }
  );
}

/**
 * Sesión Stripe Checkout (suscripción); redirigir al usuario a `data.url`.
 * @see docs/api_routes/subscriptions.md
 */
export async function postSubscriptionCheckoutSession(
  areaId: string,
  payload: CreateCheckoutSessionPayload
): Promise<PostCheckoutSessionResponse> {
  return apiRequest<PostCheckoutSessionResponse>(
    `${ORG_BASE}/${areaId}/subscriptions/checkout-session`,
    {
      method: "POST",
      body: payload,
    }
  );
}

/**
 * Cambiar plan / ciclo en suscripción que ya tiene Stripe (upgrade/downgrade entre planes de pago).
 */
export async function patchSubscriptionPlan(
  subscriptionId: string,
  payload: ChangeSubscriptionPlanPayload
): Promise<PatchSubscriptionPlanResponse> {
  return apiRequest<PatchSubscriptionPlanResponse>(
    `${SUBS_BASE}/${subscriptionId}/plan`,
    {
      method: "PATCH",
      body: payload,
    }
  );
}

export async function postSubscriptionCancel(
  subscriptionId: string,
  body: CancelSubscriptionBody = { cancelAtPeriodEnd: true }
): Promise<CancelSubscriptionResponse> {
  return apiRequest<CancelSubscriptionResponse>(
    `${SUBS_BASE}/${subscriptionId}/cancel`,
    {
      method: "POST",
      body,
    }
  );
}

export async function postSubscriptionReactivate(
  subscriptionId: string
): Promise<ReactivateSubscriptionResponse> {
  return apiRequest<ReactivateSubscriptionResponse>(
    `${SUBS_BASE}/${subscriptionId}/reactivate`,
    {
      method: "POST",
      body: {},
    }
  );
}

/**
 * Libera suscripción `incomplete` / `incomplete_expired` → plan FREE (cancel en Stripe si aplica).
 * @see docs/api_routes/subscriptions.md
 */
export async function postSubscriptionReleaseIncomplete(
  subscriptionId: string
): Promise<PostSubscriptionResponse> {
  return apiRequest<PostSubscriptionResponse>(
    `${SUBS_BASE}/${subscriptionId}/release-incomplete`,
    {
      method: "POST",
      body: {},
    }
  );
}
