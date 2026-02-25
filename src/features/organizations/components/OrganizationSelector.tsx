"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Waves,
  Landmark,
  Mountain,
  Leaf,
  Plus,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { AppFooter } from "@/shared/components/AppFooter";
import { AppNavbar } from "@/shared/components/AppNavbar";
import { getApiErrorMessage } from "@/shared/types/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useOrganizations } from "../hooks/useOrganizations";
import type { Organization } from "../types";

const ECOSYSTEM_LABELS: Record<string, string> = {
  terrestre: "Terrestre",
  maritimo: "Marítimo",
  mixto: "Mixto",
};

function OrganizationCard({
  organization,
  onSelect,
}: {
  organization: Organization;
  onSelect: (id: string) => void;
}) {
  const label =
    ECOSYSTEM_LABELS[organization.ecosystem_type] ?? organization.ecosystem_type;
  const Icon =
    organization.ecosystem_type === "maritimo"
      ? Waves
      : organization.ecosystem_type === "terrestre"
        ? Mountain
        : Leaf;

  return (
    <button
      type="button"
      onClick={() => onSelect(organization.id)}
      className="anp-card group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-(--cyan-accent) hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-(--cyan-accent)/50 focus:ring-offset-2"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
        <div className="flex h-full w-full items-center justify-center">
          <Icon
            className="size-16 text-(--slate-text)/40 transition-transform duration-500 group-hover:scale-110"
            aria-hidden
          />
        </div>
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-(--navy-deep) dark:bg-(--navy-deep)/90 dark:text-white">
            Activo
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold leading-tight transition-colors group-hover:text-(--cyan-accent)">
            {organization.name}
          </h3>
          <ChevronDown className="size-4 shrink-0 -rotate-90 text-(--slate-text)" aria-hidden />
        </div>
        <p className="mb-1 flex items-center gap-1 text-sm font-medium text-(--slate-text)">
          <MapPin className="size-3.5" aria-hidden />
          {label}
        </p>
        <p className="flex items-center gap-1 text-sm text-(--slate-text)">
          <Landmark className="size-3.5" aria-hidden />
          Área Natural Protegida
        </p>
      </div>
    </button>
  );
}

function AddOrganizationCard() {
  return (
    <Link
      href="/organizations/new"
      className="group flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 p-8 transition-all duration-300 hover:border-(--cyan-accent) hover:bg-(--cyan-accent)/5 dark:border-slate-700 dark:hover:bg-(--cyan-accent)/10"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-(--cyan-accent) group-hover:text-white dark:bg-slate-800">
        <Plus className="size-8 text-(--slate-text)" aria-hidden />
      </div>
      <p className="font-bold text-(--slate-text) transition-colors group-hover:text-(--cyan-accent)">
        Solicitar Nueva ANP
      </p>
      <p className="px-4 text-center text-xs text-(--slate-text)/80">
        Contacta al administrador para vincular una nueva zona.
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
        ¿No encuentras tu área?
      </h3>
      <p className="mb-6 max-w-sm text-sm text-(--slate-text)">
        Si eres administrador y no visualizas el área (ANP) asignada, puedes
        dar de alta una nueva o ingresar mediante un código.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/organizations/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--cyan-accent) px-6 py-3 font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover)"
        >
          <Plus className="size-5" aria-hidden />
          Crear área
        </Link>
        <Link
          href="/organizations/join"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-(--cyan-accent)/30 px-6 py-3 font-semibold text-(--cyan-accent) transition-colors hover:bg-(--cyan-accent)/5"
        >
          Ingresar código de acceso
        </Link>
      </div>
    </div>
  );
}

export function OrganizationSelector() {
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: organizations = [],
    pagination,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useOrganizations();

  const filteredOrganizations = useMemo(() => {
    if (!searchQuery.trim()) return organizations;
    const q = searchQuery.trim().toLowerCase();
    return organizations.filter((org) =>
      org.name.toLowerCase().includes(q)
    );
  }, [organizations, searchQuery]);

  const stats = useMemo(() => {
    const total = organizations.length;
    const maritimo = organizations.filter((o) => o.ecosystem_type === "maritimo").length;
    const terrestre = organizations.filter((o) => o.ecosystem_type === "terrestre").length;
    return { total, maritimo, terrestre };
  }, [organizations]);

  const hasOrganizations = organizations.length > 0;
  const errorMessage = error ? getApiErrorMessage(error) : null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSelect = (areaId: string) => {
    window.location.href = `/areas/${areaId}`;
  };

  const navbarUser = user
    ? { name: user.name, email: user.email }
    : null;

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
        {/* Hero / Welcome */}
        <section className="mb-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold tracking-tight text-(--navy-deep) dark:text-white">
                Seleccionar área
              </h2>
              <p className="text-lg text-(--slate-text)">
                Bienvenido de nuevo. Elige un Área Natural Protegida (ANP) para
                gestionar.
              </p>
            </div>
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
                  placeholder="Buscar por nombre, tipo o estado..."
                  className="block w-full rounded-xl border-0 bg-white py-3 pl-10 pr-4 text-(--navy-deep) ring-1 ring-slate-200 placeholder:text-(--slate-text) transition-all focus:ring-2 focus:ring-(--cyan-accent) dark:bg-slate-900 dark:text-white dark:ring-slate-800"
                  aria-label="Buscar áreas"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        {!isLoading && !isError && (
          <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex size-12 items-center justify-center rounded-lg bg-(--cyan-accent)/10">
                <Landmark className="size-6 text-(--cyan-accent)" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-(--slate-text)">
                  Total Áreas
                </p>
                <p className="text-2xl font-bold text-(--navy-deep) dark:text-white">
                  {stats.total}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex size-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Waves className="size-6 text-blue-500" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-(--slate-text)">
                  Zonas Marinas
                </p>
                <p className="text-2xl font-bold text-(--navy-deep) dark:text-white">
                  {stats.maritimo}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex size-12 items-center justify-center rounded-lg bg-green-500/10">
                <Mountain className="size-6 text-green-500" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-(--slate-text)">
                  Zonas Terrestres
                </p>
                <p className="text-2xl font-bold text-(--navy-deep) dark:text-white">
                  {stats.terrestre}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content: loading / error / grid */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                aria-hidden
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="text-red-700 dark:text-red-300">
              {errorMessage ?? "No se pudieron cargar las áreas."}
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredOrganizations.map((org) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                onSelect={handleSelect}
              />
            ))}
            {hasOrganizations && <AddOrganizationCard />}
            {!hasOrganizations && <EmptyState />}
          </div>
        )}

        {/* Pagination / summary */}
        {!isLoading && !isError && hasOrganizations && pagination && (
          <div className="mt-16 flex flex-col items-center">
            <p className="mt-4 text-xs text-(--slate-text)">
              Mostrando {filteredOrganizations.length} de{" "}
              {pagination.total} áreas registradas
            </p>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}
