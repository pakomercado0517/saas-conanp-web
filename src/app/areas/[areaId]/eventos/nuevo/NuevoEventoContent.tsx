"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { EventForm } from "@/features/events/components/EventForm";
import { useCreatePaymentIntent } from "@/features/payments/hooks/useCreatePaymentIntent";
import type { EventoOperativo } from "@/features/events/types";

interface NuevoEventoContentProps {
  areaId: string;
}

export function NuevoEventoContent({ areaId }: NuevoEventoContentProps) {
  const router = useRouter();
  const [createdEventoWithPayment, setCreatedEventoWithPayment] =
    useState<EventoOperativo | null>(null);

  const eventosHref = getDashboardHref(areaId, "/eventos");
  const inicioHref = getDashboardHref(areaId, "");
  const createPaymentIntent = useCreatePaymentIntent(areaId);

  const handleSuccess = (createdEvento?: EventoOperativo) => {
    if (
      createdEvento?.id &&
      createdEvento.paymentRequired &&
      !createdEvento.paidAt
    ) {
      setCreatedEventoWithPayment(createdEvento);
      return;
    }
    router.push(eventosHref);
  };

  const handlePagarAhora = async () => {
    if (!createdEventoWithPayment?.id) return;
    try {
      const data = await createPaymentIntent.mutateAsync(
        createdEventoWithPayment.id
      );
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch {
      // Error manejado por la mutación
    }
  };

  if (createdEventoWithPayment) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Evento creado. Tienes un pago pendiente.
          </p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            Puedes pagar ahora o más tarde desde el listado de eventos.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePagarAhora}
            disabled={createPaymentIntent.isPending}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
          >
            {createPaymentIntent.isPending ? "Redirigiendo…" : "Pagar ahora"}
          </button>
          <Link
            href={eventosHref}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
          >
            Volver a eventos
          </Link>
        </div>
        <p className="text-sm text-slate-500">
          <Link href={inicioHref} className="underline hover:no-underline">
            Volver al inicio del área
          </Link>
        </p>
      </div>
    );
  }

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
        onSuccess={handleSuccess}
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
