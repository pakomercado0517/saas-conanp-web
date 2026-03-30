import { AuthGuard } from "@/features/auth/components/AuthGuard";
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
        {children}
      </DependenciaShell>
    </AuthGuard>
  );
}
