"use client";

import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardMobileDrawer } from "./DashboardMobileDrawer";

interface DashboardLayoutProps {
  organizationId: string;
  children: React.ReactNode;
  /** Acción principal del header (ej. "Nueva Área"). Opcional. */
  primaryAction?: { label: string; href: string };
}

export function DashboardLayout({
  organizationId,
  children,
  primaryAction,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-(--background-light) text-slate-900 dark:bg-(--background-dark) dark:text-slate-100">
      <DashboardSidebar organizationId={organizationId} />
      <DashboardMobileDrawer
        organizationId={organizationId}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <DashboardHeader
          organizationId={organizationId}
          primaryAction={primaryAction}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        {children}
      </main>
    </div>
  );
}
