"use client";

import Link from "next/link";
import {
  DASHBOARD_NAV_ITEMS,
  getDashboardHref,
  getActiveNavItem,
} from "@/shared/config/dashboardNav";
import type { DashboardNavItem } from "@/shared/config/dashboardNav";

interface DashboardNavLinksProps {
  organizationId: string;
  pathname: string;
  /** En móvil: cerrar drawer al navegar. */
  onNavigate?: () => void;
  /** Clases extra para el contenedor de cada link. */
  linkClassName?: (item: DashboardNavItem, isActive: boolean) => string;
}

/**
 * Lista de enlaces del menú del dashboard. Única fuente de renderizado del menú;
 * usado en sidebar (desktop) y en drawer (móvil).
 */
export function DashboardNavLinks({
  organizationId,
  pathname,
  onNavigate,
  linkClassName,
}: DashboardNavLinksProps) {
  const activeItem = getActiveNavItem(pathname, organizationId);

  const defaultLinkClass = (item: DashboardNavItem, isActive: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors ${
      isActive
        ? "bg-(--primary) text-white"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <nav className="flex-1 space-y-1 px-4 py-4" aria-label="Menú principal">
      {DASHBOARD_NAV_ITEMS.map((item) => {
        const href = getDashboardHref(organizationId, item.path);
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
