"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Leaf, X } from "lucide-react";
import { DependenciaNavLinks } from "./DependenciaNavLinks";
import { DependenciaUserBlock } from "./DependenciaUserBlock";

interface DependenciaMobileDrawerProps {
  dependenciaId: string;
  isAdminInAnyArea: boolean;
  open: boolean;
  onClose: () => void;
}

export function DependenciaMobileDrawer({
  dependenciaId,
  isAdminInAnyArea,
  open,
  onClose,
}: DependenciaMobileDrawerProps) {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden"
        aria-label="Cerrar menú"
      />
      <aside
        className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-800 bg-(--navy-sidebar) shadow-xl transition-transform duration-200 lg:hidden"
        aria-label="Menú dependencia"
      >
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-(--primary)">
              <Leaf className="size-5 text-white" aria-hidden />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              CONANP ERP
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <DependenciaNavLinks
          dependenciaId={dependenciaId}
          pathname={pathname}
          isAdminInAnyArea={isAdminInAnyArea}
          onNavigate={onClose}
        />
        <DependenciaUserBlock dependenciaId={dependenciaId} />
      </aside>
    </>
  );
}
