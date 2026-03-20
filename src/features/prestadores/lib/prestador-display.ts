import type { Prestador } from "../types";

/** Etiqueta legible para listas y selectores (API puede traer nombre en `User`). */
export function getPrestadorDisplayName(p: Prestador): string {
  return p.name ?? p.User?.name ?? p.email ?? p.User?.email ?? p.userId ?? "—";
}

export function getPrestadorDisplayEmail(p: Prestador): string {
  return p.email ?? p.User?.email ?? "—";
}
