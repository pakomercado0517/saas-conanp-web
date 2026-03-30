import { NuevoPrestadorDependenciaPage } from "./NuevoPrestadorDependenciaPage";

export const metadata = {
  title: "Nuevo prestador | Dependencia | CONANP ERP",
  description: "Dar de alta un prestador en un área de la dependencia",
};

export default async function Page({
  params,
}: {
  params: Promise<{ dependenciaId: string }>;
}) {
  const { dependenciaId } = await params;
  return <NuevoPrestadorDependenciaPage dependenciaId={dependenciaId} />;
}
