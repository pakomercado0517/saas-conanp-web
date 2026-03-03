import { PrestadorDetail } from "@/features/prestadores/components/PrestadorDetail";

type PageProps = {
  params: Promise<{ areaId: string; prestadorId: string }>;
};

export default async function PrestadorDetailPage({ params }: PageProps) {
  const { areaId, prestadorId } = await params;

  return <PrestadorDetail areaId={areaId} prestadorId={prestadorId} />;
}
