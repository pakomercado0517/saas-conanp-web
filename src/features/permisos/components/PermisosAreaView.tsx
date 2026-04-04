"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/shared/types/api";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { EmptyState } from "@/shared/components/EmptyState";
import { useAreaContext } from "@/features/organizations/context/AreaContext";
import { usePrestadores } from "@/features/prestadores/hooks/usePrestadores";
import { PermisosList } from "./PermisosList";
import { PermisosPrestadoresIndex } from "./PermisosPrestadoresIndex";

interface PermisosAreaViewProps {
  areaId: string;
  searchPrestadorId: string | undefined;
}

export function PermisosAreaView({
  areaId,
  searchPrestadorId,
}: PermisosAreaViewProps) {
  const { role } = useAreaContext();
  const router = useRouter();
  const isPrestadorRole = role === "prestador";

  const {
    data: prestadores,
    isLoading: prestadoresLoading,
    isError: prestadoresError,
    error: prestadoresErr,
  } = usePrestadores(areaId);

  const myPrestadorId =
    isPrestadorRole && prestadores?.length === 1 ? prestadores[0].id : null;

  useEffect(() => {
    if (
      isPrestadorRole &&
      myPrestadorId &&
      searchPrestadorId &&
      searchPrestadorId !== myPrestadorId
    ) {
      router.replace(
        `${getDashboardHref(areaId, "/permisos")}?prestadorId=${encodeURIComponent(myPrestadorId)}`
      );
    }
  }, [areaId, isPrestadorRole, myPrestadorId, router, searchPrestadorId]);

  if (prestadoresLoading) {
    return <p className="text-sm text-slate-500">Cargando…</p>;
  }

  if (prestadoresError && prestadoresErr) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {getApiErrorMessage(prestadoresErr)}
      </p>
    );
  }

  if (isPrestadorRole) {
    if (!prestadores?.length) {
      return (
        <EmptyState message="No se encontró un perfil de prestador asociado a tu cuenta en esta área." />
      );
    }
    if (prestadores.length === 1 && myPrestadorId) {
      return (
        <PermisosList
          key={myPrestadorId}
          areaId={areaId}
          initialPrestadorId={myPrestadorId}
          showBackToIndex={false}
        />
      );
    }
    return <PermisosList areaId={areaId} />;
  }

  if (!searchPrestadorId) {
    return <PermisosPrestadoresIndex areaId={areaId} />;
  }

  return (
    <PermisosList
      key={searchPrestadorId}
      areaId={areaId}
      initialPrestadorId={searchPrestadorId}
      showBackToIndex
    />
  );
}
