import type { LucideIcon } from "lucide-react";
import {
  Home,
  Activity,
  UsersRound,
  Key,
  CalendarDays,
  Ticket,
  BarChart3,
  Users,
} from "lucide-react";

export interface DashboardNavItem {
  path: string;
  label: string;
  /** Título para breadcrumb (ej. "Resumen General" en inicio) */
  breadcrumbTitle?: string;
  icon: LucideIcon;
}

/**
 * Opciones indispensables del dashboard por organización (una ANP).
 * Misma lista en sidebar desktop y en menú móvil (DashboardNavLinks).
 */
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    path: "",
    label: "Inicio",
    breadcrumbTitle: "Resumen General",
    icon: Home,
  },
  {
    path: "/actividades",
    label: "Actividades",
    breadcrumbTitle: "Actividades",
    icon: Activity,
  },
  {
    path: "/prestadores",
    label: "Prestadores",
    breadcrumbTitle: "Prestadores",
    icon: UsersRound,
  },
  {
    path: "/permisos",
    label: "Permisos",
    breadcrumbTitle: "Permisos",
    icon: Key,
  },
  {
    path: "/eventos",
    label: "Eventos",
    breadcrumbTitle: "Eventos",
    icon: CalendarDays,
  },
  {
    path: "/productos-acceso",
    label: "Productos de acceso",
    breadcrumbTitle: "Productos de acceso",
    icon: Ticket,
  },
  {
    path: "/reportes",
    label: "Reportes",
    breadcrumbTitle: "Reportes",
    icon: BarChart3,
  },
  {
    path: "/usuarios",
    label: "Usuarios",
    breadcrumbTitle: "Usuarios",
    icon: Users,
  },
];

/**
 * Obtiene la ruta absoluta para un ítem del dashboard.
 * @param organizationId - ID de la organización (segmento de URL)
 * @param itemPath - path relativo del ítem ("" para inicio)
 */
export function getDashboardHref(
  organizationId: string,
  itemPath: string
): string {
  const base = `/${organizationId}`;
  return itemPath ? `${base}${itemPath}` : base;
}

/**
 * Devuelve el ítem de navegación que coincide con la pathname actual,
 * para breadcrumb y estado activo del menú.
 * Subrutas (ej. /actividades/nueva) hacen activo al ítem padre (Actividades).
 */
export function getActiveNavItem(
  pathname: string,
  organizationId: string
): DashboardNavItem | undefined {
  const base = `/${organizationId}`;
  const normalized = pathname.replace(/\/$/, "") || base;
  if (normalized === base) {
    return DASHBOARD_NAV_ITEMS[0];
  }
  // Coincidencia exacta o prefijo (subrutas): /actividades, /actividades/nueva, /prestadores/123
  return DASHBOARD_NAV_ITEMS.find(
    (item) =>
      item.path &&
      (normalized === `${base}${item.path}` ||
        normalized.startsWith(`${base}${item.path}/`))
  );
}
