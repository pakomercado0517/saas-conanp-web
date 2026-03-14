"use client";

import Link from "next/link";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import type { DashboardNavItem } from "@/shared/config/dashboardNav";

const QUICK_ACCESS_PATHS = ["/actividades", "/eventos", "/prestadores", "/reportes"];

interface QuickLinksProps {
  areaId: string;
  navItems: DashboardNavItem[];
}

export function QuickLinks({ areaId, navItems }: QuickLinksProps) {
  const links = navItems.filter((item) => item.path && QUICK_ACCESS_PATHS.includes(item.path));

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-bold">Accesos rápidos</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {links.map((item) => {
          const href = getDashboardHref(areaId, item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={href}
              className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 hover:border-(--primary)/30 dark:border-slate-700 dark:hover:bg-slate-800/50 dark:hover:border-(--primary)/30"
            >
              <span className="rounded-lg bg-(--primary)/10 p-2">
                <Icon className="size-5 text-(--primary)" aria-hidden />
              </span>
              <span className="text-center text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
