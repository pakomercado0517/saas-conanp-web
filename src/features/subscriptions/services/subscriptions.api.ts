import { apiRequest } from "@/shared/lib/api";
import type {
  CurrentSubscriptionResponse,
  SubscriptionPlan,
  SubscriptionPlansListResponse,
  SubscribeOrChangePlanPayload,
  SubscribeResponse,
} from "../types";

const ORG_BASE = "/api/v1/organizations";
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

export async function subscribeOrChangePlan(
  organizationId: string,
  payload: SubscribeOrChangePlanPayload
): Promise<SubscribeResponse> {
  return apiRequest<SubscribeResponse>(
    `${ORG_BASE}/${organizationId}/subscriptions`,
    {
      method: "POST",
      body: payload,
    }
  );
}

export async function cancelSubscriptionAtPeriodEnd(
  organizationId: string
): Promise<{ success: true; message?: string }> {
  return apiRequest<{ success: true; message?: string }>(
    `${ORG_BASE}/${organizationId}/subscriptions/current/cancel`,
    {
      method: "POST",
      body: {},
    }
  );
}

export async function reactivateSubscription(
  organizationId: string
): Promise<{ success: true; message?: string }> {
  return apiRequest<{ success: true; message?: string }>(
    `${ORG_BASE}/${organizationId}/subscriptions/current/reactivate`,
    {
      method: "POST",
      body: {},
    }
  );
}
