import type { LucideIcon } from "lucide-react";
import {
  Home,
  Activity,
  Key,
  CalendarDays,
  Ticket,
  BarChart3,
  ListChecks,
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
    path: "/configuracion/requisitos-catalogo",
    label: "Catálogo de requisitos",
    breadcrumbTitle: "Catálogo de requisitos",
    icon: ListChecks,
  },
];

/**
 * Prefijo de la ruta del dashboard. "areas" = /areas/:areaId/...
 */
const DASHBOARD_ROUTE_PREFIX = "areas";

function getDashboardRoot(areaId: string): string {
  return DASHBOARD_ROUTE_PREFIX
    ? `/${DASHBOARD_ROUTE_PREFIX}/${areaId}`
    : `/${areaId}`;
}

/**
 * Obtiene la ruta absoluta para un ítem del dashboard.
 * @param areaId - ID del área (ANP)
 * @param itemPath - path relativo del ítem ("" para inicio)
 */
export function getDashboardHref(areaId: string, itemPath: string): string {
  const base = getDashboardRoot(areaId);
  return itemPath ? `${base}${itemPath}` : base;
}

/**
 * Roles que pueden ver reportes y catálogo de requisitos (solo admin).
 */
const ADMIN_ONLY_PATHS = [
  "/reportes",
  "/configuracion/requisitos-catalogo",
];

/**
 * Path de productos de acceso (visible solo si config-acceso habilita brazaletes).
 */
const PRODUCTOS_ACCESO_PATH = "/productos-acceso";

export type MembershipRole = "admin" | "gestor" | "prestador" | "observador";

/**
 * Devuelve los ítems de navegación filtrados por rol y configuración de acceso.
 * - Reportes: solo admin.
 * - Productos de acceso: solo si la ANP tiene brazaletes habilitados (configAcceso).
 */
export function getFilteredNavItems(
  role: MembershipRole | null,
  showProductosAcceso: boolean
): DashboardNavItem[] {
  const isAdmin = role === "admin";
  return DASHBOARD_NAV_ITEMS.filter((item) => {
    if (item.path === PRODUCTOS_ACCESO_PATH) return showProductosAcceso;
    if (ADMIN_ONLY_PATHS.includes(item.path)) return isAdmin;
    return true;
  });
}

/**
 * Devuelve el ítem de navegación que coincide con la pathname actual,
 * para breadcrumb y estado activo del menú.
 * Subrutas (ej. /actividades/nueva) hacen activo al ítem padre (Actividades).
 * Usa la lista completa para que el ítem activo se resuelva aunque el ítem esté filtrado en la lista visible.
 */
export function getActiveNavItem(
  pathname: string,
  areaId: string
): DashboardNavItem | undefined {
  const base = getDashboardRoot(areaId);
  const normalized = pathname.replace(/\/$/, "") || base;
  if (normalized === base) {
    return DASHBOARD_NAV_ITEMS[0];
  }
  // Coincidencia exacta o prefijo (subrutas): /actividades, /actividades/nueva
  return DASHBOARD_NAV_ITEMS.find(
    (item) =>
      item.path &&
      (normalized === `${base}${item.path}` ||
        normalized.startsWith(`${base}${item.path}/`))
  );
}
