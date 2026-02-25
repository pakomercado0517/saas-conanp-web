import { DependenciaSelector } from "@/features/dependencias/components/DependenciaSelector";

export const metadata = {
  title: "Seleccionar dependencia | CONANP ERP",
  description:
    "Elige una dependencia para gestionar sus áreas naturales protegidas",
};

export default function SelectOrganizationPage() {
  return <DependenciaSelector />;
}
