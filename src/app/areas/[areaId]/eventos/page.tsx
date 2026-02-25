import { EventosContent } from "./EventosContent";

type PageProps = {
  params: Promise<{ areaId: string }>;
};

export default async function EventosPage({ params }: PageProps) {
  const { areaId } = await params;
  return <EventosContent areaId={areaId} />;
}
