import { OrganizationSelector } from "@/features/organizations/components/OrganizationSelector";

export const metadata = {
  title: "Seleccionar organización | CONANP ERP",
  description:
    "Elige un área natural protegida para comenzar la gestión administrativa",
};

export default function SelectOrganizationPage() {
  return <OrganizationSelector />;
}
