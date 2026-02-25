import { ProductosAccesoContent } from "./ProductosAccesoContent";

type PageProps = {
  params: Promise<{ areaId: string }>;
};

export default async function ProductosAccesoPage({ params }: PageProps) {
  const { areaId } = await params;
  return <ProductosAccesoContent areaId={areaId} />;
}
