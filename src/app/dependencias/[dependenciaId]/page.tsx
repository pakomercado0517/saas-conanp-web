import { DependenciaHubPage } from "./DependenciaHubPage";

export const metadata = {
  title: "Dependencia | CONANP ERP",
  description: "Gestiona las áreas naturales protegidas de esta dependencia",
};

export default async function Page({
  params,
}: {
  params: Promise<{ dependenciaId: string }>;
}) {
  const { dependenciaId } = await params;
  return <DependenciaHubPage dependenciaId={dependenciaId} />;
}
