import { PrestadorDependenciaDetailPage } from "./PrestadorDependenciaDetailPage";

export const metadata = {
  title: "Prestador | Dependencia | CONANP ERP",
  description: "Detalle y permisos del prestador",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ dependenciaId: string; prestadorId: string }>;
  searchParams: Promise<{ areaId?: string }>;
}) {
  const { dependenciaId, prestadorId } = await params;
  const sp = await searchParams;
  const areaIdHint =
    typeof sp.areaId === "string" && sp.areaId.length > 0 ? sp.areaId : null;

  return (
    <PrestadorDependenciaDetailPage
      dependenciaId={dependenciaId}
      prestadorId={prestadorId}
      areaIdHint={areaIdHint}
    />
  );
}
