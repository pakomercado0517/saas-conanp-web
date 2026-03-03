"use client";

import { useState } from "react";
import { getApiErrorMessage, getApiErrorCode } from "@/shared/types/api";
import { AreaContextProvider, useAreaContext } from "@/features/organizations/context/AreaContext";
import { SubscriptionRequiredView } from "@/features/subscriptions/components/SubscriptionRequiredView";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardMobileDrawer } from "./DashboardMobileDrawer";

interface DashboardLayoutProps {
  areaId: string;
  children: React.ReactNode;
  /** Acción principal del header (ej. "Nueva Área"). Opcional. */
  primaryAction?: { label: string; href: string };
}

function DashboardLayoutInner({
  areaId,
  children,
  primaryAction,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showSubscriptionRequired, isLoading, error } = useAreaContext();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-(--background-light) dark:bg-(--background-dark)">
        <p className="text-sm text-slate-500">Cargando área…</p>
      </div>
    );
  }

  if (showSubscriptionRequired) {
    const message = error != null ? getApiErrorMessage(error) : undefined;
    const errorCode = error != null ? getApiErrorCode(error) : undefined;
    return (
      <div className="flex h-screen w-full flex-col overflow-hidden bg-(--background-light) dark:bg-(--background-dark)">
        <DashboardHeader areaId={areaId} onMenuClick={() => {}} />
        <SubscriptionRequiredView
          areaId={areaId}
          message={message}
          errorCode={errorCode}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-(--background-light) text-slate-900 dark:bg-(--background-dark) dark:text-slate-100">
      <DashboardSidebar areaId={areaId} />
      <DashboardMobileDrawer
        areaId={areaId}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <DashboardHeader
          areaId={areaId}
          primaryAction={primaryAction}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        {children}
      </main>
    </div>
  );
}

export function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <AreaContextProvider areaId={props.areaId}>
      <DashboardLayoutInner {...props} />
    </AreaContextProvider>
  );
}
