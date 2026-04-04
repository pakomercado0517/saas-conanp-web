import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  Home,
  ListChecks,
  Users,
  UsersRound,
} from "lucide-react";

export interface DependenciaNavItem {
  /** Ruta relativa bajo `/dependencias/:dependenciaId` (vacío = hub). */
  path: string;
  label: string;
  breadcrumbTitle?: string;
  icon: LucideIcon;
}

const DEPENDENCIA_ROUTE_PREFIX = "dependencias";

export const DEPENDENCIA_NAV_ITEMS: DependenciaNavItem[] = [
  {
    path: "",
    label: "Inicio",
    breadcrumbTitle: "Panel de dependencia",
    icon: Home,
  },
  {
    path: "/prestadores",
    label: "Prestadores",
    breadcrumbTitle: "Prestadores",
    icon: UsersRound,
  },
  {
    path: "/usuarios",
    label: "Usuarios por área",
    breadcrumbTitle: "Usuarios por área",
    icon: Users,
  },
  {
    path: "/requisitos-catalogo",
    label: "Catálogo de requisitos",
    breadcrumbTitle: "Catálogo de requisitos",
    icon: ListChecks,
  },
  {
    path: "/suscripcion",
    label: "Suscripción",
    breadcrumbTitle: "Suscripción",
    icon: CreditCard,
  },
];

/** Rutas visibles solo si el usuario es admin en al menos un área de la dependencia. */
const ADMIN_IN_ANY_AREA_PATHS = ["/usuarios", "/requisitos-catalogo", "/suscripcion"];

function getDependenciaRoot(dependenciaId: string): string {
  return `/${DEPENDENCIA_ROUTE_PREFIX}/${dependenciaId}`;
}

/**
 * Ruta absoluta para un ítem del menú de dependencia.
 */
export function getDependenciaHref(
  dependenciaId: string,
  itemPath: string
): string {
  const base = getDependenciaRoot(dependenciaId);
  return itemPath ? `${base}${itemPath}` : base;
}

/**
 * Filtra ítems según permisos (mismo criterio que accesos rápidos en el hub).
 */
export function getFilteredDependenciaNavItems(
  isAdminInAnyArea: boolean
): DependenciaNavItem[] {
  return DEPENDENCIA_NAV_ITEMS.filter((item) => {
    if (ADMIN_IN_ANY_AREA_PATHS.includes(item.path)) {
      return isAdminInAnyArea;
    }
    return true;
  });
}

/**
 * Ítem activo según pathname (incluye subrutas, p. ej. `/prestadores/nuevo`).
 * Usa la lista completa para resolver activo aunque el ítem esté filtrado en el menú visible.
 */
export function getActiveDependenciaNavItem(
  pathname: string,
  dependenciaId: string
): DependenciaNavItem | undefined {
  const base = getDependenciaRoot(dependenciaId);
  const normalized = pathname.replace(/\/$/, "") || base;

  if (normalized === base) {
    return DEPENDENCIA_NAV_ITEMS[0];
  }

  return DEPENDENCIA_NAV_ITEMS.find((item) => {
    if (!item.path) return false;
    const itemHref = `${base}${item.path}`;
    return (
      normalized === itemHref || normalized.startsWith(`${itemHref}/`)
    );
  });
}
