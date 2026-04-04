import { DependenciaSuscripcionPage } from "./DependenciaSuscripcionPage";

export const metadata = {
  title: "Suscripción | Dependencia | CONANP ERP",
  description: "Administración del plan y facturación de la dependencia",
};

export default async function Page({
  params,
}: {
  params: Promise<{ dependenciaId: string }>;
}) {
  const { dependenciaId } = await params;
  return <DependenciaSuscripcionPage dependenciaId={dependenciaId} />;
}
