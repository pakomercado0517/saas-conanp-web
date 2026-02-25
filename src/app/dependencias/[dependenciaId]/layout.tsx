import { AuthGuard } from "@/features/auth/components/AuthGuard";

export default function DependenciaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
