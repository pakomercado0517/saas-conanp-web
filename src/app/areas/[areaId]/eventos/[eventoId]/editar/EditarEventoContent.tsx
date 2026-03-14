"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/shared/types/api";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { EventForm } from "@/features/events/components/EventForm";
import { useEvento } from "@/features/events/hooks/useEvento";

interface EditarEventoContentProps {
  areaId: string;
  eventoId: string;
}

export function EditarEventoContent({
  areaId,
  eventoId,
}: EditarEventoContentProps) {
  const router = useRouter();
  const eventosHref = getDashboardHref(areaId, "/eventos");
  const inicioHref = getDashboardHref(areaId, "");

  const { data: evento, isLoading, isError, error } = useEvento(
    areaId,
    eventoId
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <p className="text-sm text-slate-500">Cargando evento…</p>
        <Link href={eventosHref} className="text-sm underline">
          Volver a eventos
        </Link>
      </div>
    );
  }

  if (isError && error) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <p className="text-sm text-red-600 dark:text-red-400">
          {getApiErrorMessage(error)}
        </p>
        <Link href={eventosHref} className="text-sm underline">
          Volver a eventos
        </Link>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <p className="text-sm text-slate-500">No se encontró el evento.</p>
        <Link href={eventosHref} className="text-sm underline">
          Volver a eventos
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Editar evento
        </h1>
        <Link
          href={eventosHref}
          className="text-sm text-slate-600 underline hover:no-underline dark:text-slate-400"
        >
          Volver a eventos
        </Link>
      </div>

      <EventForm
        areaId={areaId}
        evento={evento}
        onSuccess={() => router.push(eventosHref)}
        onCancel={() => router.push(eventosHref)}
      />

      <p className="text-sm text-slate-500">
        <Link href={inicioHref} className="underline hover:no-underline">
          Volver al inicio del área
        </Link>
      </p>
    </div>
  );
}
