"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import type { Resolver } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getApiErrorMessage } from "@/shared/types/api";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { useActividades } from "@/features/activities/hooks/useActividades";
import { useCapacidadPorBloques } from "@/features/activities/hooks/useCapacidadPorBloques";
import { useActivos } from "@/features/activos/hooks/useActivos";
import { listRequisitos } from "@/features/activos/services/requisitos.api";
import type { Activo, ActivoRequisito } from "@/features/activos/types";
import { usePrestadores } from "@/features/prestadores/hooks/usePrestadores";
import { getPrestadorDisplayName } from "@/features/prestadores/lib/prestador-display";
import { useBloques } from "@/features/blocks/hooks/useBloques";
import { useCreateEvent } from "../hooks/useCreateEvent";
import { useCapacidadActivos } from "../hooks/useCapacidadActivos";
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

function getActivoDisplayName(a: Activo): string {
  return a.nombre ?? a.Propietario?.name ?? a.ownerId ?? a.id ?? "—";
}

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

function isNombreKey(key: string): boolean {
  const normalized = normalizeKey(key);
  return (
    normalized === "nombre" ||
    normalized === "name" ||
    normalized.endsWith("_nombre") ||
    normalized.endsWith("_name")
  );
}

function isCapacidadKey(key: string): boolean {
  const normalized = normalizeKey(key);
  return (
    normalized === "capacidad" ||
    normalized === "capacidad_personas" ||
    normalized === "capacidad_maxima" ||
    normalized.includes("capacidad")
  );
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
  const { data: activos, isLoading: loadingActivos } = useActivos(areaId, {
    status: "aprobado",
  });

  const form = useForm<CreateEventoFormData>({
    resolver: zodResolver(
      isEdit ? updateEventoSchema : createEventoSchema
    ) as Resolver<CreateEventoFormData>,
    defaultValues: {
      actividadId: evento?.actividadId ?? "",
      prestadorId: evento?.prestadorId ?? "",
      activoIds: evento?.activoIds ?? [],
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
  const prestadorId = useWatch({
    control: form.control,
    name: "prestadorId",
    defaultValue: "",
  });
  const activoIds = useWatch({
    control: form.control,
    name: "activoIds",
    defaultValue: [],
  });
  const bloqueId = useWatch({
    control: form.control,
    name: "bloqueId",
    defaultValue: "",
  });
  const startTime = useWatch({
    control: form.control,
    name: "startTime",
    defaultValue: "09:00",
  });
  const endTime = useWatch({
    control: form.control,
    name: "endTime",
    defaultValue: "12:00",
  });
  const peopleCount = useWatch({
    control: form.control,
    name: "peopleCount",
    defaultValue: 1,
  });

  const selectedActivity = useMemo(
    () => actividades?.find((a) => a.id === actividadId),
    [actividades, actividadId]
  );

  const activosDelPrestador = useMemo(() => {
    if (!prestadorId) return [];
    return (
      activos?.filter((a) => a.ownerId === prestadorId) ??
      []
    );
  }, [activos, prestadorId]);

  const requisitosQueries = useQueries({
    queries: activosDelPrestador.map((a) => ({
      queryKey: ["requisitos", areaId, a.id],
      queryFn: () => listRequisitos(areaId, a.id),
      enabled: Boolean(areaId && a.id),
    })),
  });

  const requisitosByActivoId = useMemo(() => {
    const out: Record<string, ActivoRequisito[] | undefined> = {};
    activosDelPrestador.forEach((a, i) => {
      out[a.id] = requisitosQueries[i]?.data;
    });
    return out;
  }, [activosDelPrestador, requisitosQueries]);

  function getActivoNombreByRequisitos(activoId: string): string | null {
    const requisitos = requisitosByActivoId[activoId] ?? [];
    const req = requisitos.find((r) => isNombreKey(r.clave));
    const value = req?.valor?.trim();
    return value ? value : null;
  }

  function getActivoCapacidadByRequisitos(activoId: string): number | null {
    const requisitos = requisitosByActivoId[activoId] ?? [];
    const req = requisitos.find((r) => isCapacidadKey(r.clave));
    if (!req?.valor) return null;
    const parsed = Number(req.valor.replace(",", ".").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  useEffect(() => {
    if (!isEdit && selectedActivity) {
      form.setValue("agendaType", selectedActivity.agendaType);
    }
  }, [isEdit, selectedActivity, form]);

  useEffect(() => {
    if (!isEdit) {
      // Si cambia el prestador, reseteamos la selección de activos para evitar inconsistencias.
      form.setValue("activoIds", []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prestadorId]);

  const { data: bloques, isLoading: loadingBloques } = useBloques(
    areaId,
    actividadId && date && agendaType === "BLOQUES" ? actividadId : null,
    date && agendaType === "BLOQUES" ? { date } : {}
  );

  const bloqueIds = useMemo(() => bloques?.map((b) => b.id) ?? [], [bloques]);
  const {
    dataByBloqueId,
    isLoading: loadingCapacidad,
  } = useCapacidadPorBloques(
    areaId,
    actividadId,
    date,
    agendaType === "BLOQUES" && bloqueIds.length > 0 ? bloqueIds : []
  );

  const {
    dataByActivoId,
    isLoading: loadingCapacidadActivos,
  } = useCapacidadActivos(areaId, {
    activoIds,
    date,
    agendaType,
    bloqueId: agendaType === "BLOQUES" ? bloqueId : undefined,
    startTime:
      agendaType === "HORARIO_LIBRE"
        ? toTimeSeconds(startTime ?? "09:00")
        : undefined,
    endTime:
      agendaType === "HORARIO_LIBRE"
        ? toTimeSeconds(endTime ?? "12:00")
        : undefined,
    cantidad: peopleCount,
  });

  const capacidadDisponibleActivosTotal = useMemo(() => {
    if (!activoIds?.length) return 0;
    return activoIds.reduce((sum, id) => {
      const disp = dataByActivoId[id]?.capacidadDisponible;
      if (typeof disp === "number") return sum + disp;
      const requisitos = requisitosByActivoId[id] ?? [];
      const reqCapacidad = requisitos.find((r) => isCapacidadKey(r.clave));
      const fallbackCapacidad = reqCapacidad?.valor
        ? Number(reqCapacidad.valor.replace(",", ".").trim())
        : null;
      return sum + (typeof fallbackCapacidad === "number" ? fallbackCapacidad : 0);
    }, 0);
  }, [activoIds, dataByActivoId, requisitosByActivoId]);

  const maxPersonasPermitidas = useMemo(() => {
    let max = capacidadDisponibleActivosTotal;
    if (agendaType === "BLOQUES" && bloqueId) {
      const capBloque = dataByBloqueId[bloqueId];
      if (capBloque && typeof capBloque.capacidadDisponible === "number") {
        max = Math.min(max, capBloque.capacidadDisponible);
      }
    }
    return max;
  }, [agendaType, bloqueId, capacidadDisponibleActivosTotal, dataByBloqueId]);

  const puedeVerificarCapacidadActivos = useMemo(() => {
    if (!date || activoIds?.length === 0) return false;
    if (agendaType === "BLOQUES") return Boolean(bloqueId);
    return Boolean(startTime && endTime);
  }, [agendaType, activoIds, bloqueId, date, endTime, startTime]);

  const conflictosActivos = useMemo(() => {
    if (!activoIds?.length) return [];
    return activoIds.flatMap((id) => dataByActivoId[id]?.eventosOcupantes ?? []);
  }, [activoIds, dataByActivoId]);

  const conflictosUnicos = useMemo(() => {
    const seen = new Set<string>();
    const out: typeof conflictosActivos = [];
    for (const ev of conflictosActivos) {
      if (!ev.id || seen.has(ev.id)) continue;
      seen.add(ev.id);
      out.push(ev);
    }
    return out;
  }, [conflictosActivos]);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error ?? updateMutation.error;

  const buildPayload = (data: CreateEventoFormData): CreateEventoPayload => {
    const base = {
      actividadId: data.actividadId,
      prestadorId: data.prestadorId,
      activoIds: data.activoIds,
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
    const requestedPeopleCount = data.peopleCount ?? 1;
    const maxActivos = capacidadDisponibleActivosTotal;

    let maxBloque: number | null = null;
    if (data.agendaType === "BLOQUES" && data.bloqueId) {
      const capBloque = dataByBloqueId[data.bloqueId];
      if (capBloque && typeof capBloque.capacidadDisponible === "number") {
        maxBloque = capBloque.capacidadDisponible;
      }
    }

    const maxPermitido =
      maxBloque != null ? Math.min(maxBloque, maxActivos) : maxActivos;

    if (typeof maxPermitido === "number" && requestedPeopleCount > maxPermitido) {
      form.setError("peopleCount", {
        type: "manual",
        message: `Máximo ${maxPermitido} personas disponibles para la selección.`,
      });
      return;
    }
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
              {getPrestadorDisplayName(p)}
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
        <label className={labelClass}>Activos del prestador</label>
        {loadingActivos ? (
          <p className="mt-1 text-sm text-slate-500">Cargando activos…</p>
        ) : !prestadorId ? (
          <p className="mt-1 text-sm text-slate-500">
            Selecciona un prestador para ver sus activos.
          </p>
        ) : !activosDelPrestador.length ? (
          <p className="mt-1 text-sm text-slate-500">
            No hay activos aprobados para este prestador.
          </p>
        ) : (
          <div className="mt-1 space-y-2 rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/20">
            {activosDelPrestador.map((a) => {
              const checked = activoIds.includes(a.id);
              const nombreRequisito = getActivoNombreByRequisitos(a.id);
              const capacidadRequisito = getActivoCapacidadByRequisitos(a.id);
              return (
                <label
                  key={a.id}
                  className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...new Set([...activoIds, a.id])]
                        : activoIds.filter((id) => id !== a.id);
                      form.setValue("activoIds", next, { shouldValidate: true });
                    }}
                    className="size-4 rounded border-slate-300 dark:border-slate-600"
                  />
                  <span className="truncate">
                    {nombreRequisito ?? getActivoDisplayName(a)}
                    {capacidadRequisito != null
                      ? ` — Capacidad base: ${capacidadRequisito}`
                      : ""}
                  </span>
                </label>
              );
            })}
          </div>
        )}
        {form.formState.errors.activoIds && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.activoIds.message}
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

      {selectedActivity && (
        <div>
          <span className={labelClass}>Tipo de agenda</span>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {agendaType === "BLOQUES" ? "Bloques" : "Horario libre"}
          </p>
        </div>
      )}

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
                : loadingBloques || loadingCapacidad
                  ? "Cargando bloques…"
                  : !bloques?.length
                    ? "No hay bloques para esta fecha"
                    : "Selecciona un bloque"}
            </option>
            {bloques?.map((b) => {
              const cap = dataByBloqueId[b.id];
              const disp =
                cap != null && typeof cap.capacidadDisponible === "number"
                  ? cap.capacidadDisponible
                  : null;
              const horario = `${b.startTime?.slice(0, 5) ?? b.startTime} – ${b.endTime?.slice(0, 5) ?? b.endTime}`;
              const label =
                disp != null
                  ? `${horario} — ${disp} plazas disponibles`
                  : horario;
              return (
                <option key={b.id} value={b.id}>
                  {label}
                </option>
              );
            })}
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
          max={capacidadDisponibleActivosTotal > 0 ? capacidadDisponibleActivosTotal : undefined}
          {...form.register("peopleCount", { valueAsNumber: true })}
          className={inputClass}
        />
        {puedeVerificarCapacidadActivos && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {loadingCapacidadActivos ? (
              <>Verificando capacidad disponible…</>
            ) : (
              <>Capacidad disponible total: {capacidadDisponibleActivosTotal} personas</>
            )}
          </p>
        )}

        {/*
          UX de control: si lo solicitado supera la capacidad disponible para los activos seleccionados,
          mostramos conflictos y una acción rápida para ajustar el número.
        */}
        {!loadingCapacidadActivos &&
          puedeVerificarCapacidadActivos &&
          peopleCount > maxPersonasPermitidas && (
            <div
              className="mt-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200"
              role="alert"
            >
              <p className="font-medium">
                Capacidad insuficiente para la selección
              </p>
              <p className="mt-1 text-sm">
                Solo hay {maxPersonasPermitidas} personas disponibles con los activos seleccionados para esta fecha.
              </p>

              {maxPersonasPermitidas >= 1 && (
                <button
                  type="button"
                  onClick={() => {
                    form.setValue("peopleCount", maxPersonasPermitidas, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  className="mt-2 rounded-md bg-rose-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600"
                >
                  Ajustar a {maxPersonasPermitidas}
                </button>
              )}

              {conflictosUnicos.length > 0 && (
                <>
                  <p className="mt-3 font-medium">
                    Eventos que ocupan capacidad
                  </p>
                  <ul className="mt-1 space-y-1">
                    {conflictosUnicos.slice(0, 4).map((ev) => {
                      const canEdit = ev.status === "programado";
                      const href = getDashboardHref(
                        areaId,
                        canEdit
                          ? `/eventos/${ev.id}/editar`
                          : `/eventos/${ev.id}/evidencias`
                      );
                      const horario =
                        ev.startTime && ev.endTime
                          ? `${ev.startTime.slice(0, 5)} – ${ev.endTime.slice(0, 5)}`
                          : "—";

                      return (
                        <li
                          key={ev.id}
                          className="flex items-center justify-between gap-3 rounded border border-rose-200 bg-white/60 px-2 py-1.5 dark:border-rose-800 dark:bg-slate-900/20"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium">
                              {ev.date} {horario !== "—" ? `(${horario})` : ""}
                            </p>
                            <p className="text-xs text-rose-800/80 dark:text-rose-200/80">
                              Personas: {ev.peopleCount} — {ev.status}
                            </p>
                          </div>
                          <Link href={href} className="text-xs font-medium text-(--cyan-accent) hover:underline">
                            {canEdit ? "Editar" : "Ver evidencias"}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          )}

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
