import { ActivosAreaRedirect } from "./ActivosAreaRedirect";

type PageProps = {
  params: Promise<{ areaId: string }>;
};

export default async function ActivosPage({ params }: PageProps) {
  const { areaId } = await params;
  return <ActivosAreaRedirect areaId={areaId} />;
}
