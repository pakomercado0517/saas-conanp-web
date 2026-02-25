export const ORGANIZATIONS_FEATURE_KEY = "organizations";
export { OrganizationSelector } from "./components/OrganizationSelector";
export { useOrganizations } from "./hooks/useOrganizations";
export { useOrganization } from "./hooks/useOrganization";
export { useOrganizationConfigAcceso } from "./hooks/useOrganizationConfigAcceso";
export {
  AreaContextProvider,
  useAreaContext,
  useAreaContextOptional,
} from "./context/AreaContext";
export type { AreaContextValue } from "./context/AreaContext";
export type {
  Organization,
  ListOrganizationsResponse,
  ConfigAccesoData,
  GetOrganizationResponse,
  GetConfigAccesoResponse,
} from "./types";
