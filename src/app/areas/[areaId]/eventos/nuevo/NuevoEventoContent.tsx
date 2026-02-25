"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { EventForm } from "@/features/events/components/EventForm";

interface NuevoEventoContentProps {
  areaId: string;
}

export function NuevoEventoContent({ areaId }: NuevoEventoContentProps) {
  const router = useRouter();
  const eventosHref = getDashboardHref(areaId, "/eventos");
  const inicioHref = getDashboardHref(areaId, "");

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Nuevo evento
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
