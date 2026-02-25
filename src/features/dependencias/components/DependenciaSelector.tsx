"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  Plus,
  ChevronRight,
  MapPin,
  Users,
  Landmark,
} from "lucide-react";
import { AppFooter } from "@/shared/components/AppFooter";
import { AppNavbar } from "@/shared/components/AppNavbar";
import { getApiErrorMessage } from "@/shared/types/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useDependencias } from "../hooks/useDependencias";
import type { Dependencia } from "../types";

function DependenciaCard({
  dependencia,
  areasCount,
  onSelect,
}: {
  dependencia: Dependencia;
  areasCount?: number;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(dependencia.id)}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-(--cyan-accent) hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-(--cyan-accent)/50 focus:ring-offset-2"
    >
      <div className="relative flex aspect-[3/1] items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <Building2
          className="size-12 text-(--slate-text)/30 transition-transform duration-500 group-hover:scale-110"
          aria-hidden
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold leading-tight text-(--navy-deep) transition-colors group-hover:text-(--cyan-accent) dark:text-white">
            {dependencia.name}
          </h3>
          <ChevronRight
            className="mt-1 size-4 shrink-0 text-(--slate-text) transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-(--slate-text)">
          {areasCount != null && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {areasCount} {areasCount === 1 ? "área" : "áreas"}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="size-3.5" aria-hidden />
            Plan FREE
          </span>
        </div>
      </div>
    </button>
  );
}

function AddDependenciaCard() {
  return (
    <Link
      href="/dependencias/nueva"
      className="group flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 p-8 transition-all duration-300 hover:border-(--cyan-accent) hover:bg-(--cyan-accent)/5 dark:border-slate-700 dark:hover:bg-(--cyan-accent)/10"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-(--cyan-accent) group-hover:text-white dark:bg-slate-800">
        <Plus className="size-8 text-(--slate-text)" aria-hidden />
      </div>
      <p className="font-bold text-(--slate-text) transition-colors group-hover:text-(--cyan-accent)">
        Crear nueva dependencia
      </p>
      <p className="px-4 text-center text-xs text-(--slate-text)/80">
        Registra una nueva unidad organizativa para gestionar tus áreas.
      </p>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/30 sm:p-12">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-(--navy-deep)/5">
        <Landmark className="size-8 text-(--navy-deep)" aria-hidden />
      </div>
      <h3 className="mb-2 text-lg font-bold text-(--navy-deep) dark:text-white">
        Aún no tienes dependencias
      </h3>
      <p className="mb-6 max-w-sm text-sm text-(--slate-text)">
        Crea tu primera dependencia para empezar a gestionar tus Áreas
        Naturales Protegidas.
      </p>
      <Link
        href="/dependencias/nueva"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--cyan-accent) px-6 py-3 font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover)"
      >
        <Plus className="size-5" aria-hidden />
        Crear dependencia
      </Link>
    </div>
  );
}

export function DependenciaSelector() {
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: dependencias = [],
    pagination,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useDependencias();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return dependencias;
    const q = searchQuery.trim().toLowerCase();
    return dependencias.filter((d) => d.name.toLowerCase().includes(q));
  }, [dependencias, searchQuery]);

  const hasDependencias = dependencias.length > 0;
  const errorMessage = error ? getApiErrorMessage(error) : null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSelect = (depId: string) => {
    window.location.href = `/dependencias/${depId}`;
  };

  const navbarUser = user ? { name: user.name, email: user.email } : null;

  return (
    <div className="min-h-screen bg-(--light-grey) dark:bg-(--navy-deep)">
      <AppNavbar
        user={navbarUser}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        onRefresh={() => refetch()}
        isRefreshing={isFetching && !isLoading}
      />

      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <section className="mb-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold tracking-tight text-(--navy-deep) dark:text-white">
                Seleccionar dependencia
              </h2>
              <p className="text-lg text-(--slate-text)">
                Elige una dependencia para gestionar sus áreas naturales
                protegidas.
              </p>
            </div>
            {hasDependencias && (
              <div className="w-full max-w-md">
                <div className="relative">
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                    aria-hidden
                  >
                    <Search className="size-5 text-(--slate-text)" />
                  </span>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar dependencia por nombre..."
                    className="block w-full rounded-xl border-0 bg-white py-3 pl-10 pr-4 text-(--navy-deep) ring-1 ring-slate-200 placeholder:text-(--slate-text) transition-all focus:ring-2 focus:ring-(--cyan-accent) dark:bg-slate-900 dark:text-white dark:ring-slate-800"
                    aria-label="Buscar dependencias"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Stats */}
        {!isLoading && !isError && hasDependencias && (
          <div className="mb-10 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex size-10 items-center justify-center rounded-lg bg-(--cyan-accent)/10">
                <Building2
                  className="size-5 text-(--cyan-accent)"
                  aria-hidden
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-(--slate-text)">
                  Dependencias
                </p>
                <p className="text-xl font-bold text-(--navy-deep) dark:text-white">
                  {dependencias.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                aria-hidden
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="text-red-700 dark:text-red-300">
              {errorMessage ?? "No se pudieron cargar las dependencias."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-800 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/50"
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((dep) => (
              <DependenciaCard
                key={dep.id}
                dependencia={dep}
                onSelect={handleSelect}
              />
            ))}
            {hasDependencias && <AddDependenciaCard />}
            {!hasDependencias && <EmptyState />}
          </div>
        )}

        {!isLoading && !isError && hasDependencias && pagination && (
          <div className="mt-16 flex flex-col items-center">
            <p className="mt-4 text-xs text-(--slate-text)">
              Mostrando {filtered.length} de {pagination.total} dependencias
            </p>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}
