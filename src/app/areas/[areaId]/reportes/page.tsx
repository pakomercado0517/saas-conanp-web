import { ReportesContent } from "./ReportesContent";

type PageProps = {
  params: Promise<{ areaId: string }>;
};

export default async function ReportesPage({ params }: PageProps) {
  const { areaId } = await params;
  return <ReportesContent areaId={areaId} />;
}
