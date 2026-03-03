import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi perfil | CONANP ERP",
  description: "Gestiona tu perfil y configuración de cuenta",
};

export default function PerfilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
