"use client";

import type { Resolver } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getApiErrorMessage } from "@/shared/types/api";
import { useActividades } from "@/features/activities/hooks/useActividades";
import { usePrestadores } from "@/features/prestadores/hooks/usePrestadores";
import { useBloques } from "@/features/blocks/hooks/useBloques";
import { useCreateEvent } from "../hooks/useCreateEvent";
import { useUpdateEvento } from "../hooks/useUpdateEvento";
import {
  createEventoSchema,
  updateEventoSchema,
} from "../schemas/event.schema";
import type { CreateEventoFormData, UpdateEventoFormData } from "../schemas/event.schema";
import type { EventoOperativo } from "../types";
import type { CreateEventoPayload } from "../types";

const inputClass =
  "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const labelClass =
  "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

/** Convierte HH:mm a HH:mm:ss si hace falta. */
function toTimeSeconds(v: string): string {
  if (!v) return v;
  const parts = v.split(":");
  if (parts.length === 2) return `${v}:00`;
  return v;
}

const EVENT_DATE_DAYS_AHEAD = 20;

function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getEventDateMinMax(): { min: string; max: string } {
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + EVENT_DATE_DAYS_AHEAD);
  return { min: toYYYYMMDD(today), max: toYYYYMMDD(maxDate) };
}

interface EventFormProps {
  areaId: string;
  evento?: EventoOperativo | null;
  /** Se invoca al guardar; en creación puede recibir el evento creado (p. ej. para flujo de pago). */
  onSuccess?: (createdEvento?: EventoOperativo) => void;
  onCancel?: () => void;
}

export function EventForm({
  areaId,
  evento,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const isEdit = Boolean(evento?.id);

  const { data: actividades } = useActividades(areaId, { active: true });
  const { data: prestadores } = usePrestadores(areaId);

  const form = useForm<CreateEventoFormData>({
    resolver: zodResolver(
      isEdit ? updateEventoSchema : createEventoSchema
    ) as Resolver<CreateEventoFormData>,
    defaultValues: {
      actividadId: evento?.actividadId ?? "",
      prestadorId: evento?.prestadorId ?? "",
      date: evento?.date ?? "",
      agendaType: evento?.bloqueId ? "BLOQUES" : "HORARIO_LIBRE",
      bloqueId: evento?.bloqueId ?? "",
      startTime: evento?.startTime?.slice(0, 5) ?? "09:00",
      endTime: evento?.endTime?.slice(0, 5) ?? "12:00",
      peopleCount: evento?.peopleCount ?? 1,
      paymentRequired: evento?.paymentRequired ?? false,
    },
  });

  const createMutation = useCreateEvent(areaId);
  const updateMutation = useUpdateEvento(areaId, evento?.id ?? "");

  const actividadId = useWatch({
    control: form.control,
    name: "actividadId",
    defaultValue: "",
  });
  const date = useWatch({
    control: form.control,
    name: "date",
    defaultValue: "",
  });
  const agendaType = useWatch({
    control: form.control,
    name: "agendaType",
    defaultValue: "HORARIO_LIBRE",
  });

  const { data: bloques, isLoading: loadingBloques } = useBloques(
    areaId,
    actividadId && date ? actividadId : null,
    date ? { date } : {}
  );

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error ?? updateMutation.error;

  const buildPayload = (data: CreateEventoFormData): CreateEventoPayload => {
    const base = {
      actividadId: data.actividadId,
      prestadorId: data.prestadorId,
      date: data.date,
      peopleCount: data.peopleCount ?? 1,
      paymentRequired: data.paymentRequired ?? false,
    };
    if (data.agendaType === "BLOQUES") {
      return { ...base, agendaType: "BLOQUES", bloqueId: data.bloqueId! };
    }
    return {
      ...base,
      agendaType: "HORARIO_LIBRE",
      startTime: toTimeSeconds(data.startTime ?? "09:00"),
      endTime: toTimeSeconds(data.endTime ?? "12:00"),
    };
  };

  const onSubmit = form.handleSubmit(async (data) => {
    const payload = buildPayload(data);
    if (isEdit) {
      await updateMutation.update(payload as UpdateEventoFormData);
      onSuccess?.();
    } else {
      const created = await createMutation.create(payload);
      onSuccess?.(created);
    }
  });

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      {error && (
        <p
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
          role="alert"
        >
          {getApiErrorMessage(error)}
        </p>
      )}

      <div>
        <label htmlFor="evento-actividadId" className={labelClass}>
          Actividad
        </label>
        <select
          id="evento-actividadId"
          {...form.register("actividadId")}
          className={inputClass}
          disabled={isEdit}
        >
          <option value="">Selecciona una actividad</option>
          {actividades?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {form.formState.errors.actividadId && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.actividadId.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="evento-prestadorId" className={labelClass}>
          Prestador
        </label>
        <select
          id="evento-prestadorId"
          {...form.register("prestadorId")}
          className={inputClass}
          disabled={isEdit}
        >
          <option value="">Selecciona un prestador</option>
          {prestadores?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name ?? p.email ?? p.id}
            </option>
          ))}
        </select>
        {form.formState.errors.prestadorId && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.prestadorId.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="evento-date" className={labelClass}>
          Fecha
        </label>
        <input
          id="evento-date"
          type="date"
          {...form.register("date")}
          className={inputClass}
          {...getEventDateMinMax()}
        />
        {form.formState.errors.date && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.date.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="evento-agendaType" className={labelClass}>
          Tipo de agenda
        </label>
        <select
          id="evento-agendaType"
          {...form.register("agendaType")}
          className={inputClass}
          disabled={isEdit}
        >
          <option value="HORARIO_LIBRE">Horario libre</option>
          <option value="BLOQUES">Bloques</option>
        </select>
      </div>

      {agendaType === "BLOQUES" && (
        <div>
          <label htmlFor="evento-bloqueId" className={labelClass}>
            Bloque
          </label>
          <select
            id="evento-bloqueId"
            {...form.register("bloqueId")}
            className={inputClass}
            disabled={isEdit}
          >
            <option value="">
              {!actividadId || !date
                ? "Selecciona actividad y fecha primero"
                : loadingBloques
                  ? "Cargando bloques…"
                  : !bloques?.length
                    ? "No hay bloques para esta fecha"
                    : "Selecciona un bloque"}
            </option>
            {bloques?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.startTime?.slice(0, 5) ?? b.startTime} – {b.endTime?.slice(0, 5) ?? b.endTime}
              </option>
            ))}
          </select>
          {form.formState.errors.bloqueId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.bloqueId.message}
            </p>
          )}
        </div>
      )}

      {agendaType === "HORARIO_LIBRE" && (
        <>
          <div>
            <label htmlFor="evento-startTime" className={labelClass}>
              Hora inicio
            </label>
            <input
              id="evento-startTime"
              type="time"
              {...form.register("startTime")}
              className={inputClass}
            />
            {form.formState.errors.startTime && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.startTime.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="evento-endTime" className={labelClass}>
              Hora fin
            </label>
            <input
              id="evento-endTime"
              type="time"
              {...form.register("endTime")}
              className={inputClass}
            />
            {form.formState.errors.endTime && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.endTime.message}
              </p>
            )}
          </div>
        </>
      )}

      <div>
        <label htmlFor="evento-peopleCount" className={labelClass}>
          Número de personas
        </label>
        <input
          id="evento-peopleCount"
          type="number"
          min={1}
          {...form.register("peopleCount", { valueAsNumber: true })}
          className={inputClass}
        />
        {form.formState.errors.peopleCount && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.peopleCount.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="evento-paymentRequired"
          type="checkbox"
          {...form.register("paymentRequired")}
          className="size-4 rounded border-slate-300 dark:border-slate-600"
        />
        <label
          htmlFor="evento-paymentRequired"
          className="text-sm text-slate-700 dark:text-slate-300"
        >
          Requiere pago
        </label>
      </div>
      {form.formState.errors.paymentRequired && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {form.formState.errors.paymentRequired.message}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
        >
          {isPending ? "Guardando…" : isEdit ? "Guardar" : "Crear evento"}
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
