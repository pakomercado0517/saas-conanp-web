import { AuthGuard } from "@/features/auth/components/AuthGuard";

export default function SelectOrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
