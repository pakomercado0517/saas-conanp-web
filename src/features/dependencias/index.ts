export type {
  Dependencia,
  DependenciaArea,
  DependenciaInvitation,
  CreateDependenciaPayload,
  CreateDependenciaAreaPayload,
  CreateDependenciaInvitationPayload,
  ListDependenciasParams,
  ListDependenciaAreasParams,
  ListDependenciaInvitationsParams,
} from "./types";

export {
  listDependencias,
  getDependencia,
  createDependencia,
  listDependenciaAreas,
  createDependenciaArea,
  listDependenciaInvitations,
  createDependenciaInvitation,
  revokeDependenciaInvitation,
} from "./services/dependencias.api";
