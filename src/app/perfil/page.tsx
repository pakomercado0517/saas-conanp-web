"use client";

import { useState } from "react";
import Link from "next/link";
import { AppNavbar } from "@/shared/components/AppNavbar";
import { AppFooter } from "@/shared/components/AppFooter";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ProfileContent } from "@/features/profile/components/ProfileContent";

export default function PerfilPage() {
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
        <div className="mb-8">
          <Link
            href="/select-organization"
            className="inline-flex items-center gap-2 text-sm font-medium text-(--slate-text) hover:text-(--navy-deep) dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-(--cyan-accent)/50 focus:ring-offset-2"
          >
            ← Volver
          </Link>
        </div>
        <ProfileContent />
      </main>

      <AppFooter />
    </div>
  );
}
