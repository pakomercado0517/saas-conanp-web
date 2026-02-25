import { apiRequest } from "@/shared/lib/api";
import type {
  ListDependenciasParams,
  ListDependenciasResponse,
  GetDependenciaResponse,
  CreateDependenciaPayload,
  CreateDependenciaResponse,
  ListDependenciaAreasParams,
  ListDependenciaAreasResponse,
  CreateDependenciaAreaPayload,
  CreateDependenciaAreaResponse,
  ListDependenciaInvitationsParams,
  ListDependenciaInvitationsResponse,
  CreateDependenciaInvitationPayload,
  CreateDependenciaInvitationResponse,
} from "../types";

const BASE = "/api/v1/dependencias";

function toQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") search.set(key, String(value));
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function listDependencias(
  params: ListDependenciasParams = {},
  accessToken?: string | null
): Promise<ListDependenciasResponse> {
  return apiRequest<ListDependenciasResponse>(`${BASE}${toQuery(params)}`, {
    method: "GET",
    accessToken,
  });
}

export async function getDependencia(
  dependenciaId: string,
  accessToken?: string | null
): Promise<GetDependenciaResponse> {
  return apiRequest<GetDependenciaResponse>(`${BASE}/${dependenciaId}`, {
    method: "GET",
    accessToken,
  });
}

export async function createDependencia(
  payload: CreateDependenciaPayload,
  accessToken?: string | null
): Promise<CreateDependenciaResponse> {
  return apiRequest<CreateDependenciaResponse>(BASE, {
    method: "POST",
    body: payload,
    accessToken,
  });
}

export async function listDependenciaAreas(
  dependenciaId: string,
  params: ListDependenciaAreasParams = {},
  accessToken?: string | null
): Promise<ListDependenciaAreasResponse> {
  return apiRequest<ListDependenciaAreasResponse>(
    `${BASE}/${dependenciaId}/areas${toQuery(params)}`,
    { method: "GET", accessToken }
  );
}

export async function createDependenciaArea(
  dependenciaId: string,
  payload: CreateDependenciaAreaPayload,
  accessToken?: string | null
): Promise<CreateDependenciaAreaResponse> {
  return apiRequest<CreateDependenciaAreaResponse>(
    `${BASE}/${dependenciaId}/areas`,
    { method: "POST", body: payload, accessToken }
  );
}

export async function listDependenciaInvitations(
  dependenciaId: string,
  params: ListDependenciaInvitationsParams = {},
  accessToken?: string | null
): Promise<ListDependenciaInvitationsResponse> {
  return apiRequest<ListDependenciaInvitationsResponse>(
    `${BASE}/${dependenciaId}/invitations${toQuery(params)}`,
    { method: "GET", accessToken }
  );
}

export async function createDependenciaInvitation(
  dependenciaId: string,
  payload: CreateDependenciaInvitationPayload,
  accessToken?: string | null
): Promise<CreateDependenciaInvitationResponse> {
  return apiRequest<CreateDependenciaInvitationResponse>(
    `${BASE}/${dependenciaId}/invitations`,
    { method: "POST", body: payload, accessToken }
  );
}

export async function revokeDependenciaInvitation(
  dependenciaId: string,
  invitationId: string,
  accessToken?: string | null
): Promise<void> {
  await apiRequest<void>(
    `${BASE}/${dependenciaId}/invitations/${invitationId}/revoke`,
    { method: "POST", accessToken }
  );
}
