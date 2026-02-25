export type MembershipRole = "admin" | "gestor" | "prestador" | "observador";
export type MembershipStatus = "activo" | "inactivo" | "suspendido";

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: MembershipRole;
  status: MembershipStatus;
  createdAt: string;
  updatedAt: string;
  User?: { id: string; email: string; name: string };
  Organization?: { id: string; name: string };
}

export interface ListMembershipsParams {
  page?: number;
  limit?: number;
  sortBy?: "role" | "status" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  role?: MembershipRole;
  status?: MembershipStatus;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListMembershipsResponse {
  success: true;
  data: Membership[];
  pagination: PaginationMeta;
  message?: string;
}
