import { DependenciaUsuariosPage } from "./DependenciaUsuariosPage";

export const metadata = {
  title: "Usuarios por área | Dependencia | CONANP ERP",
  description: "Acceso a membresías por ANP",
};

export default async function Page({
  params,
}: {
  params: Promise<{ dependenciaId: string }>;
}) {
  const { dependenciaId } = await params;
  return <DependenciaUsuariosPage dependenciaId={dependenciaId} />;
}
