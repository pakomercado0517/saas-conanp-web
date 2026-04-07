import Link from "next/link";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { PermisosAreaView } from "@/features/permisos/components/PermisosAreaView";

type PageProps = {
  params: Promise<{ areaId: string }>;
  searchParams: Promise<{ prestadorId?: string }>;
};

export default async function PermisosPage({
  params,
  searchParams,
}: PageProps) {
  const { areaId } = await params;
  const sp = await searchParams;
  const prestadorIdFromQuery =
    typeof sp.prestadorId === "string" && sp.prestadorId.length > 0
      ? sp.prestadorId
      : undefined;
  const inicioHref = getDashboardHref(areaId, "");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Prestadores con permisos para esta área
      </h1>

      <PermisosAreaView
        areaId={areaId}
        searchPrestadorId={prestadorIdFromQuery}
      />

      <p className="text-sm text-slate-500">
        <Link href={inicioHref} className="underline hover:no-underline">
          Volver al inicio del área
        </Link>
      </p>
    </div>
  );
}
