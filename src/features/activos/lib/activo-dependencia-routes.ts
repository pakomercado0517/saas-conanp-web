/**
 * Ruta de detalle de activo en contexto dependencia (no dashboard por ANP).
 * `areaId` es el organizationId donde vive el registro en API.
 */
export function buildActivoDependenciaDetailHref(
  dependenciaId: string,
  prestadorId: string,
  areaId: string,
  activoId: string
): string {
  const q = new URLSearchParams({ areaId });
  return `/dependencias/${dependenciaId}/prestadores/${prestadorId}/activos/${activoId}?${q.toString()}`;
}
