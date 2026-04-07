/**
 * Obtiene el valor del requisito con clave `nombre` (catálogo estándar).
 */
export function findNombreFromRequisitos(
  requisitos: { clave: string; valor: string }[]
): string | null {
  for (const r of requisitos) {
    const key = r.clave.trim().toLowerCase();
    if (key === "nombre") {
      const v = r.valor?.trim();
      return v ? v : null;
    }
  }
  return null;
}
