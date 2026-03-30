import { PrestadoresDependenciaPage } from "./PrestadoresDependenciaPage";

export const metadata = {
  title: "Prestadores | Dependencia | CONANP ERP",
  description: "Prestadores de la dependencia",
};

export default async function Page({
  params,
}: {
  params: Promise<{ dependenciaId: string }>;
}) {
  const { dependenciaId } = await params;
  return <PrestadoresDependenciaPage dependenciaId={dependenciaId} />;
}
