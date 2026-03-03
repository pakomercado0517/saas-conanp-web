"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getApiErrorMessage } from "@/shared/types/api";
import { useMovimientos } from "../hooks/useMovimientos";
import { useRegistrarEntrada, useRegistrarSalida } from "../hooks/useMovimientoMutations";
import { registrarMovimientoSchema, type RegistrarMovimientoFormData } from "../schemas/producto-acceso.schema";
import type { ProductoAcceso } from "../types";

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white";
const labelClass = "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

interface StockMovimientosSectionProps {
  areaId: string;
  producto: ProductoAcceso;
}

export function StockMovimientosSection({ areaId, producto }: StockMovimientosSectionProps) {
  const [tipoMovimiento, setTipoMovimiento] = useState<"entrada" | "salida">("entrada");
  const [filtroTipo, setFiltroTipo] = useState<"entrada" | "salida" | "">("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const { data: movimientos, isLoading, refetch } = useMovimientos(areaId, producto.id, {
    tipo: filtroTipo || undefined,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
  });

  const entradaMutation = useRegistrarEntrada(areaId, producto.id);
  const salidaMutation = useRegistrarSalida(areaId, producto.id);

  const form = useForm<RegistrarMovimientoFormData>({
    resolver: zodResolver(registrarMovimientoSchema),
    defaultValues: {
      cantidad: 1,
      prestadorId: undefined,
      eventoId: undefined,
      observaciones: undefined,
    },
  });

  const isPending = entradaMutation.isPending || salidaMutation.isPending;

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const payload = {
        cantidad: data.cantidad,
        prestadorId: data.prestadorId || null,
        eventoId: data.eventoId || null,
        observaciones: data.observaciones || null,
      };
      if (tipoMovimiento === "entrada") {
        await entradaMutation.registrar(payload);
      } else {
        await salidaMutation.registrar(payload);
      }
      form.reset({ cantidad: 1, prestadorId: undefined, eventoId: undefined, observaciones: undefined });
      refetch();
    } catch {
      // Error manejado por mutation
    }
  });

  const error = entradaMutation.error || salidaMutation.error;

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        Stock y movimientos
      </h3>

      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <div>
          <label className={labelClass}>Tipo</label>
          <select
            value={tipoMovimiento}
            onChange={(e) => setTipoMovimiento(e.target.value as "entrada" | "salida")}
            className={inputClass}
          >
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
        </div>
        <div>
          <label htmlFor="cantidad" className={labelClass}>
            Cantidad
          </label>
          <input
            id="cantidad"
            type="number"
            min={1}
            className={inputClass}
            {...form.register("cantidad", { valueAsNumber: true })}
          />
          {form.formState.errors.cantidad && (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.cantidad.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="observaciones" className={labelClass}>
            Observaciones (opcional)
          </label>
          <input
            id="observaciones"
            type="text"
            placeholder="Opcional"
            className={inputClass}
            {...form.register("observaciones")}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-(--cyan-accent) px-4 py-2 text-sm font-bold text-(--navy-deep) hover:bg-(--cyan-hover) disabled:opacity-70"
        >
          {isPending ? "Registrando…" : "Registrar"}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {getApiErrorMessage(error)}
        </p>
      )}

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as "entrada" | "salida" | "")}
            className="rounded border border-slate-200 px-2 py-1 text-sm dark:border-slate-600"
          >
            <option value="">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
          </select>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="rounded border border-slate-200 px-2 py-1 text-sm dark:border-slate-600"
            placeholder="Desde"
          />
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="rounded border border-slate-200 px-2 py-1 text-sm dark:border-slate-600"
            placeholder="Hasta"
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-slate-500">Cargando movimientos…</p>
        ) : movimientos?.length ? (
          <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Fecha
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Tipo
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">
                    Cantidad
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {movimientos.map((m) => (
                  <tr key={m.id}>
                    <td className="px-3 py-2">{formatDateTime(m.createdAt)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          m.tipo === "entrada"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {m.tipo === "entrada" ? "Entrada" : "Salida"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">{m.cantidad}</td>
                    <td className="px-3 py-2 text-slate-500">{m.observaciones ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No hay movimientos registrados.</p>
        )}
      </div>
    </div>
  );
}
