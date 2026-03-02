import { CreateDependenciaPage } from "@/features/dependencias/components/CreateDependenciaPage";

export const metadata = {
  title: "Nueva dependencia | CONANP ERP",
  description:
    "Crea una nueva dependencia para gestionar sus Áreas Naturales Protegidas en la plataforma CONANP ERP.",
};

export default function NuevaDependenciaPage() {
  return <CreateDependenciaPage />;
}

