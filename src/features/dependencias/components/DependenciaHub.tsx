"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ListChecks,
  UserPlus,
  UsersRound,
  Users,
} from "lucide-react";
import { AppNavbar } from "@/shared/components/AppNavbar";
import { AppFooter } from "@/shared/components/AppFooter";
import { getApiErrorMessage } from "@/shared/types/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useDependenciaContext } from "../context/DependenciaContext";
import { AreaGrid } from "./AreaGrid";
import { CreateAreaDialog } from "./CreateAreaDialog";
import { CreateDependenciaInvitationDialog } from "./CreateDependenciaInvitationDialog";
import { DependenciaInvitationsList } from "./DependenciaInvitationsList";
import { DependenciaPlanCard } from "./DependenciaPlanCard";
import { useMembershipRolesInAreas } from "@/features/memberships/hooks/useMembershipRolesInAreas";

interface DependenciaHubProps {
  dependenciaId: string;
}

export function DependenciaHub({ dependenciaId }: DependenciaHubProps) {
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);
  const {
    dependencia,
    areas,
    invitations,
    isLoading,
    error,
    canCreateArea,
    maxAreas,
    planName,
    refetch,
  } = useDependenciaContext();

  const areaIds = areas.map((a) => a.id);
  const { isAdminInAnyArea, isLoading: rolesLoading } =
    useMembershipRolesInAreas(areaIds);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showCreateArea, setShowCreateArea] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSelectArea = (areaId: string) => {
    window.location.href = `/areas/${areaId}`;
  };

  const navbarUser = user ? { name: user.name, email: user.email } : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--light-grey) dark:bg-(--navy-deep)">
        <AppNavbar
          user={navbarUser}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
        <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="space-y-6">
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !dependencia) {
    const errorMessage = getApiErrorMessage(error);
    return (
      <div className="min-h-screen bg-(--light-grey) dark:bg-(--navy-deep)">
        <AppNavbar
          user={navbarUser}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
        <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="text-red-700 dark:text-red-300">
              {errorMessage ?? "No se pudo cargar la dependencia."}
            </p>
            <Link
              href="/select-organization"
              className="mt-4 inline-block rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-slate-900 dark:text-red-300"
            >
              Volver al selector
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--light-grey) dark:bg-(--navy-deep)">
      <AppNavbar
        user={navbarUser}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/select-organization"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-(--slate-text) transition-colors hover:text-(--cyan-accent)"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Todas las dependencias
          </Link>
        </div>

        {/* Header */}
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-(--cyan-accent)/10">
              <Building2
                className="size-7 text-(--cyan-accent)"
                aria-hidden
              />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-(--navy-deep) dark:text-white">
                {dependencia?.name ?? "Dependencia"}
              </h2>
              <p className="text-sm text-(--slate-text)">
                {areas.length} {areas.length === 1 ? "área" : "áreas"}{" "}
                registradas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowInviteDialog(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-(--navy-deep) transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              <UserPlus className="size-4" aria-hidden />
              Invitar miembro
            </button>
            {canCreateArea && (
              <button
                type="button"
                onClick={() => setShowCreateArea(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-(--cyan-accent) px-4 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover)"
              >
                Crear área
              </button>
            )}
          </div>
        </section>

        {!rolesLoading && areas.length > 0 && (
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href={`/dependencias/${dependenciaId}/prestadores`}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-(--cyan-accent)/50 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-(--cyan-accent)/10 transition-colors group-hover:bg-(--cyan-accent)/20">
                <UsersRound
                  className="size-6 text-(--cyan-accent)"
                  aria-hidden
                />
              </span>
              <span>
                <span className="block text-base font-bold text-(--navy-deep) dark:text-white">
                  Prestadores de la dependencia
                </span>
                <span className="text-sm text-(--slate-text)">
                  Listado y alta de prestadores en todas las ANP
                </span>
              </span>
            </Link>
            {isAdminInAnyArea ? (
              <>
                <Link
                  href={`/dependencias/${dependenciaId}/usuarios`}
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-(--cyan-accent)/50 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                >
                  <span className="flex size-12 items-center justify-center rounded-xl bg-(--cyan-accent)/10 transition-colors group-hover:bg-(--cyan-accent)/20">
                    <Users
                      className="size-6 text-(--cyan-accent)"
                      aria-hidden
                    />
                  </span>
                  <span>
                    <span className="block text-base font-bold text-(--navy-deep) dark:text-white">
                      Usuarios por área
                    </span>
                    <span className="text-sm text-(--slate-text)">
                      Accede a membresías de cada ANP
                    </span>
                  </span>
                </Link>
                <Link
                  href={`/dependencias/${dependenciaId}/requisitos-catalogo`}
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-(--cyan-accent)/50 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                >
                  <span className="flex size-12 items-center justify-center rounded-xl bg-(--cyan-accent)/10 transition-colors group-hover:bg-(--cyan-accent)/20">
                    <ListChecks
                      className="size-6 text-(--cyan-accent)"
                      aria-hidden
                    />
                  </span>
                  <span>
                    <span className="block text-base font-bold text-(--navy-deep) dark:text-white">
                      Catálogo de requisitos
                    </span>
                    <span className="text-sm text-(--slate-text)">
                      Requisitos de activos por tipo para las ANP
                    </span>
                  </span>
                </Link>
              </>
            ) : null}
          </section>
        )}

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Áreas */}
          <section>
            <h3 className="mb-4 text-lg font-bold text-(--navy-deep) dark:text-white">
              Áreas Naturales Protegidas
            </h3>
            <AreaGrid
              areas={areas}
              canCreateArea={canCreateArea}
              onSelectArea={handleSelectArea}
              onCreateArea={() => setShowCreateArea(true)}
            />
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            <DependenciaPlanCard
              areasCount={areas.length}
              maxAreas={maxAreas}
              planName={planName}
            />
            {!canCreateArea && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                Has alcanzado el límite de <strong>{maxAreas} {maxAreas === 1 ? "área" : "áreas"}</strong> para esta dependencia. Para registrar más Áreas Naturales
                Protegidas necesitarás actualizar tu plan.
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-(--navy-deep) dark:text-white">
                  Invitaciones pendientes
                </h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-(--slate-text) dark:bg-slate-700">
                  {invitations.length}
                </span>
              </div>
              <DependenciaInvitationsList
                dependenciaId={dependenciaId}
                invitations={invitations}
              />
            </div>
          </aside>
        </div>
      </main>

      <AppFooter />

      <CreateAreaDialog
        dependenciaId={dependenciaId}
        open={showCreateArea}
        onClose={() => setShowCreateArea(false)}
      />

      <CreateDependenciaInvitationDialog
        dependenciaId={dependenciaId}
        open={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
      />
    </div>
  );
}
