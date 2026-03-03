"use client";

import { useEffect } from "react";
import Link from "next/link";
import { User, Key, Trash2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { DeleteAccountSection } from "./DeleteAccountSection";

export function ProfileContent() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (typeof window !== "undefined" && !user) {
      window.location.href = "/auth/login";
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-500">Redirigiendo…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-(--navy-deep) dark:text-white">
          Mi perfil
        </h2>
        <p className="text-(--slate-text)">
          Gestiona tu información personal y configuración de cuenta.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-(--cyan-accent)/10">
            <User className="size-5 text-(--cyan-accent)" aria-hidden />
          </div>
          <h3 className="text-lg font-semibold text-(--navy-deep) dark:text-white">
            Datos personales
          </h3>
        </div>
        <ProfileForm user={user} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/30">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-(--cyan-accent)/10">
            <Key className="size-5 text-(--cyan-accent)" aria-hidden />
          </div>
          <h3 className="text-lg font-semibold text-(--navy-deep) dark:text-white">
            Cambiar contraseña
          </h3>
        </div>
        <ChangePasswordForm />
      </section>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <Trash2 className="size-5 text-red-600 dark:text-red-400" aria-hidden />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
            Eliminar cuenta
          </h3>
        </div>
        <DeleteAccountSection />
      </section>

      <p className="text-sm text-(--slate-text)">
        <Link
          href="/select-organization"
          className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-(--cyan-accent)/50 focus:ring-offset-2"
        >
          Volver a seleccionar dependencia
        </Link>
      </p>
    </div>
  );
}
