import { UsuariosContent } from "@/features/memberships/components/UsuariosContent";

type PageProps = {
  params: Promise<{ areaId: string }>;
};

export default async function UsuariosPage({ params }: PageProps) {
  const { areaId } = await params;
  return <UsuariosContent areaId={areaId} />;
}
