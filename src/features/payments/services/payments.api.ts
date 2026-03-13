import { getApiBaseUrl } from "@/shared/lib/api";
import { useAuthStore } from "@/features/auth/store/auth.store";

const BASE = "/api/v1/organizations";

export interface CreatePaymentIntentResponse {
  success: true;
  data: {
    clientSecret?: string;
    checkoutUrl?: string;
    paymentIntentId?: string;
    amount?: number;
    currency?: string;
  };
}

export async function createPaymentIntent(
  organizationId: string,
  eventoId: string
): Promise<CreatePaymentIntentResponse["data"]> {
  const accessToken = useAuthStore.getState().accessToken;
  const url = `${getApiBaseUrl()}${BASE}/${organizationId}/eventos/${eventoId}/create-payment-intent`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  const data = (await res.json()) as CreatePaymentIntentResponse | { success: false; message?: string };
  if (!res.ok) {
    const err = data as { success: false; message?: string };
    throw new Error(err.message ?? "Error al crear intención de pago");
  }
  return (data as CreatePaymentIntentResponse).data;
}
