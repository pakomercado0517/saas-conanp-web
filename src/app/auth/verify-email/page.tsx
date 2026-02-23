import Link from "next/link";
import { Waves } from "lucide-react";
import { AuthBrandingPanel } from "@/features/auth/components/AuthBrandingPanel";
import { VerifyEmailResult } from "@/features/auth/components/VerifyEmailResult";

export const metadata = {
  title: "Verificar correo | CONANP ERP",
  description: "Verificación de correo electrónico de tu cuenta",
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.token ?? null;

  return (
    <main className="flex min-h-screen items-stretch">
      <div className="hidden lg:flex lg:min-h-screen lg:flex-1">
        <AuthBrandingPanel />
      </div>
      <div className="flex min-h-screen w-full flex-1 flex-col justify-between bg-white lg:w-1/2">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-(--navy-deep)"
            >
              <Waves
                className="h-8 w-8 text-(--cyan-accent)"
                strokeWidth={1.5}
              />
              <span className="text-xl font-bold tracking-tight">
                CONANP <span className="text-(--cyan-accent)">ERP</span>
              </span>
            </Link>
            <h1 className="mt-8 text-3xl font-bold text-(--navy-deep)">
              Verificar correo electrónico
            </h1>
            <p className="mt-2 text-slate-500">
              Comprobando tu enlace de verificación
            </p>
            <div className="mt-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <VerifyEmailResult token={token} />
            </div>
          </div>
        </div>
        <footer className="border-t border-slate-100 px-6 py-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <Link href="/auth/login" className="hover:text-slate-600">
              Iniciar sesión
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
