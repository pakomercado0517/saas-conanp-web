/** Query keys para listados de activos por prestador en una organización (ANP). */
export const PRESTADOR_ACTIVOS_OWNED_QUERY_PREFIX = [
  "activos",
  "prestador-owned",
] as const;

export function prestadorActivosOwnedQueryKey(
  areaId: string,
  prestadorId: string
): readonly ["activos", "prestador-owned", string, string] {
  return [...PRESTADOR_ACTIVOS_OWNED_QUERY_PREFIX, areaId, prestadorId];
}
