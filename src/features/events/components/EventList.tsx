"use client";

import { useState } from "react";
import Link from "next/link";
import { getApiErrorMessage } from "@/shared/types/api";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { EmptyState } from "@/shared/components/EmptyState";
import { useCreatePaymentIntent } from "@/features/payments/hooks/useCreatePaymentIntent";
import { useEvents } from "../hooks/useEvents";
import { useCancelEvento } from "../hooks/useCancelEvento";
import type { EventoOperativo, EventoStatus } from "../types";

interface EventListProps {
  areaId: string;
}

const STATUS_LABELS: Record<EventoStatus, string> = {
  programado: "Programado",
  en_curso: "En curso",
  completado: "Completado",
  cancelado: "Cancelado",
};

function canEditEvent(status: EventoStatus): boolean {
  return status === "programado";
}

function canCancelEvent(status: EventoStatus): boolean {
  return status === "programado" || status === "en_curso";
}

interface EventRowProps {
  areaId: string;
  ev: EventoOperativo;
}

function EventRow({ areaId, ev }: EventRowProps) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const cancelMutation = useCancelEvento(areaId, ev.id);
  const createPaymentIntent = useCreatePaymentIntent(areaId);

  const handleCancel = async () => {
    if (!confirmCancel) {
      setConfirmCancel(true);
      return;
    }
    await cancelMutation.cancel();
    setConfirmCancel(false);
  };

  const handlePagar = async () => {
    try {
      const data = await createPaymentIntent.mutateAsync(ev.id);
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch {
      // Error shown by mutation
    }
  };

  const prestadorLabel =
    (ev as EventoOperativo & { PrestadorProfile?: { name?: string } }).PrestadorProfile
      ?.name ?? ev.prestadorId;
  const horarioLabel = ev.Bloque
    ? `${ev.Bloque.startTime?.slice(0, 5) ?? ev.Bloque.startTime} – ${ev.Bloque.endTime?.slice(0, 5) ?? ev.Bloque.endTime}`
    : ev.startTime && ev.endTime
      ? `${ev.startTime.slice(0, 5)} – ${ev.endTime.slice(0, 5)}`
      : "—";

  return (
    <tr key={ev.id}>
      <td className="px-4 py-2 text-sm">
        {ev.date
          ? new Date(ev.date).toLocaleDateString("es", { dateStyle: "short" })
          : "—"}
      </td>
      <td className="px-4 py-2 text-sm">
        {ev.Actividad?.name ?? ev.actividadId}
      </td>
      <td className="px-4 py-2 text-sm">{prestadorLabel}</td>
      <td className="px-4 py-2 text-sm">{ev.peopleCount}</td>
      <td className="px-4 py-2 text-sm">{horarioLabel}</td>
      <td className="px-4 py-2 text-sm">{STATUS_LABELS[ev.status] ?? ev.status}</td>
      <td className="px-4 py-2 text-sm">
        {ev.paymentRequired ? (
          ev.paidAt ? (
            <span className="text-green-600 dark:text-green-400">Pagado</span>
          ) : (
            <button
              type="button"
              onClick={handlePagar}
              disabled={createPaymentIntent.isPending}
              className="text-sm font-medium text-(--cyan-accent) hover:underline disabled:opacity-50"
            >
              {createPaymentIntent.isPending ? "Redirigiendo…" : "Pagar"}
            </button>
          )
        ) : (
          <span className="text-slate-500">—</span>
        )}
      </td>
      <td className="px-4 py-2">
        <div className="flex flex-wrap gap-2">
          {canEditEvent(ev.status) && (
            <Link
              href={getDashboardHref(areaId, `/eventos/${ev.id}/editar`)}
              className="text-sm font-medium text-(--cyan-accent) hover:underline"
            >
              Editar
            </Link>
          )}
          {canCancelEvent(ev.status) && (
            <>
              {confirmCancel ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    {cancelMutation.isPending ? "Cancelando…" : "Confirmar cancelar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(false)}
                    className="text-sm text-slate-600 hover:underline"
                  >
                    No
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmCancel(true)}
                  className="text-sm font-medium text-amber-600 hover:underline"
                >
                  Cancelar
                </button>
              )}
            </>
          )}
          <Link
            href={getDashboardHref(areaId, `/eventos/${ev.id}/evidencias`)}
            className="text-sm font-medium text-(--cyan-accent) hover:underline"
          >
            Evidencias
          </Link>
        </div>
      </td>
    </tr>
  );
}

export function EventList({ areaId }: EventListProps) {
  const { data: events, isLoading, isError, error } = useEvents(areaId);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando eventos…</p>;
  }

  if (isError && error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  if (!events?.length) {
    return (
      <EmptyState
        message="No hay eventos en esta área. Crea uno para comenzar."
        action={{
          label: "Crear evento",
          href: getDashboardHref(areaId, "/eventos/nuevo"),
        }}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Fecha
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Actividad
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Prestador
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Personas
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Horario
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Estado
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Pago
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
          {events.map((ev) => (
            <EventRow key={ev.id} areaId={areaId} ev={ev} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
