import { apiRequest } from "@/shared/lib/api";
import type { CurrentSubscriptionResponse } from "../types";

const BASE = "/api/v1/organizations";

export async function getCurrentSubscription(
  organizationId: string,
  accessToken?: string | null
): Promise<CurrentSubscriptionResponse> {
  return apiRequest<CurrentSubscriptionResponse>(
    `${BASE}/${organizationId}/subscriptions/current`,
    {
      method: "GET",
      accessToken,
    }
  );
}
