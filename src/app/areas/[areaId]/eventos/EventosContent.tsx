"use client";

import Link from "next/link";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { EventList } from "@/features/events/components/EventList";

interface EventosContentProps {
  areaId: string;
}

export function EventosContent({ areaId }: EventosContentProps) {
  const nuevoHref = getDashboardHref(areaId, "/eventos/nuevo");
  const inicioHref = getDashboardHref(areaId, "");

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Eventos
        </h1>
        <Link
          href={nuevoHref}
          className="inline-flex justify-center rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Nuevo evento
        </Link>
      </div>

      <EventList areaId={areaId} />

      <p className="text-sm text-slate-500">
        <Link href={inicioHref} className="underline hover:no-underline">
          Volver al inicio del área
        </Link>
      </p>
    </div>
  );
}
