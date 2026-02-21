"use client";

import Link from "next/link";
import { Waves, MapPin, ChevronRight, Landmark, PlusCircle } from "lucide-react";
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
  const label = ECOSYSTEM_LABELS[organization.ecosystem_type] ?? organization.ecosystem_type;
  return (
    <button
      type="button"
      onClick={() => onSelect(organization.id)}
      className="group w-full rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-[var(--cyan-accent)]/30 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--cyan-accent)]/50 focus:ring-offset-2"
    >
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--slate-text)]">
        {label}
      </div>
      <h3 className="mb-2 text-lg font-bold text-[var(--navy-deep)]">
        {organization.name}
      </h3>
      <div className="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
        <MapPin className="h-4 w-4 shrink-0" aria-hidden />
        <span>Área Natural Protegida</span>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--cyan-accent)] group-hover:text-[var(--cyan-hover)]">
        Seleccionar organización
        <ChevronRight className="h-4 w-4" aria-hidden />
      </span>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center sm:p-12">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--navy-deep)]/5">
        <Landmark className="h-8 w-8 text-[var(--navy-deep)]" aria-hidden />
      </div>
      <h3 className="mb-2 text-lg font-bold text-[var(--navy-deep)]">
        ¿No encuentras tu organización?
      </h3>
      <p className="mb-6 max-w-sm text-sm text-slate-600">
        Si eres administrador y no visualizas el área asignada, puedes dar de
        alta una nueva o ingresar mediante un código.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/organizations/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--cyan-accent)] px-6 py-3 font-bold text-[var(--navy-deep)] transition-colors hover:bg-[var(--cyan-hover)]"
        >
          <PlusCircle className="h-5 w-5" aria-hidden />
          Crear organización
        </Link>
        <Link
          href="/organizations/join"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--cyan-accent)]/30 px-6 py-3 font-semibold text-[var(--cyan-accent)] transition-colors hover:bg-[var(--cyan-accent)]/5"
        >
          Ingresar código de acceso
        </Link>
      </div>
    </div>
  );
}

export function OrganizationSelector() {
  const { data: organizations = [], isLoading, isError } = useOrganizations();
  const hasOrganizations = organizations.length > 0;

  const handleSelect = (organizationId: string) => {
    // TODO: persist selected org (e.g. zustand or cookie) and navigate to dashboard
    window.location.href = `/${organizationId}`;
  };

  return (
    <div className="min-h-screen bg-[var(--light-grey)]">
      {/* Header: mobile-first, sticky */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--navy-deep)]"
          >
            <Waves
              className="h-7 w-7 text-[var(--cyan-accent)] sm:h-8 sm:w-8"
              strokeWidth={1.5}
              aria-hidden
            />
            <span className="text-lg font-bold tracking-tight sm:text-xl">
              CONANP <span className="text-[var(--cyan-accent)]">ERP</span>
            </span>
          </Link>
          {/* Hamburger / profile area: placeholder for dropdown */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-[var(--navy-deep)]"
            >
              Cerrar sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--navy-deep)] sm:text-3xl">
            Seleccionar Organización
          </h1>
          <p className="mt-2 text-slate-600">
            Bienvenido de nuevo. Elige un área natural protegida para comenzar
            la gestión administrativa.
          </p>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl bg-slate-200"
                aria-hidden
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            No se pudieron cargar las organizaciones. Revisa tu conexión e
            intenta de nuevo.
          </div>
        )}

        {!isLoading && !isError && hasOrganizations && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && !hasOrganizations && <EmptyState />}
      </main>
    </div>
  );
}
