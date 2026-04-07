"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDependenciaContext } from "@/features/dependencias/context/DependenciaContext";
import { DependenciaOperacionShell } from "@/features/dependencias/components/DependenciaOperacionShell";
import { useMembershipRolesInAreas } from "@/features/memberships/hooks/useMembershipRolesInAreas";
import { CreatePrestadorForm } from "@/features/prestadores/components/CreatePrestadorForm";
import { useCreatePrestadorCompleto } from "@/features/prestadores/hooks/useCreatePrestadorCompleto";
import { getApiErrorMessage } from "@/shared/types/api";
import { AreaContextProvider } from "@/features/organizations/context/AreaContext";

interface NuevoPrestadorDependenciaPageProps {
  dependenciaId: string;
}

export function NuevoPrestadorDependenciaPage({
  dependenciaId,
}: NuevoPrestadorDependenciaPageProps) {
  const router = useRouter();
  const { areas, dependencia } = useDependenciaContext();
  const areaIds = areas.map((a) => a.id);
  const { rolesByAreaId, isLoading: rolesLoading } =
    useMembershipRolesInAreas(areaIds);

  const adminAreas = useMemo(
    () => areas.filter((a) => rolesByAreaId.get(a.id) === "admin"),
    [areas, rolesByAreaId]
  );
  const [areaId, setAreaId] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultAreaId = adminAreas[0]?.id ?? "";
  const effectiveAreaId = areaId !== "" ? areaId : defaultAreaId;

  useEffect(() => {
    if (areaId !== "" && !adminAreas.some((a) => a.id === areaId)) {
      setAreaId("");
    }
  }, [areaId, adminAreas]);

  const { create, isPending } = useCreatePrestadorCompleto(effectiveAreaId);

  const handleSubmit = async (
    payload: Parameters<typeof create>[0]
  ): Promise<void> => {
    setServerError(null);
    try {
      const res = await create(payload);
      const pid = res.prestador?.id;
      if (pid && effectiveAreaId) {
        router.replace(
          `/dependencias/${dependenciaId}/prestadores/${pid}?areaId=${encodeURIComponent(
            effectiveAreaId
          )}`
        );
        return;
      }
      router.replace(`/dependencias/${dependenciaId}/prestadores`);
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  if (rolesLoading) {
    return (
      <DependenciaOperacionShell
        dependenciaId={dependenciaId}
        title="Nuevo prestador"
        description="Cargando permisos…"
      >
        <p className="text-sm text-slate-500">Cargando…</p>
      </DependenciaOperacionShell>
    );
  }

  if (adminAreas.length === 0) {
    return (
      <DependenciaOperacionShell
        dependenciaId={dependenciaId}
        title="Nuevo prestador"
        description="Solo un administrador del área puede dar de alta prestadores."
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No tienes rol de administrador en ninguna ANP de esta dependencia.
        </p>
        <Link
          href={`/dependencias/${dependenciaId}/prestadores`}
          className="mt-4 inline-block text-sm font-medium text-(--cyan-accent) hover:underline"
        >
          Volver al listado
        </Link>
      </DependenciaOperacionShell>
    );
  }

  return (
    <DependenciaOperacionShell
      dependenciaId={dependenciaId}
      title="Nuevo prestador"
      description={
        dependencia?.name
          ? `Alta en ${dependencia.name}: elige contexto de ANP para la petición o todas las áreas.`
          : "Elige el contexto de ANP para la petición o todas las áreas."
      }
    >
      <div className="mb-6 max-w-lg">
        <label
          htmlFor="nuevo-prestador-area"
          className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
        >
          Área para el alta
        </label>
        <select
          id="nuevo-prestador-area"
          value={
            areaId === "" || adminAreas.some((a) => a.id === areaId)
              ? areaId
              : ""
          }
          onChange={(e) => setAreaId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="">Todas las áreas de la dependencia</option>
          {adminAreas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          «Todas las áreas» usa la primera ANP donde eres administrador en la
          ruta de la API. Una ANP concreta define ecosistema y activos del
          formulario. Si el prestador aparece en varias ANP, es decisión del
          servidor para esta dependencia.
        </p>
      </div>

      {effectiveAreaId ? (
        <AreaContextProvider areaId={effectiveAreaId}>
          <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/40">
            <CreatePrestadorForm
              onSubmit={handleSubmit}
              onCancel={() =>
                router.push(`/dependencias/${dependenciaId}/prestadores`)
              }
              isPending={isPending}
              serverError={serverError}
            />
          </div>
        </AreaContextProvider>
      ) : null}
    </DependenciaOperacionShell>
  );
}
