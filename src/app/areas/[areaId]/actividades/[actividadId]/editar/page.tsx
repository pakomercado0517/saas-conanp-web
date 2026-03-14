import Link from "next/link";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { EditarActividadContent } from "./EditarActividadContent";

type PageProps = {
  params: Promise<{ areaId: string; actividadId: string }>;
};

export default async function EditarActividadPage({ params }: PageProps) {
  const { areaId, actividadId } = await params;
  const inicioHref = getDashboardHref(areaId, "");
  const actividadesHref = getDashboardHref(areaId, "/actividades");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href={inicioHref} className="underline hover:no-underline">
          Inicio
        </Link>
        <span>/</span>
        <Link href={actividadesHref} className="underline hover:no-underline">
          Actividades
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300">
          Editar actividad
        </span>
      </div>

      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Editar actividad
      </h1>

      <EditarActividadContent areaId={areaId} actividadId={actividadId} />

      <p className="text-sm text-slate-500">
        <Link href={actividadesHref} className="underline hover:no-underline">
          Volver a actividades
        </Link>
      </p>
    </div>
  );
}
