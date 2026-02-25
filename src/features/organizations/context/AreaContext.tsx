"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Organization, ConfigAccesoData } from "../types";
import type { Subscription } from "@/features/subscriptions/types";
import type { MembershipRole } from "@/features/memberships/types";
import { useOrganization } from "../hooks/useOrganization";
import { useOrganizationConfigAcceso } from "../hooks/useOrganizationConfigAcceso";
import { useCurrentUserMembership } from "@/features/memberships/hooks/useCurrentUserMembership";
import { useCurrentSubscription } from "@/features/subscriptions/hooks/useCurrentSubscription";
import {
  getFilteredNavItems,
  type DashboardNavItem,
} from "@/shared/config/dashboardNav";

export interface AreaContextValue {
  /** ID del área (ANP). Usar para navegación y llamadas API. */
  areaId: string;
  /** ID de la dependencia padre (para navegación de retorno). */
  dependenciaId: string | null;
  area: Organization | null;
  configAcceso: ConfigAccesoData | null;
  subscription: Subscription | null;
  subscriptionStatus: "loading" | "forbidden" | "ready";
  role: MembershipRole | null;
  isLoading: boolean;
  error: unknown;
  /** Si la suscripción está activa o en prueba (solo cuando subscriptionStatus === "ready" y hay datos). */
  isSubscriptionActive: boolean;
  /** Mostrar secciones de productos de acceso / brazaletes según config del área. */
  showProductosAcceso: boolean;
  /** Ítems de navegación filtrados por rol y config-acceso. */
  navItems: DashboardNavItem[];
  /** Mostrar vista de "contratar suscripción" en lugar del dashboard (403 en org o suscripción inactiva para admin). */
  showSubscriptionRequired: boolean;
  refetch: () => void;
}

const AreaContext = createContext<AreaContextValue | null>(null);

export function useAreaContext(): AreaContextValue {
  const ctx = useContext(AreaContext);
  if (!ctx) {
    throw new Error("useAreaContext debe usarse dentro de AreaContextProvider");
  }
  return ctx;
}

export function useAreaContextOptional(): AreaContextValue | null {
  return useContext(AreaContext);
}

interface AreaContextProviderProps {
  areaId: string;
  children: ReactNode;
}

export function AreaContextProvider({
  areaId,
  children,
}: AreaContextProviderProps) {
  const org = useOrganization(areaId);
  const configAcceso = useOrganizationConfigAcceso(areaId);
  const { role, isLoading: membershipLoading } =
    useCurrentUserMembership(areaId);
  const {
    subscription,
    state: subState,
    isActive: isSubscriptionActive,
  } = useCurrentSubscription(areaId);

  const isLoading =
    org.isLoading || (org.data != null && membershipLoading);

  const org403 = org.statusCode === 403;
  const subscriptionInactiveForAdmin =
    role === "admin" &&
    subState.status === "ready" &&
    subscription === null;
  const showSubscriptionRequired =
    org403 || subscriptionInactiveForAdmin;

  const showProductosAcceso = Boolean(
    configAcceso.data?.acceso?.brazaletesObligatorios === true
  );

  const navItems = useMemo(
    () => getFilteredNavItems(role, showProductosAcceso),
    [role, showProductosAcceso]
  );

  const refetch = useCallback(() => {
    org.refetch();
    configAcceso.refetch();
    // membership and subscription refetch would need to be exposed from hooks
  }, [org, configAcceso]);

  const dependenciaId = org.data?.dependenciaId ?? null;

  const value: AreaContextValue = useMemo(
    () => ({
      areaId,
      dependenciaId,
      area: org.data ?? null,
      configAcceso: configAcceso.data ?? null,
      subscription: subscription ?? null,
      subscriptionStatus: subState.status,
      role,
      isLoading,
      error: org.error ?? configAcceso.error,
      isSubscriptionActive,
      showProductosAcceso,
      navItems,
      showSubscriptionRequired,
      refetch,
    }),
    [
      areaId,
      dependenciaId,
      org.data,
      org.error,
      configAcceso.data,
      configAcceso.error,
      subscription,
      subState.status,
      role,
      isLoading,
      isSubscriptionActive,
      showProductosAcceso,
      navItems,
      showSubscriptionRequired,
      refetch,
    ]
  );

  return (
    <AreaContext.Provider value={value}>{children}</AreaContext.Provider>
  );
}
