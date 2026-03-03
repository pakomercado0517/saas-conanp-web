/**
 * Mapea códigos de error del backend a acciones sugeridas para la UI.
 * Prioridad: siempre mostrar el message del backend; estas acciones complementan con CTAs.
 */

export interface SuggestedAction {
  label: string;
  href?: string;
  /** Si href requiere areaId, se usa este placeholder que el consumidor reemplazará */
  hrefTemplate?: string;
}

const ERROR_ACTIONS: Record<string, SuggestedAction> = {
  SUBSCRIPTION_REQUIRED: {
    label: "Ver planes y contratar",
    hrefTemplate: "/areas/{areaId}/suscripcion",
  },
  PLAN_INACTIVE: {
    label: "Actualizar plan",
    hrefTemplate: "/areas/{areaId}/suscripcion",
  },
  SUBSCRIPTION_CONFLICT: {
    label: "Revisar suscripción",
    hrefTemplate: "/areas/{areaId}/suscripcion",
  },
  VERIFICATION_REQUIRED: {
    label: "Verificar correo",
    href: "/auth/verify-email",
  },
  EMAIL_NOT_VERIFIED: {
    label: "Verificar correo",
    href: "/auth/verify-email",
  },
  INVALID_CREDENTIALS: {
    label: "¿Olvidaste tu contraseña?",
    href: "/auth/forgot-password",
  },
};

/**
 * Devuelve la acción sugerida para un código de error, o null si no hay mapeo.
 * @param code - Código de error del backend (ej. SUBSCRIPTION_REQUIRED)
 * @param areaId - ID del área para reemplazar en hrefTemplate cuando aplique
 */
export function getSuggestedActionForCode(
  code: string | undefined,
  areaId?: string
): SuggestedAction | null {
  if (!code) return null;
  const action = ERROR_ACTIONS[code];
  if (!action) return null;
  if (action.href) return action;
  if (action.hrefTemplate && areaId) {
    return {
      ...action,
      href: action.hrefTemplate.replace("{areaId}", areaId),
    };
  }
  return action;
}
