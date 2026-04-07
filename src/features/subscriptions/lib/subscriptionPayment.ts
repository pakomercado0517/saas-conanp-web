import type { Subscription } from "../types";

/** PATCH de plan solo aplica con suscripción Stripe activa o en prueba. */
export function subscriptionAllowsPatchPlanChange(
  subscription: Subscription
): boolean {
  if (!subscription.stripeSubscriptionId) return false;
  return (
    subscription.status === "active" || subscription.status === "trialing"
  );
}

/** Estados donde el usuario debe completar o reintentar pago en Stripe. */
export function subscriptionNeedsPaymentCompletion(
  subscription: Subscription
): boolean {
  return (
    subscription.status === "past_due" ||
    subscription.status === "unpaid" ||
    subscription.status === "incomplete" ||
    subscription.status === "incomplete_expired"
  );
}

/** Solo incomplete / incomplete_expired: elegible para `POST .../release-incomplete`. */
export function subscriptionAllowsReleaseIncomplete(
  subscription: Subscription
): boolean {
  return (
    subscription.status === "incomplete" ||
    subscription.status === "incomplete_expired"
  );
}
