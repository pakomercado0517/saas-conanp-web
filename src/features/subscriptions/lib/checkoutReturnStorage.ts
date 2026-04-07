import {
  CHECKOUT_RETURN_AREA_ID_KEY,
  CHECKOUT_RETURN_DEPENDENCIA_ID_KEY,
} from "../types";

export type CheckoutReturnSnapshot = {
  areaId: string | null;
  dependenciaId: string | null;
};

/** Referencia estable para servidor e igualdad en cliente (vacío). */
const EMPTY_CHECKOUT_SNAPSHOT: CheckoutReturnSnapshot = Object.freeze({
  areaId: null,
  dependenciaId: null,
});

/**
 * `useSyncExternalStore` exige que `getSnapshot` devuelva la misma referencia si
 * los datos no cambiaron; sin esto, cada lectura crea un objeto nuevo y React
 * re-renderiza en bucle.
 */
let checkoutSnapshotCache: CheckoutReturnSnapshot = EMPTY_CHECKOUT_SNAPSHOT;

export function persistCheckoutReturnContext(
  areaId: string,
  dependenciaId: string | null | undefined
): void {
  try {
    sessionStorage.setItem(CHECKOUT_RETURN_AREA_ID_KEY, areaId);
    if (dependenciaId != null && dependenciaId !== "") {
      sessionStorage.setItem(CHECKOUT_RETURN_DEPENDENCIA_ID_KEY, dependenciaId);
    } else {
      sessionStorage.removeItem(CHECKOUT_RETURN_DEPENDENCIA_ID_KEY);
    }
  } catch {
    // ignore
  }
}

export function readCheckoutReturnContext(): {
  areaId: string | null;
  dependenciaId: string | null;
} {
  try {
    const areaId = sessionStorage.getItem(CHECKOUT_RETURN_AREA_ID_KEY);
    const dep = sessionStorage.getItem(CHECKOUT_RETURN_DEPENDENCIA_ID_KEY);
    return {
      areaId: areaId?.trim() ? areaId.trim() : null,
      dependenciaId: dep?.trim() ? dep.trim() : null,
    };
  } catch {
    return { areaId: null, dependenciaId: null };
  }
}

export function clearCheckoutReturnStorage(): void {
  try {
    sessionStorage.removeItem(CHECKOUT_RETURN_AREA_ID_KEY);
    sessionStorage.removeItem(CHECKOUT_RETURN_DEPENDENCIA_ID_KEY);
  } catch {
    // ignore
  }
  checkoutSnapshotCache = EMPTY_CHECKOUT_SNAPSHOT;
}
/** Para `useSyncExternalStore` (lectura de sessionStorage en el cliente sin efectos). */
/** sessionStorage no emite eventos en el mismo tab; la firma la exige `useSyncExternalStore`. */
export function subscribeCheckoutReturnNoop(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- requerido por useSyncExternalStore
  _onStoreChange: () => void
): () => void {
  return () => {};
}

export function getCheckoutReturnServerSnapshot(): CheckoutReturnSnapshot {
  return EMPTY_CHECKOUT_SNAPSHOT;
}

export function getCheckoutReturnClientSnapshot(): CheckoutReturnSnapshot {
  if (typeof window === "undefined") {
    return EMPTY_CHECKOUT_SNAPSHOT;
  }
  const fresh = readCheckoutReturnContext();
  if (
    checkoutSnapshotCache.areaId === fresh.areaId &&
    checkoutSnapshotCache.dependenciaId === fresh.dependenciaId
  ) {
    return checkoutSnapshotCache;
  }
  const next: CheckoutReturnSnapshot =
    fresh.areaId === null && fresh.dependenciaId === null
      ? EMPTY_CHECKOUT_SNAPSHOT
      : {
          areaId: fresh.areaId,
          dependenciaId: fresh.dependenciaId,
        };
  checkoutSnapshotCache = next;
  return checkoutSnapshotCache;
}