import Link from "next/link";
import { redirect } from "next/navigation";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { ActivoDetail } from "@/features/activos/components/ActivoDetail";
import { buildActivoDependenciaDetailHref } from "@/features/activos/lib/activo-dependencia-routes";

type PageProps = {
  params: Promise<{ areaId: string; activoId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstString(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value[0] != null) return value[0];
  return undefined;
}

export default async function ActivoDetailPage({ params, searchParams }: PageProps) {
  const { areaId, activoId } = await params;
  const sp = await searchParams;
  const dependenciaId = firstString(sp.dependenciaId);
  const prestadorId = firstString(sp.prestadorId);

  if (dependenciaId && prestadorId) {
    redirect(
      buildActivoDependenciaDetailHref(
        dependenciaId,
        prestadorId,
        areaId,
        activoId
      )
    );
  }

  const inicioHref = getDashboardHref(areaId, "");
  const activosHref = getDashboardHref(areaId, "/activos");

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
