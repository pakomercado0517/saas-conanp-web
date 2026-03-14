import { EditarEventoContent } from "./EditarEventoContent";

type PageProps = {
  params: Promise<{ areaId: string; eventoId: string }>;
};

export default async function EditarEventoPage({ params }: PageProps) {
  const { areaId, eventoId } = await params;
  return <EditarEventoContent areaId={areaId} eventoId={eventoId} />;
}
