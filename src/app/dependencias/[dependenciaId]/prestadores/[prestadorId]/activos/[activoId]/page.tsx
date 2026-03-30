import { ActivoDependenciaDetailPage } from "@/features/activos/components/ActivoDependenciaDetailPage";
import { DependenciaOperacionShell } from "@/features/dependencias/components/DependenciaOperacionShell";

export const metadata = {
  title: "Activo | Prestador | Dependencia | CONANP ERP",
  description: "Detalle y requisitos del activo",
};

function firstString(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value[0] != null) return value[0];
  return undefined;
}

export default async function ActivoDependenciaRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{
    dependenciaId: string;
    prestadorId: string;
    activoId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { dependenciaId, prestadorId, activoId } = await params;
  const sp = await searchParams;
  const areaId = firstString(sp.areaId);

  if (!areaId || areaId.length === 0) {
    return (
      <DependenciaOperacionShell
        dependenciaId={dependenciaId}
        title="Activo"
        description="No se indicó la organización (ANP) del activo."
        backHref={`/dependencias/${dependenciaId}/prestadores/${prestadorId}`}
        backLabel="Volver al prestador"
      >
        <p className="text-sm text-red-600 dark:text-red-400">
          Falta el parámetro <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">areaId</code>{" "}
          en la URL (identificador de la organización donde está registrado el activo).
        </p>
      </DependenciaOperacionShell>
    );
  }

  return (
    <ActivoDependenciaDetailPage
      dependenciaId={dependenciaId}
      prestadorId={prestadorId}
      areaId={areaId}
      activoId={activoId}
    />
  );
}
