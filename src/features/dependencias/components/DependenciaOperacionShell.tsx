"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppNavbar } from "@/shared/components/AppNavbar";
import { AppFooter } from "@/shared/components/AppFooter";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface DependenciaOperacionShellProps {
  dependenciaId: string;
  title: string;
  description?: string;
  /** Por defecto: hub de la dependencia. */
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}

export function DependenciaOperacionShell({
  dependenciaId,
  title,
  description,
  backHref,
  backLabel = "Volver al hub de dependencia",
  children,
}: DependenciaOperacionShellProps) {
  const resolvedBack = backHref ?? `/dependencias/${dependenciaId}`;
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navbarUser = user ? { name: user.name, email: user.email } : null;

  return (
    <div className="min-h-screen bg-(--light-grey) dark:bg-(--navy-deep)">
      <AppNavbar
        user={navbarUser}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-6">
          <Link
            href={resolvedBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-(--slate-text) transition-colors hover:text-(--cyan-accent)"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {backLabel}
          </Link>
        </div>
        <header className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-(--navy-deep) dark:text-white">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm text-(--slate-text)">{description}</p>
          ) : null}
        </header>
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
