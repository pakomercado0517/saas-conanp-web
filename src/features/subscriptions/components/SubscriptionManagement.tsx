"use client";

import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { SubscriptionManagementPanel } from "./SubscriptionManagementPanel";

export function SubscriptionManagement() {
  const { subscription, role, isLoading, areaId, dependenciaId } =
    useAreaContext();

  return (
    <SubscriptionManagementPanel
      areaId={areaId}
      subscription={subscription}
      role={role}
      isLoading={isLoading}
      variant="default"
      dependenciaId={dependenciaId}
    />
  );
}
