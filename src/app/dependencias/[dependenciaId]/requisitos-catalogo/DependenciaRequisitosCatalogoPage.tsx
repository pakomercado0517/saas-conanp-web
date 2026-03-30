"use client";

import { useMemo } from "react";
import { useDependenciaContext } from "@/features/dependencias/context/DependenciaContext";
import { DependenciaOperacionShell } from "@/features/dependencias/components/DependenciaOperacionShell";
import { RequisitosCatalogoPanel } from "@/features/activos/components/RequisitosCatalogoContent";
import { useMembershipRolesInAreas } from "@/features/memberships/hooks/useMembershipRolesInAreas";

const ACCESS_DENIED_DEPENDENCIA =
  "Solo los administradores de alguna ANP de esta dependencia pueden configurar el catálogo de requisitos.";

interface DependenciaRequisitosCatalogoPageProps {
  dependenciaId: string;
}

export function DependenciaRequisitosCatalogoPage({
  dependenciaId,
}: DependenciaRequisitosCatalogoPageProps) {
  const { dependencia, areas } = useDependenciaContext();
  const areaIds = useMemo(() => areas.map((a) => a.id), [areas]);
  const { isAdminInAnyArea, isLoading: rolesLoading } =
    useMembershipRolesInAreas(areaIds);

  const fallbackOrganizationId = areas[0]?.id ?? "";

  return (
    <DependenciaOperacionShell
      dependenciaId={dependenciaId}
      title="Catálogo de requisitos"
      description={
        dependencia?.name
          ? `Definiciones de requisitos por tipo de activo para las ANP de ${dependencia.name}. Los mismos datos alimentan formularios de activos en cada área.`
          : "Definiciones de requisitos por tipo de activo para las áreas de esta dependencia."
      }
    >
      {rolesLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cargando permisos…
        </p>
      ) : areas.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No hay áreas registradas. Crea una ANP para asociar el catálogo de
          requisitos.
        </p>
      ) : (
        <RequisitosCatalogoPanel
          organizationId={fallbackOrganizationId}
          dependenciaId={dependenciaId}
          canManage={isAdminInAnyArea}
          pageDescription=""
          showPageHeader={false}
          accessDeniedMessage={ACCESS_DENIED_DEPENDENCIA}
        />
      )}
    </DependenciaOperacionShell>
  );
}
