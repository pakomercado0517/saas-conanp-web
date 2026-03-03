"use client";

import { useRef, useState } from "react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useEvidencias } from "../hooks/useEvidencias";
import {
  useUploadEvidencia,
  useUpdateEvidencia,
  useDeleteEvidencia,
} from "../hooks/useEvidenciaMutations";
import type { Evidencia, EvidenciaTipo } from "../types";

const TIPO_LABELS: Record<EvidenciaTipo, string> = {
  imagen: "Imagen",
  documento: "Documento",
  otro: "Otro",
};

interface EvidenciasSectionProps {
  areaId: string;
  eventoId: string;
}

export function EvidenciasSection({ areaId, eventoId }: EvidenciasSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");

  const { data: evidencias, isLoading, isError, error, refetch } =
    useEvidencias(areaId, eventoId);
  const uploadMutation = useUploadEvidencia(areaId, eventoId);
  const updateMutation = useUpdateEvidencia(areaId, eventoId);
  const deleteMutation = useDeleteEvidencia(areaId, eventoId);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadMutation.mutateAsync({ file });
      e.target.value = "";
      void refetch();
    } catch {
      // Error manejado
    }
  };

  const handleUpdate = async (ev: Evidencia) => {
    if (!editingId) return;
    try {
      await updateMutation.mutateAsync({
        evidenciaId: ev.id,
        payload: {
          nombre: editNombre || ev.nombre,
          descripcion: editDescripcion || (ev.descripcion ?? null),
        },
      });
      setEditingId(null);
      setEditNombre("");
      setEditDescripcion("");
      void refetch();
    } catch {
      // Error manejado
    }
  };

  const handleDelete = async (ev: Evidencia) => {
    if (!confirm("¿Eliminar esta evidencia?")) return;
    try {
      await deleteMutation.mutateAsync(ev.id);
      void refetch();
    } catch {
      // Error manejado
    }
  };

  const startEdit = (ev: Evidencia) => {
    setEditingId(ev.id);
    setEditNombre(ev.nombre);
    setEditDescripcion(ev.descripcion ?? "");
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando evidencias…</p>;
  }

  if (isError && error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Evidencias
        </h3>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
          >
            {uploadMutation.isPending ? "Subiendo…" : "Subir archivo"}
          </button>
        </div>
      </div>

      {uploadMutation.isError && uploadMutation.error && (
        <p
          className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
          role="alert"
        >
          {getApiErrorMessage(uploadMutation.error)}
        </p>
      )}

      {!evidencias?.length ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
          No hay evidencias para este evento.
        </p>
      ) : (
        <div className="space-y-2">
          {evidencias.map((ev) => (
            <div
              key={ev.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/30"
            >
              {editingId === ev.id ? (
                <div className="flex flex-1 flex-wrap gap-2">
                  <input
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    placeholder="Nombre"
                    className="rounded border px-2 py-1 text-sm"
                  />
                  <input
                    type="text"
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    placeholder="Descripción"
                    className="rounded border px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdate(ev)}
                    disabled={updateMutation.isPending}
                    className="rounded bg-slate-800 px-2 py-1 text-sm text-white hover:bg-slate-700"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditNombre("");
                      setEditDescripcion("");
                    }}
                    className="rounded border px-2 py-1 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                      {ev.nombre}
                    </p>
                    {ev.descripcion && (
                      <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                        {ev.descripcion}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      {TIPO_LABELS[ev.tipo]}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-(--cyan-accent) hover:underline"
                    >
                      Ver
                    </a>
                    <button
                      type="button"
                      onClick={() => startEdit(ev)}
                      className="text-sm font-medium text-(--cyan-accent) hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ev)}
                      disabled={deleteMutation.isPending}
                      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
