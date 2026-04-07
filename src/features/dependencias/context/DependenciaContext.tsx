"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { getMaxAreas, isWithinAreaLimit } from "@/features/subscriptions/lib/planLimits";
import { useCurrentSubscription } from "@/features/subscriptions/hooks/useCurrentSubscription";
import type { SubscriptionPlan } from "@/features/subscriptions/types";
import { useDependencia } from "../hooks/useDependencia";
import { useDependenciaAreas } from "../hooks/useDependenciaAreas";
import { useDependenciaInvitations } from "../hooks/useDependenciaInvitations";
import type {
  Dependencia,
  DependenciaArea,
  DependenciaInvitation,
} from "../types";

/** Límite de áreas por defecto cuando el plan no está disponible (backend-driven cuando exista) */
export const DEFAULT_MAX_AREAS_WHEN_UNKNOWN = 1;

export interface DependenciaContextValue {
  dependenciaId: string;
  dependencia: Dependencia | null;
  areas: DependenciaArea[];
  invitations: DependenciaInvitation[];
  isLoading: boolean;
  error: unknown;
  canCreateArea: boolean;
  /** Límite de áreas del plan actual; fallback a DEFAULT_MAX_AREAS_WHEN_UNKNOWN si no hay plan */
  maxAreas: number;
  /** Nombre del plan cuando viene del backend; null si no aplica */
  planName: string | null;
  refetch: () => void;
}

const DependenciaCtx = createContext<DependenciaContextValue | null>(null);

export function useDependenciaContext(): DependenciaContextValue {
  const ctx = useContext(DependenciaCtx);
  if (!ctx) {
    throw new Error(
      "useDependenciaContext debe usarse dentro de DependenciaContextProvider"
    );
  }
  return ctx;
}

interface DependenciaContextProviderProps {
  dependenciaId: string;
  /** Plan de la organización/dependencia cuando esté disponible; si no se pasa, se usa fallback de límites */
  subscriptionPlan?: SubscriptionPlan | null;
  children: ReactNode;
}

export function DependenciaContextProvider({
  dependenciaId,
  subscriptionPlan = null,
  children,
}: DependenciaContextProviderProps) {
  const dep = useDependencia(dependenciaId);
  const areasQuery = useDependenciaAreas(dependenciaId);
  const invQuery = useDependenciaInvitations(dependenciaId, {
    status: "pending",
  });

  const isLoading = dep.isLoading || areasQuery.isLoading;
  const areas = useMemo(() => areasQuery.data ?? [], [areasQuery.data]);
  const invitations = useMemo(() => invQuery.data ?? [], [invQuery.data]);

  /** La suscripción en BD es por dependencia; cualquier ANP de la lista sirve como ancla para GET /current. */
  const subscriptionAnchorAreaId = areas.length > 0 ? areas[0].id : "";
  const { subscription, refetch: refetchCurrentSubscription } =
    useCurrentSubscription(subscriptionAnchorAreaId);

  const resolvedSubscriptionPlan =
    subscriptionPlan ?? subscription?.SubscriptionPlan ?? null;

  const maxAreas =
    getMaxAreas(resolvedSubscriptionPlan) ?? DEFAULT_MAX_AREAS_WHEN_UNKNOWN;
  const canCreateArea = isWithinAreaLimit(
    resolvedSubscriptionPlan,
    areas.length
  );
  const planName = resolvedSubscriptionPlan?.name ?? null;

  const refetch = useCallback(() => {
    dep.refetch();
    areasQuery.refetch();
    invQuery.refetch();
    void refetchCurrentSubscription();
  }, [dep, areasQuery, invQuery, refetchCurrentSubscription]);

  const value: DependenciaContextValue = useMemo(
    () => ({
      dependenciaId,
      dependencia: dep.data ?? null,
      areas,
      invitations,
      isLoading,
      error: dep.error ?? areasQuery.error,
      canCreateArea,
      maxAreas,
      planName,
      refetch,
    }),
    [
      dependenciaId,
      dep.data,
      dep.error,
      areas,
      invitations,
      isLoading,
      areasQuery.error,
      canCreateArea,
      maxAreas,
      planName,
      refetch,
    ]
  );

  return (
    <DependenciaCtx.Provider value={value}>
      {children}
    </DependenciaCtx.Provider>
  );
}
