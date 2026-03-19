import type { Metadata } from "next";
import { Inter, Roboto_Slab } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "./providers/QueryProvider";
import { AlertDialogProvider } from "@/shared/components/AlertDialogProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "CONANP ERP | Gestión de Áreas Naturales Protegidas",
  description:
    "Plataforma para la gestión de operación turística regulada en Áreas Naturales Protegidas",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={robotoSlab.variable}>
      <body className={`${inter.className} antialiased`}>
        <QueryProvider>
          <AlertDialogProvider>{children}</AlertDialogProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
