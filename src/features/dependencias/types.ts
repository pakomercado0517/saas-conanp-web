import type { EcosystemType, Organization } from "@/features/organizations/types";
import type { MembershipRole } from "@/features/memberships/types";

export interface Dependencia {
  id: string;
  name: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DependenciaArea extends Organization {
  dependenciaId: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Payloads ──

export interface CreateDependenciaPayload {
  name: string;
}

export interface CreateDependenciaAreaPayload {
  name: string;
  ecosystem_type: EcosystemType;
}

export interface CreateDependenciaInvitationPayload {
  email: string;
  role: MembershipRole;
}

// ── Responses ──

export interface ListDependenciasResponse {
  success: true;
  data: Dependencia[];
  pagination: PaginationMeta;
  message?: string;
}

export interface GetDependenciaResponse {
  success: true;
  data: Dependencia;
  message?: string;
}

export interface CreateDependenciaResponse {
  success: true;
  data: Dependencia;
  message?: string;
}

export interface ListDependenciaAreasResponse {
  success: true;
  data: DependenciaArea[];
  pagination: PaginationMeta;
  message?: string;
}

export interface CreateDependenciaAreaResponse {
  success: true;
  data: DependenciaArea;
  message?: string;
}

export interface DependenciaInvitation {
  id: string;
  dependenciaId: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  invitedBy?: string;
  createdAt: string;
  updatedAt: string;
  Dependencia?: { id: string; name: string };
  InvitedByUser?: { id: string; name: string; email: string };
}

export interface ListDependenciaInvitationsResponse {
  success: true;
  data: DependenciaInvitation[];
  pagination: PaginationMeta;
  message?: string;
}

export interface CreateDependenciaInvitationResponse {
  success: true;
  data: DependenciaInvitation;
  message?: string;
}

// ── Query params ──

export interface ListDependenciasParams {
  page?: number;
  limit?: number;
  name?: string;
}

export interface ListDependenciaAreasParams {
  page?: number;
  limit?: number;
}

export interface ListDependenciaInvitationsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "accepted" | "expired" | "revoked";
}
