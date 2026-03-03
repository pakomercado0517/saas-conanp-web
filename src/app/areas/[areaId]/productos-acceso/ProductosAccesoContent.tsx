"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { getApiErrorMessage } from "@/shared/types/api";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { useProductosAcceso } from "@/features/access-products/hooks/useProductosAcceso";
import { useDeleteProductoAcceso } from "@/features/access-products/hooks/useProductoAccesoMutations";
import { ProductoAccesoCreateDialog } from "@/features/access-products/components/ProductoAccesoCreateDialog";
import { ProductoAccesoEditDialog } from "@/features/access-products/components/ProductoAccesoEditDialog";
import { StockMovimientosSection } from "@/features/access-products/components/StockMovimientosSection";
import { EmptyState } from "@/shared/components/EmptyState";
import type { ProductoAcceso } from "@/features/access-products/types";

interface ProductosAccesoContentProps {
  areaId: string;
}

export function ProductosAccesoContent({
  areaId,
}: ProductosAccesoContentProps) {
  const { role } = useAreaContext();
  const {
    data: products,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductosAcceso(areaId);
  const { remove: deleteProducto } = useDeleteProductoAcceso(areaId);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProducto, setEditingProducto] = useState<ProductoAcceso | null>(
    null
  );
  const [expandedProductoId, setExpandedProductoId] = useState<string | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canManage = role === "admin" || role === "gestor";
  const inicioHref = getDashboardHref(areaId, "");

  const handleDelete = async (p: ProductoAcceso) => {
    if (
      !confirm(
        `¿Eliminar el producto "${p.name}"? Esta acción no se puede deshacer.`
      )
    )
      return;
    setDeletingId(p.id);
    try {
      await deleteProducto(p.id);
      refetch();
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedProductoId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Productos de acceso
        </h1>
        {canManage && (
          <button
            type="button"
            onClick={() => setShowCreateDialog(true)}
            className="rounded-md bg-(--cyan-accent) px-4 py-2 text-sm font-bold text-(--navy-deep) hover:bg-(--cyan-hover) focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
          >
            Nuevo producto
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando productos…</p>
      ) : isError && error ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          {getApiErrorMessage(error)}
        </p>
      ) : products?.length ? (
        <div className="space-y-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900/30">
                <button
                  type="button"
                  onClick={() => toggleExpand(p.id)}
                  className="flex size-10 items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-expanded={expandedProductoId === p.id}
                >
                  {expandedProductoId === p.id ? (
                    <ChevronDown className="size-5" />
                  ) : (
                    <ChevronRight className="size-5" />
                  )}
                </button>
                <div className="flex-1 overflow-x-auto">
                  <table className="min-w-full">
                    <tbody>
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium">
                          {p.name}
                        </td>
                        <td className="px-4 py-2 text-sm">{p.tipo}</td>
                        <td className="px-4 py-2 text-sm text-right">
                          {p.vigenciaDias}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">
                          {p.precioReferencia != null
                            ? p.precioReferencia
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {p.active ? "Activo" : "Inactivo"}
                        </td>
                        {canManage && (
                          <td className="px-4 py-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingProducto(p)}
                                className="rounded p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                aria-label="Editar"
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(p)}
                                disabled={deletingId === p.id}
                                className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50"
                                aria-label="Eliminar"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              {expandedProductoId === p.id && (
                <div className="border-t border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/20">
                  <StockMovimientosSection areaId={areaId} producto={p} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          message="No hay productos de acceso configurados. Crea uno para gestionar brazaletes o pasaportes."
          action={
            canManage
              ? {
                  label: "Nuevo producto",
                  onClick: () => setShowCreateDialog(true),
                }
              : undefined
          }
        />
      )}

      <p className="text-sm text-slate-500">
        <Link href={inicioHref} className="underline hover:no-underline">
          Volver al inicio del área
        </Link>
      </p>

      <ProductoAccesoCreateDialog
        areaId={areaId}
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => refetch()}
      />

      {editingProducto && (
        <ProductoAccesoEditDialog
          producto={editingProducto}
          areaId={areaId}
          open={!!editingProducto}
          onClose={() => setEditingProducto(null)}
          onSuccess={() => {
            refetch();
            setEditingProducto(null);
          }}
        />
      )}
    </div>
  );
}
