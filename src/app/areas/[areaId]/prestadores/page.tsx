import { PrestadoresAreaRedirect } from "./PrestadoresAreaRedirect";

type PageProps = {
  params: Promise<{ areaId: string }>;
};

export default async function PrestadoresPage({ params }: PageProps) {
  const { areaId } = await params;
  return <PrestadoresAreaRedirect areaId={areaId} />;
}
