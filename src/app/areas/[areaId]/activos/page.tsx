import Link from "next/link";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { ActivosList } from "@/features/activos/components/ActivosList";

type PageProps = {
  params: Promise<{ areaId: string }>;
};

export default async function ActivosPage({ params }: PageProps) {
  const { areaId } = await params;
  const inicioHref = getDashboardHref(areaId, "");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Activos y requisitos
      </h1>

      <ActivosList areaId={areaId} />

      <p className="text-sm text-slate-500">
        <Link href={inicioHref} className="underline hover:no-underline">
          Volver al inicio del área
        </Link>
      </p>
    </div>
  );
}
