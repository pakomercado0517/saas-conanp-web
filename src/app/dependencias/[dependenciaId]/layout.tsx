import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { DependenciaAppLayout } from "@/features/dependencias/components/DependenciaAppLayout";
import { DependenciaShell } from "./DependenciaShell";

export default async function DependenciaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ dependenciaId: string }>;
}) {
  const { dependenciaId } = await params;
  return (
    <AuthGuard>
      <DependenciaShell dependenciaId={dependenciaId}>
        <DependenciaAppLayout dependenciaId={dependenciaId}>
          {children}
        </DependenciaAppLayout>
      </DependenciaShell>
    </AuthGuard>
  );
}
