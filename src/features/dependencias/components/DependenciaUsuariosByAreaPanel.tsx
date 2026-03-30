"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { UsuariosContent } from "@/features/memberships/components/UsuariosContent";
import { useDependenciaContext } from "@/features/dependencias/context/DependenciaContext";
import { useMembershipRolesInAreas } from "@/features/memberships/hooks/useMembershipRolesInAreas";

interface DependenciaUsuariosByAreaPanelProps {
  dependenciaId: string;
}

export function DependenciaUsuariosByAreaPanel({
  dependenciaId,
}: DependenciaUsuariosByAreaPanelProps) {
  const { areas } = useDependenciaContext();
  const areaIds = areas.map((a) => a.id);
  const { rolesByAreaId, isLoading: rolesLoading } =
    useMembershipRolesInAreas(areaIds);

  /** Selección explícita del usuario; si es null o deja de existir en `areas`, se usa la primera ANP. */
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const effectiveAreaId = useMemo(() => {
    if (areas.length === 0) return null;
    if (selectedAreaId && areas.some((a) => a.id === selectedAreaId)) {
      return selectedAreaId;
    }
    return areas[0].id;
  }, [areas, selectedAreaId]);

  if (rolesLoading) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Cargando áreas…
      </p>
    );
  }

  if (areas.length === 0) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-400">
        No hay áreas registradas. Las membresías de usuarios se administran por
        cada área natural protegida.
      </p>
    );
  }

  const hubHref = `/dependencias/${dependenciaId}`;
  const contentAreaId = effectiveAreaId ?? areas[0].id;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/30">
      {areas.length > 1 ? (
        <div
          className="flex flex-wrap gap-1 border-b border-slate-200 p-2 dark:border-slate-700"
          role="tablist"
          aria-label="Áreas naturales protegidas"
        >
          {areas.map((area) => {
            const selected = area.id === contentAreaId;
            const isAdmin = rolesByAreaId.get(area.id) === "admin";
            return (
              <button
                key={area.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setSelectedAreaId(area.id)}
                className={`flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  selected
                    ? "bg-(--cyan-accent)/15 text-(--cyan-accent)"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-(--cyan-accent)/10">
                  <Users className="size-4 text-(--cyan-accent)" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate">{area.name}</span>
                  {!isAdmin ? (
                    <span className="block text-xs font-normal text-amber-700 dark:text-amber-300">
                      Solo lectura
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <UsuariosContent
        key={contentAreaId}
        areaId={contentAreaId}
        showMainHeading={false}
        footerBackHref={hubHref}
        footerBackLabel="Volver al hub de dependencia"
      />
    </div>
  );
}
