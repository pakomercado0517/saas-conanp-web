"use client";

import { EvidenciasSection } from "@/features/evidencias/components/EvidenciasSection";

interface EvidenciasPageContentProps {
  areaId: string;
  eventoId: string;
}

export function EvidenciasPageContent({
  areaId,
  eventoId,
}: EvidenciasPageContentProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
      <EvidenciasSection areaId={areaId} eventoId={eventoId} />
    </div>
  );
}
