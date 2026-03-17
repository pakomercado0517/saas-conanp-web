export const SUBSCRIPTIONS_FEATURE_KEY = "subscriptions";
export { SubscriptionRequiredView } from "./components/SubscriptionRequiredView";
export { useCurrentSubscription } from "./hooks/useCurrentSubscription";
export {
  getMaxAreas,
  getMaxActividades,
  getMaxActivos,
  getMaxEventos,
  getMaxOrganizations,
  getMaxPrestadores,
  getMaxUsers,
  getPlanLimitLabels,
  getPlanLimitsSummary,
  hasAreaLimit,
  isWithinAreaLimit,
} from "./lib/planLimits";
export type { PlanLimitsSummary } from "./lib/planLimits";
export type { Subscription, SubscriptionStatus, CurrentSubscriptionResponse, SubscriptionPlan } from "./types";
