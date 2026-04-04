"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import {
  DASHBOARD_NAV_ITEMS,
  getDashboardHref,
  getActiveNavItem,
} from "@/shared/config/dashboardNav";
import type { DashboardNavItem } from "@/shared/config/dashboardNav";
import { useAreaContextOptional } from "@/features/organizations/context/AreaContext";

interface DashboardNavLinksProps {
  areaId: string;
  pathname: string;
  /** En móvil: cerrar drawer al navegar. */
  onNavigate?: () => void;
  /** Clases extra para el contenedor de cada link. */
  linkClassName?: (item: DashboardNavItem, isActive: boolean) => string;
}

/**
 * Lista de enlaces del menú del dashboard. Única fuente de renderizado del menú;
 * usado en sidebar (desktop) y en drawer (móvil).
 * Usa ítems filtrados por rol y config-acceso cuando está dentro de AreaContextProvider.
 */
export function DashboardNavLinks({
  areaId,
  pathname,
  onNavigate,
  linkClassName,
}: DashboardNavLinksProps) {
  const areaContext = useAreaContextOptional();
  const navItems = areaContext?.navItems ?? DASHBOARD_NAV_ITEMS;
  const dependenciaId = areaContext?.dependenciaId ?? null;

  const activeItem = getActiveNavItem(pathname, areaId);

  const defaultLinkClass = (item: DashboardNavItem, isActive: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors ${
      isActive
        ? "bg-(--primary) text-white"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <nav className="flex-1 space-y-1 px-4 py-4" aria-label="Menú principal">
      {dependenciaId != null && dependenciaId !== "" ? (
        <Link
          href={`/dependencias/${dependenciaId}`}
          className="mb-3 flex items-center gap-3 rounded-lg border border-slate-700 bg-white/5 px-3 py-2.5 text-sm font-semibold text-(--cyan-accent) transition-colors hover:bg-white/10"
          onClick={onNavigate}
        >
          <Building2 className="size-5 shrink-0" aria-hidden />
          <span>Panel de dependencia</span>
        </Link>
      ) : null}
      {navItems.map((item) => {
        const href = getDashboardHref(areaId, item.path);
        const isActive = activeItem === item;
        const className =
          linkClassName?.(item, isActive) ?? defaultLinkClass(item, isActive);
        return (
          <Link
            key={item.path || "inicio"}
            href={href}
            className={className}
            onClick={onNavigate}
          >
            <item.icon className="size-5 shrink-0" aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
