"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import { DependenciaOperacionShell } from "@/features/dependencias/components/DependenciaOperacionShell";
import { useDependenciaContext } from "@/features/dependencias/context/DependenciaContext";
import { useMembershipRolesInAreas } from "@/features/memberships/hooks/useMembershipRolesInAreas";
import { useCurrentSubscription } from "@/features/subscriptions/hooks/useCurrentSubscription";
import { SubscriptionManagementPanel } from "@/features/subscriptions/components/SubscriptionManagementPanel";

interface DependenciaSuscripcionPageProps {
  dependenciaId: string;
}

export function DependenciaSuscripcionPage({
  dependenciaId,
}: DependenciaSuscripcionPageProps) {
  const { dependencia, areas, isLoading: depLoading } = useDependenciaContext();
  const areaIds = useMemo(() => areas.map((a) => a.id), [areas]);
  const { rolesByAreaId, isLoading: rolesLoading } =
    useMembershipRolesInAreas(areaIds);

  const adminAreaId = useMemo(() => {
    for (const a of areas) {
      if (rolesByAreaId.get(a.id) === "admin") return a.id;
    }
    return null;
  }, [areas, rolesByAreaId]);

  const { subscription, isLoading: subLoading } =
    useCurrentSubscription(adminAreaId ?? "");

  const isLoading =
    depLoading ||
    rolesLoading ||
    (adminAreaId != null && subLoading);

  const role = adminAreaId != null ? rolesByAreaId.get(adminAreaId) ?? null : null;

  const description = dependencia?.name
    ? `Gestiona el plan y la facturación para ${dependencia.name}. La suscripción se administra mediante un área donde tengas rol de administrador.`
    : "Gestiona el plan y la facturación de la dependencia.";

  if (depLoading || rolesLoading) {
    return (
      <DependenciaOperacionShell
        dependenciaId={dependenciaId}
        title="Administración de suscripción"
        description={description}
      >
        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="flex items-center gap-2 text-sm text-(--slate-text)">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Cargando…
          </p>
        </div>
      </DependenciaOperacionShell>
    );
  }

  if (areas.length === 0) {
    return (
      <DependenciaOperacionShell
        dependenciaId={dependenciaId}
        title="Administración de suscripción"
        description={description}
      >
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-sm text-(--slate-text)">
            No hay áreas naturales protegidas registradas en esta dependencia.
            Cuando exista al menos un área, podrás gestionar la suscripción como
            administrador.
          </p>
        </div>
      </DependenciaOperacionShell>
    );
  }

  if (adminAreaId == null) {
    return (
      <DependenciaOperacionShell
        dependenciaId={dependenciaId}
        title="Administración de suscripción"
        description={description}
      >
        <div className="mx-auto max-w-6xl space-y-8 p-6">
          <nav
            className="flex flex-wrap items-center gap-1 text-sm text-(--slate-text)"
            aria-label="Ruta de navegación"
          >
            <Link
              href={`/dependencias/${dependenciaId}`}
              className="font-medium transition-colors hover:text-(--cyan-accent)"
            >
              {dependencia?.name ?? "Dependencia"}
            </Link>
            <ChevronRight className="size-4 shrink-0 opacity-70" aria-hidden />
            <span className="text-(--navy-deep) dark:text-white">Suscripción</span>
          </nav>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Solo los administradores de al menos un área natural protegida de
              esta dependencia pueden ver y gestionar la suscripción.
            </p>
          </div>
        </div>
      </DependenciaOperacionShell>
    );
  }

  return (
    <DependenciaOperacionShell
      dependenciaId={dependenciaId}
      title="Administración de suscripción"
      description={description}
    >
      <SubscriptionManagementPanel
        areaId={adminAreaId}
        subscription={subscription}
        role={role}
        isLoading={isLoading}
        variant="dependencia"
        dependenciaId={dependenciaId}
        dependenciaName={dependencia?.name ?? null}
      />
    </DependenciaOperacionShell>
  );
}
