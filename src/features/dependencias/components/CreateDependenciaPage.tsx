"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { AppNavbar } from "@/shared/components/AppNavbar";
import { AppFooter } from "@/shared/components/AppFooter";
import { ApiError, getApiErrorMessage } from "@/shared/types/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCreateDependencia } from "../hooks/useCreateDependencia";
import {
  createDependenciaSchema,
  type CreateDependenciaFormData,
} from "../schemas/dependencia.schema";

export function CreateDependenciaPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);
  const { create, isPending, error: mutationError } = useCreateDependencia();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateDependenciaFormData>({
    resolver: zodResolver(createDependenciaSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(data: CreateDependenciaFormData) {
    setServerError(null);
    try {
      const res = await create({ name: data.name });
      const dependenciaId = res.data.id;
      router.push(`/dependencias/${dependenciaId}`);
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (err instanceof ApiError && err.details.length > 0) {
        err.details.forEach(({ campo, mensaje }) => {
          if (campo === "name") {
            setError("name", { type: "server", message: mensaje });
          }
        });
      } else {
        setServerError(message);
      }
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  const navbarUser = user ? { name: user.name, email: user.email } : null;

  const mutationTopLevelError =
    serverError ?? (mutationError ? getApiErrorMessage(mutationError) : null);

  return (
    <div className="min-h-screen bg-(--light-grey) dark:bg-(--navy-deep)">
      <AppNavbar
        user={navbarUser}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <main className="mx-auto flex max-w-5xl flex-1 flex-col px-4 py-10 lg:px-8">
        <section className="mx-auto w-full max-w-2xl">
          <header className="mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-(--slate-text) shadow-sm dark:bg-slate-900/70">
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-(--cyan-accent)/10 text-(--cyan-accent)">
                <Building2 className="size-3.5" aria-hidden />
              </span>
              Nueva dependencia
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-(--navy-deep) dark:text-white sm:text-3xl">
              Crea tu dependencia inicial
            </h1>
            <p className="max-w-xl text-sm text-(--slate-text)">
              Registra la unidad organizativa que agrupa tus Áreas Naturales
              Protegidas. Con el plan FREE podrás crear una dependencia y su
              primera área para comenzar a operar.
            </p>
          </header>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            {mutationTopLevelError && (
              <div
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                role="alert"
              >
                {mutationTopLevelError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label
                  htmlFor="dependencia-name"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep) dark:text-slate-200"
                >
                  Nombre de la dependencia
                </label>
                <input
                  id="dependencia-name"
                  type="text"
                  autoComplete="organization"
                  placeholder="Ej. CONANP Tuxpan"
                  className="w-full rounded-lg border border-slate-200 bg-white py-3 px-3 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <p className="text-xs text-(--slate-text)">
                Podrás crear tu primera área dentro de esta dependencia después
                de guardarla. En cualquier momento podrás gestionar invitaciones
                y configuración desde el panel de la dependencia.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/select-organization")}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover) disabled:opacity-70"
                >
                  {isPending && (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  )}
                  Crear dependencia
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}

