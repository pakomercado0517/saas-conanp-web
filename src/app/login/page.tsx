import Link from "next/link";
import { Waves } from "lucide-react";
import { AuthBrandingPanel } from "@/features/auth/components/AuthBrandingPanel";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Iniciar sesión | CONANP ERP",
  description:
    "Accede a la plataforma de gestión de Áreas Naturales Protegidas",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      {/* Left: Branding (hidden on mobile) */}
      <div className="hidden min-h-screen lg:block lg:flex-1">
        <AuthBrandingPanel />
      </div>

      {/* Right: Form */}
      <div className="flex min-h-screen w-full flex-col justify-between bg-white lg:w-1/2">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md">
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--navy-deep)]"
            >
              <Waves
                className="h-8 w-8 text-[var(--cyan-accent)]"
                strokeWidth={1.5}
              />
              <span className="text-xl font-bold tracking-tight">
                CONANP <span className="text-[var(--cyan-accent)]">ERP</span>
              </span>
            </Link>

            <h1 className="mt-8 text-3xl font-bold text-[var(--navy-deep)]">
              Welcome back
            </h1>
            <p className="mt-2 text-slate-500">
              Please enter your credentials to access the ERP
            </p>

            <div className="mt-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <LoginForm />
            </div>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-[var(--cyan-accent)] hover:text-[var(--cyan-hover)]"
              >
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-100 px-6 py-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <Link href="#" className="hover:text-slate-600">
              PRIVACY
            </Link>
            <span aria-hidden>•</span>
            <Link href="#" className="hover:text-slate-600">
              SECURITY
            </Link>
            <span aria-hidden>•</span>
            <Link href="#" className="hover:text-slate-600">
              SUPPORT
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
