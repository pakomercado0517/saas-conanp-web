/** Claves de react-query para invalidación consistente del dominio permisos. */

export const PERMISOS_QUERY_PREFIX = ["permisos"] as const;

export function permisosByOrganizationKey(organizationId: string): readonly string[] {
  return [...PERMISOS_QUERY_PREFIX, organizationId, "byOrganization"];
}
