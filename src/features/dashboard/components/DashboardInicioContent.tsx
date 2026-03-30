"use client";

import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { SubscriptionSummaryCard } from "./SubscriptionSummaryCard";
import { QuickLinks } from "./QuickLinks";
import { DashboardKPIs } from "./DashboardKPIs";
import { EventosRecientesTable } from "./EventosRecientesTable";
import { AlertasSection } from "./AlertasSection";

export function DashboardInicioContent() {
  const { areaId, subscription, subscriptionStatus, navItems, dependenciaId } =
    useAreaContext();

  const prestadoresDependenciaHref = dependenciaId
    ? `/dependencias/${dependenciaId}/prestadores`
    : null;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
      <DashboardKPIs areaId={areaId} />

      <QuickLinks
        areaId={areaId}
        navItems={navItems}
        prestadoresDependenciaHref={prestadoresDependenciaHref}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <EventosRecientesTable areaId={areaId} />

        <div className="flex flex-col gap-6">
          <SubscriptionSummaryCard
            areaId={areaId}
            subscriptionStatus={subscriptionStatus}
            subscription={subscription}
          />
          <AlertasSection />
        </div>
      </div>
    </div>
  );
}
