import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { getDashboardHref } from "@/shared/config/dashboardNav";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ areaId: string }>;
};

export default async function AreaDashboardLayout({
  children,
  params,
}: LayoutProps) {
  const { areaId } = await params;

  return (
    <AuthGuard>
      <DashboardLayout
        areaId={areaId}
        primaryAction={{
          label: "Nueva actividad",
          href: getDashboardHref(areaId, "/actividades/nueva"),
        }}
      >
        {children}
      </DashboardLayout>
    </AuthGuard>
  );
}
