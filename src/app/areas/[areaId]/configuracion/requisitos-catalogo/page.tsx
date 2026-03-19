import { RequisitosCatalogoContent } from "./RequisitosCatalogoContent";

type PageProps = {
  params: Promise<{ areaId: string }>;
};

export default async function RequisitosCatalogoPage({ params }: PageProps) {
  const { areaId } = await params;
  return <RequisitosCatalogoContent areaId={areaId} />;
}
