"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useCreateEvent } from "../hooks/useCreateEvent";
import { useCreatePaymentIntent } from "@/features/payments/hooks/useCreatePaymentIntent";
import type { CreateEventoPayload, AgendaType } from "../types";

interface EventFormProps {
  areaId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventForm({
  areaId,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const { create, isPending, error, isError } = useCreateEvent(areaId);
  const createPaymentIntent = useCreatePaymentIntent(areaId);
  const [actividadId, setActividadId] = useState("");
  const [prestadorId, setPrestadorId] = useState("");
  const [date, setDate] = useState("");
  const [agendaType, setAgendaType] = useState<AgendaType>("HORARIO_LIBRE");
  const [bloqueId, setBloqueId] = useState("");
  const [startTime, setStartTime] = useState("09:00:00");
  const [endTime, setEndTime] = useState("12:00:00");
  const [peopleCount, setPeopleCount] = useState(1);
  const [paymentRequired, setPaymentRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let payload: CreateEventoPayload;
    if (agendaType === "BLOQUES") {
      payload = {
        actividadId,
        prestadorId,
        date,
        agendaType: "BLOQUES",
        bloqueId,
        peopleCount: peopleCount || 1,
        paymentRequired,
      };
    } else {
      payload = {
        actividadId,
        prestadorId,
        date,
        agendaType: "HORARIO_LIBRE",
        startTime,
        endTime,
        peopleCount: peopleCount || 1,
        paymentRequired,
      };
    }
    try {
      const evento = await create(payload);
      if (paymentRequired && evento?.id) {
        try {
          const paymentData = await createPaymentIntent.mutateAsync(evento.id);
          if (paymentData.checkoutUrl) {
            window.location.href = paymentData.checkoutUrl;
            return;
          }
        } catch (paymentErr) {
          console.error("Error al crear intención de pago:", paymentErr);
        }
      }
      onSuccess?.();
    } catch {
      // Error ya expuesto por isError/error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {isError && error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {getApiErrorMessage(error)}
        </p>
      )}

      <div>
        <label htmlFor="actividadId" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          ID de actividad
        </label>
        <input
          id="actividadId"
          type="text"
          value={actividadId}
          onChange={(e) => setActividadId(e.target.value)}
          required
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div>
        <label htmlFor="prestadorId" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          ID de prestador
        </label>
        <input
          id="prestadorId"
          type="text"
          value={prestadorId}
          onChange={(e) => setPrestadorId(e.target.value)}
          required
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div>
        <label htmlFor="date" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Fecha (YYYY-MM-DD)
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div>
        <label htmlFor="agendaType" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Tipo de agenda
        </label>
        <select
          id="agendaType"
          value={agendaType}
          onChange={(e) => setAgendaType(e.target.value as AgendaType)}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="HORARIO_LIBRE">Horario libre</option>
          <option value="BLOQUES">Bloques</option>
        </select>
      </div>

      {agendaType === "BLOQUES" && (
        <div>
          <label htmlFor="bloqueId" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            ID de bloque
          </label>
          <input
            id="bloqueId"
            type="text"
            value={bloqueId}
            onChange={(e) => setBloqueId(e.target.value)}
            required
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      )}

      {agendaType === "HORARIO_LIBRE" && (
        <>
          <div>
            <label htmlFor="startTime" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Hora inicio (HH:mm:ss)
            </label>
            <input
              id="startTime"
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="09:00:00"
              className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Hora fin (HH:mm:ss)
            </label>
            <input
              id="endTime"
              type="text"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="12:00:00"
              className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="peopleCount" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Número de personas
        </label>
        <input
          id="peopleCount"
          type="number"
          min={1}
          value={peopleCount}
          onChange={(e) => setPeopleCount(Number(e.target.value) || 1)}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="paymentRequired"
          type="checkbox"
          checked={paymentRequired}
          onChange={(e) => setPaymentRequired(e.target.checked)}
          className="rounded border-slate-300"
        />
        <label htmlFor="paymentRequired" className="text-sm text-slate-700 dark:text-slate-300">
          Requiere pago
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
        >
          {isPending ? "Creando…" : "Crear evento"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
