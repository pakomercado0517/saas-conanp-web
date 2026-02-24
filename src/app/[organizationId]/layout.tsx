import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ organizationId: string }>;
};

export default async function OrganizationDashboardLayout({
  children,
  params,
}: LayoutProps) {
  const { organizationId } = await params;

  return (
    <AuthGuard>
      <DashboardLayout
        organizationId={organizationId}
        primaryAction={{
          label: "Nueva actividad",
          href: `/${organizationId}/actividades/nueva`,
        }}
      >
        {children}
      </DashboardLayout>
    </AuthGuard>
  );
}
