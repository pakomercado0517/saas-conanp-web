import { DependenciaRequisitosCatalogoPage } from "./DependenciaRequisitosCatalogoPage";

export const metadata = {
  title: "Catálogo de requisitos | Dependencia | CONANP ERP",
  description: "Catálogo de requisitos de activos por dependencia",
};

export default async function Page({
  params,
}: {
  params: Promise<{ dependenciaId: string }>;
}) {
  const { dependenciaId } = await params;
  return <DependenciaRequisitosCatalogoPage dependenciaId={dependenciaId} />;
}
