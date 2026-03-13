import { apiRequest } from "@/shared/lib/api";
import type {
  CurrentSubscriptionResponse,
  SubscriptionPlansResponse,
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

export async function getSubscriptionPlans(): Promise<SubscriptionPlansResponse> {
  return apiRequest<SubscriptionPlansResponse>(PLANS_BASE, {
    method: "GET",
  });
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
