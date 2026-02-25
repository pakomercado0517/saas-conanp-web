import { NuevoEventoContent } from "./NuevoEventoContent";

type PageProps = {
  params: Promise<{ areaId: string }>;
};

export default async function NuevoEventoPage({ params }: PageProps) {
  const { areaId } = await params;
  return <NuevoEventoContent areaId={areaId} />;
}
