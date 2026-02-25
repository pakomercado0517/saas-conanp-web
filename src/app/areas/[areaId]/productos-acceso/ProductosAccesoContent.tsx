"use client";

import Link from "next/link";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { getApiErrorMessage } from "@/shared/types/api";
import { useProductosAcceso } from "@/features/access-products/hooks/useProductosAcceso";

interface ProductosAccesoContentProps {
  areaId: string;
}

export function ProductosAccesoContent({ areaId }: ProductosAccesoContentProps) {
  const { data: products, isLoading, isError, error } = useProductosAcceso(areaId);
  const inicioHref = getDashboardHref(areaId, "");

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Productos de acceso
      </h1>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando productos…</p>
      ) : isError && error ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          {getApiErrorMessage(error)}
        </p>
      ) : products?.length ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Nombre</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Tipo</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Vigencia (días)</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 dark:text-slate-300">Precio ref.</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 text-sm">{p.name}</td>
                  <td className="px-4 py-2 text-sm">{p.tipo}</td>
                  <td className="px-4 py-2 text-sm text-right">{p.vigenciaDias}</td>
                  <td className="px-4 py-2 text-sm text-right">{p.precioReferencia ?? "—"}</td>
                  <td className="px-4 py-2 text-sm">{p.active ? "Activo" : "Inactivo"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
          No hay productos de acceso configurados.
        </p>
      )}

      <p className="text-sm text-slate-500">
        <Link href={inicioHref} className="underline hover:no-underline">
          Volver al inicio del área
        </Link>
      </p>
    </div>
  );
}
