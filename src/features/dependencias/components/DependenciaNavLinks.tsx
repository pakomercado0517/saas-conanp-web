"use client";

import Link from "next/link";
import {
  getDependenciaHref,
  getFilteredDependenciaNavItems,
  getActiveDependenciaNavItem,
} from "@/shared/config/dependenciaNav";
import type { DependenciaNavItem } from "@/shared/config/dependenciaNav";

interface DependenciaNavLinksProps {
  dependenciaId: string;
  pathname: string;
  isAdminInAnyArea: boolean;
  onNavigate?: () => void;
  linkClassName?: (item: DependenciaNavItem, isActive: boolean) => string;
}

export function DependenciaNavLinks({
  dependenciaId,
  pathname,
  isAdminInAnyArea,
  onNavigate,
  linkClassName,
}: DependenciaNavLinksProps) {
  const navItems = getFilteredDependenciaNavItems(isAdminInAnyArea);
  const activeItem = getActiveDependenciaNavItem(pathname, dependenciaId);

  const defaultLinkClass = (item: DependenciaNavItem, isActive: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors ${
      isActive
        ? "bg-(--dependencia-nav-active-bg) text-(--dependencia-nav-active-fg)"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <nav className="flex-1 space-y-1 px-4 py-4" aria-label="Menú dependencia">
      {navItems.map((item) => {
        const href = getDependenciaHref(dependenciaId, item.path);
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
