import type { SubscriptionPlan } from "../types";

/**
 * Resuelve el límite de áreas del plan desde features.limits.areas.
 * Usar en dependencias y vistas que dependan del límite de áreas por plan.
 */
export function getMaxAreas(plan: SubscriptionPlan | null | undefined): number | null {
  if (!plan?.features?.limits) return null;
  const areas = plan.features.limits.areas;
  return typeof areas === "number" ? areas : null;
}

/**
 * Límite de usuarios (columna del plan).
 */
export function getMaxUsers(plan: SubscriptionPlan | null | undefined): number | null {
  if (!plan) return null;
  const n = plan.maxUsers;
  return typeof n === "number" ? n : null;
}

/**
 * Límite de eventos (columna del plan).
 */
export function getMaxEventos(plan: SubscriptionPlan | null | undefined): number | null {
  if (!plan) return null;
  const n = plan.maxEventos;
  return typeof n === "number" ? n : null;
}

/**
 * Límite de actividades (columna del plan).
 */
export function getMaxActividades(plan: SubscriptionPlan | null | undefined): number | null {
  if (!plan) return null;
  const n = plan.maxActividades;
  return typeof n === "number" ? n : null;
}

/**
 * Límite de prestadores desde features.limits.prestadores.
 */
export function getMaxPrestadores(plan: SubscriptionPlan | null | undefined): number | null {
  if (!plan?.features?.limits) return null;
  const n = plan.features.limits.prestadores;
  return typeof n === "number" ? n : null;
}

/**
 * Límite de activos desde features.limits.activos.
 */
export function getMaxActivos(plan: SubscriptionPlan | null | undefined): number | null {
  if (!plan?.features?.limits) return null;
  const n = plan.features.limits.activos;
  return typeof n === "number" ? n : null;
}

/**
 * Límite de organizaciones/dependencias (maxOrganizations).
 */
export function getMaxOrganizations(plan: SubscriptionPlan | null | undefined): number | null {
  if (!plan) return null;
  const n = plan.maxOrganizations;
  return typeof n === "number" ? n : null;
}

export interface PlanLimitsSummary {
  maxAreas: number | null;
  maxUsers: number | null;
  maxEventos: number | null;
  maxActividades: number | null;
  maxPrestadores: number | null;
  maxActivos: number | null;
  maxOrganizations: number | null;
}

/**
 * Resumen de todos los límites del plan para uso en catálogo, dashboard o reglas de negocio.
 */
export function getPlanLimitsSummary(plan: SubscriptionPlan | null | undefined): PlanLimitsSummary {
  return {
    maxAreas: getMaxAreas(plan),
    maxUsers: getMaxUsers(plan),
    maxEventos: getMaxEventos(plan),
    maxActividades: getMaxActividades(plan),
    maxPrestadores: getMaxPrestadores(plan),
    maxActivos: getMaxActivos(plan),
    maxOrganizations: getMaxOrganizations(plan),
  };
}

/**
 * Indica si el plan tiene un límite numérico para áreas (no ilimitado).
 */
export function hasAreaLimit(plan: SubscriptionPlan | null | undefined): boolean {
  return getMaxAreas(plan) !== null;
}

/**
 * Comprueba si el conteo actual está dentro del límite de áreas del plan.
 * Si el plan no tiene límite de áreas, devuelve true (ilimitado).
 */
export function isWithinAreaLimit(
  plan: SubscriptionPlan | null | undefined,
  currentCount: number
): boolean {
  const max = getMaxAreas(plan);
  if (max === null) return true;
  return currentCount < max;
}

/**
 * Etiquetas cortas de límites para mostrar en catálogo y selector (ej. "10 usuarios", "5 áreas").
 * Solo incluye límites definidos; útil para UI sin asumir nombres de plan.
 */
export function getPlanLimitLabels(plan: SubscriptionPlan | null | undefined): string[] {
  if (!plan) return [];
  const labels: string[] = [];
  const u = getMaxUsers(plan);
  if (u !== null) labels.push(`${u} usuarios`);
  const e = getMaxEventos(plan);
  if (e !== null) labels.push(`${e} eventos`);
  const a = getMaxActividades(plan);
  if (a !== null) labels.push(`${a} actividades`);
  const areas = getMaxAreas(plan);
  if (areas !== null) labels.push(`${areas} áreas`);
  const prestadores = getMaxPrestadores(plan);
  if (prestadores !== null) labels.push(`${prestadores} prestadores`);
  const activos = getMaxActivos(plan);
  if (activos !== null) labels.push(`${activos} activos`);
  return labels;
}
