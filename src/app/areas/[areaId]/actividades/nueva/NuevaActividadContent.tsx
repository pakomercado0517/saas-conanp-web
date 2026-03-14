"use client";

import { useRouter } from "next/navigation";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { ActividadForm } from "@/features/activities/components/ActividadForm";

interface NuevaActividadContentProps {
  areaId: string;
}

export function NuevaActividadContent({ areaId }: NuevaActividadContentProps) {
  const router = useRouter();

  return (
    <ActividadForm
      areaId={areaId}
      onSuccess={() => {
        router.push(getDashboardHref(areaId, "/actividades"));
      }}
      onCancel={() => {
        router.push(getDashboardHref(areaId, "/actividades"));
      }}
    />
  );
}
