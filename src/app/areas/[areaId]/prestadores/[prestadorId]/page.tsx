import { PrestadorDetailAreaRedirect } from "./PrestadorDetailAreaRedirect";

type PageProps = {
  params: Promise<{ areaId: string; prestadorId: string }>;
};

export default async function PrestadorDetailPage({ params }: PageProps) {
  const { areaId, prestadorId } = await params;

  return (
    <PrestadorDetailAreaRedirect areaId={areaId} prestadorId={prestadorId} />
  );
}
