import Link from "next/link";
import { Waves } from "lucide-react";
import { AuthBrandingPanel } from "@/features/auth/components/AuthBrandingPanel";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const metadata = {
  title: "Restablecer contraseña | CONANP ERP",
  description:
    "Restablece la contraseña de tu cuenta con el enlace enviado por correo",
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
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
              Restablecer contraseña
            </h1>
            <p className="mt-2 text-slate-500">
              Ingresa tu nueva contraseña. El enlace es válido por tiempo limitado.
            </p>
            <div className="mt-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              {token && token.length >= 10 ? (
                <ResetPasswordForm token={token} />
              ) : (
                <div className="mt-6 space-y-5">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                    <p className="text-sm text-red-700">
                      Enlace inválido o expirado. Solicita un nuevo enlace desde la pantalla de recuperar contraseña.
                    </p>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--navy-deep) py-3 font-bold text-white shadow-md transition-colors hover:bg-(--navy-light)"
                  >
                    Recuperar contraseña
                  </Link>
                  <Link
                    href="/login"
                    className="mt-2 flex w-full justify-center text-sm text-(--cyan-accent) hover:text-(--cyan-hover)"
                  >
                    Iniciar sesión
                  </Link>
                </div>
              )}
            </div>
            <p className="mt-8 text-center text-sm text-slate-500">
              ¿Recordaste tu contraseña?{" "}
              <Link
                href="/login"
                className="font-medium text-(--cyan-accent) hover:text-(--cyan-hover)"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
        <footer className="border-t border-slate-100 px-6 py-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <Link href="/login" className="hover:text-slate-600">
              Iniciar sesión
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
