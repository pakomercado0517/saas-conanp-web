"use client";

import {
  Waves,
  Mountain,
  Leaf,
  ChevronRight,
  MapPin,
  Plus,
} from "lucide-react";
import type { DependenciaArea } from "../types";

const ECOSYSTEM_LABELS: Record<string, string> = {
  terrestre: "Terrestre",
  maritimo: "Marítimo",
  mixto: "Mixto",
};

function AreaCard({
  area,
  onSelect,
}: {
  area: DependenciaArea;
  onSelect: (areaId: string) => void;
}) {
  const label = ECOSYSTEM_LABELS[area.ecosystem_type] ?? area.ecosystem_type;
  const Icon =
    area.ecosystem_type === "maritimo"
      ? Waves
      : area.ecosystem_type === "terrestre"
        ? Mountain
        : Leaf;

  return (
    <button
      type="button"
      onClick={() => onSelect(area.id)}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-(--cyan-accent) hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-(--cyan-accent)/50 focus:ring-offset-2"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
        <div className="flex h-full w-full items-center justify-center">
          <Icon
            className="size-16 text-(--slate-text)/40 transition-transform duration-500 group-hover:scale-110"
            aria-hidden
          />
        </div>
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-(--navy-deep) dark:bg-(--navy-deep)/90 dark:text-white">
            Activo
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold leading-tight transition-colors group-hover:text-(--cyan-accent)">
            {area.name}
          </h3>
          <ChevronRight
            className="mt-0.5 size-4 shrink-0 text-(--slate-text) transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </div>
        <p className="flex items-center gap-1 text-sm font-medium text-(--slate-text)">
          <MapPin className="size-3.5" aria-hidden />
          {label}
        </p>
      </div>
    </button>
  );
}

interface AreaGridProps {
  areas: DependenciaArea[];
  canCreateArea: boolean;
  onSelectArea: (areaId: string) => void;
  onCreateArea: () => void;
}

export function AreaGrid({
  areas,
  canCreateArea,
  onSelectArea,
  onCreateArea,
}: AreaGridProps) {
  if (areas.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/30 sm:p-12">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-(--navy-deep)/5">
          <MapPin className="size-8 text-(--navy-deep)" aria-hidden />
        </div>
        <h3 className="mb-2 text-lg font-bold text-(--navy-deep) dark:text-white">
          Sin áreas registradas
        </h3>
        <p className="mb-6 max-w-sm text-sm text-(--slate-text)">
          Crea tu primera Área Natural Protegida para empezar a operar.
        </p>
        <button
          type="button"
          onClick={onCreateArea}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--cyan-accent) px-6 py-3 font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover)"
        >
          <Plus className="size-5" aria-hidden />
          Crear área
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {areas.map((area) => (
        <AreaCard key={area.id} area={area} onSelect={onSelectArea} />
      ))}
      {canCreateArea && (
        <button
          type="button"
          onClick={onCreateArea}
          className="group flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 p-8 transition-all duration-300 hover:border-(--cyan-accent) hover:bg-(--cyan-accent)/5 dark:border-slate-700 dark:hover:bg-(--cyan-accent)/10"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-(--cyan-accent) group-hover:text-white dark:bg-slate-800">
            <Plus className="size-7 text-(--slate-text)" aria-hidden />
          </div>
          <p className="font-bold text-(--slate-text) transition-colors group-hover:text-(--cyan-accent)">
            Crear nueva área
          </p>
        </button>
      )}
    </div>
  );
}
