import Link from "next/link";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { ActivoDetail } from "@/features/activos/components/ActivoDetail";

type PageProps = {
  params: Promise<{ areaId: string; activoId: string }>;
};

export default async function ActivoDetailPage({ params }: PageProps) {
  const { areaId, activoId } = await params;
  const activosHref = getDashboardHref(areaId, "/activos");
  const inicioHref = getDashboardHref(areaId, "");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href={inicioHref} className="underline hover:no-underline">
          Inicio
        </Link>
        <span>/</span>
        <Link href={activosHref} className="underline hover:no-underline">
          Activos
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300">Detalle</span>
      </div>

      <ActivoDetail areaId={areaId} activoId={activoId} />

      <p className="text-sm text-slate-500">
        <Link href={activosHref} className="underline hover:no-underline">
          Volver a activos
        </Link>
      </p>
    </div>
  );
}
