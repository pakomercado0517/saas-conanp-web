import { apiRequest } from "@/shared/lib/api";

export interface ActividadItem {
  id: string;
  name: string;
  agendaType?: "BLOQUES" | "HORARIO_LIBRE";
}

interface ListActividadesResponse {
  success: true;
  data: ActividadItem[];
  message?: string;
}

const BASE = "/api/v1/organizations";

export async function listActividades(
  organizationId: string
): Promise<ActividadItem[]> {
  try {
    const res = await apiRequest<ListActividadesResponse>(
      `${BASE}/${organizationId}/actividades`,
      { method: "GET" }
    );
    return (res as ListActividadesResponse).data ?? [];
  } catch {
    return [];
  }
}
