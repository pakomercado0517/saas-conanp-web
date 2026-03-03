import Link from "next/link";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { EvidenciasPageContent } from "./EvidenciasPageContent";

type PageProps = {
  params: Promise<{ areaId: string; eventoId: string }>;
};

export default async function EvidenciasPage({ params }: PageProps) {
  const { areaId, eventoId } = await params;
  const eventosHref = getDashboardHref(areaId, "/eventos");
  const inicioHref = getDashboardHref(areaId, "");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href={inicioHref} className="underline hover:no-underline">
          Inicio
        </Link>
        <span>/</span>
        <Link href={eventosHref} className="underline hover:no-underline">
          Eventos
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300">
          Evidencias
        </span>
      </div>

      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Evidencias del evento
      </h1>

      <EvidenciasPageContent areaId={areaId} eventoId={eventoId} />

      <p className="text-sm text-slate-500">
        <Link href={eventosHref} className="underline hover:no-underline">
          Volver a eventos
        </Link>
      </p>
    </div>
  );
}
