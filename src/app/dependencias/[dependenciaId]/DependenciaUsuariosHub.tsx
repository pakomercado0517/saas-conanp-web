"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { useDependenciaContext } from "@/features/dependencias/context/DependenciaContext";
import { useMembershipRolesInAreas } from "@/features/memberships/hooks/useMembershipRolesInAreas";

export function DependenciaUsuariosHub() {
  const { areas } = useDependenciaContext();
  const areaIds = areas.map((a) => a.id);
  const { rolesByAreaId, isLoading } = useMembershipRolesInAreas(areaIds);

  if (isLoading) {
    return (
      <p className="text-sm text-slate-500">Cargando áreas…</p>
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

  return (
    <ul className="space-y-3">
      {areas.map((area) => {
        const isAdmin = rolesByAreaId.get(area.id) === "admin";
        const href = getDashboardHref(area.id, "/usuarios");
        return (
          <li key={area.id}>
            <Link
              href={href}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-(--cyan-accent)/40 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
            >
              <span className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-(--cyan-accent)/10">
                  <Users className="size-5 text-(--cyan-accent)" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold text-slate-900 dark:text-slate-100">
                    {area.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    Gestionar membresías y roles en esta ANP
                  </span>
                </span>
              </span>
              {!isAdmin && (
                <span className="text-xs text-amber-700 dark:text-amber-300">
                  Solo lectura
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
