"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  LayoutGrid,
  ListChecks,
  UserPlus,
  UsersRound,
  Users,
} from "lucide-react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useDependenciaContext } from "../context/DependenciaContext";
import { AreaGrid } from "./AreaGrid";
import { CreateAreaDialog } from "./CreateAreaDialog";
import { CreateDependenciaInvitationDialog } from "./CreateDependenciaInvitationDialog";
import { DependenciaInvitationsList } from "./DependenciaInvitationsList";
import { DependenciaPlanCard } from "./DependenciaPlanCard";
import { useMembershipRolesInAreas } from "@/features/memberships/hooks/useMembershipRolesInAreas";
import { QuickActionCardSkeleton } from "@/shared/components/loading/QuickActionCardSkeleton";

interface DependenciaHubProps {
  dependenciaId: string;
}

export function DependenciaHub({ dependenciaId }: DependenciaHubProps) {
  const {
    dependencia,
    areas,
    invitations,
    isLoading,
    error,
    canCreateArea,
    maxAreas,
    planName,
  } = useDependenciaContext();

  const areaIds = areas.map((a) => a.id);
  const { isAdminInAnyArea, isLoading: rolesLoading } =
    useMembershipRolesInAreas(areaIds);

  const [showCreateArea, setShowCreateArea] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const handleSelectArea = (areaId: string) => {
    window.location.href = `/areas/${areaId}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
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
    );
  }

  if (error && !dependencia) {
    const errorMessage = getApiErrorMessage(error);
    return (
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
    );
  }

  return (
    <>
      {/* Hero — alineado a referencia Stitch (Hub de Dependencia) */}
      <section className="mb-10 rounded-2xl border border-slate-200/90 bg-linear-to-br from-white via-white to-slate-50/90 p-6 shadow-sm dark:border-slate-700/80 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-950/80 sm:p-8 md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-(--cyan-accent)/12 ring-1 ring-(--cyan-accent)/20">
              <Building2
                className="size-8 text-(--cyan-accent)"
                aria-hidden
              />
            </div>
            <div className="min-w-0 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-(--cyan-accent)">
                Administración de la dependencia
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-(--navy-deep) dark:text-white md:text-4xl">
                {dependencia?.name ?? "Dependencia"}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-(--slate-text)">
                Gestiona el acceso por sector, los prestadores de servicios y la
                supervisión de las áreas naturales protegidas vinculadas a esta
                dependencia. Desde aquí puedes invitar miembros, crear nuevas ANP
                y abrir los módulos operativos.
              </p>
              <p className="text-sm font-medium text-(--navy-deep)/80 dark:text-white/70">
                {areas.length}{" "}
                {areas.length === 1
                  ? "área natural protegida registrada"
                  : "áreas naturales protegidas registradas"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <button
              type="button"
              onClick={() => setShowInviteDialog(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-(--navy-deep) shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              <UserPlus className="size-4" aria-hidden />
              Invitar miembro
            </button>
            {canCreateArea && (
              <button
                type="button"
                onClick={() => setShowCreateArea(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--cyan-accent) px-5 py-3 text-sm font-bold text-(--navy-deep) shadow-sm transition-colors hover:bg-(--cyan-hover)"
              >
                Crear área
              </button>
            )}
          </div>
        </div>
      </section>

      {areas.length > 0 && (
        <section className="mb-10">
          <h2 className="sr-only">Accesos rápidos</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rolesLoading ? (
              <>
                <QuickActionCardSkeleton />
                <QuickActionCardSkeleton />
                <QuickActionCardSkeleton />
              </>
            ) : (
              <>
                <Link
                  href={`/dependencias/${dependenciaId}/prestadores`}
                  className="group flex flex-col justify-between gap-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:border-(--cyan-accent)/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/85 dark:hover:border-(--cyan-accent)/30"
                >
                  <div className="flex gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-(--cyan-accent)/10 ring-1 ring-(--cyan-accent)/15 transition-colors group-hover:bg-(--cyan-accent)/18">
                      <UsersRound
                        className="size-7 text-(--cyan-accent)"
                        aria-hidden
                      />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-(--navy-deep) dark:text-white">
                        Prestadores de la dependencia
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-(--slate-text)">
                        Contratos, servicios y altas de prestadores en todas las
                        ANP de la dependencia.
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-(--cyan-accent)">
                    Gestionar prestadores
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
                {isAdminInAnyArea ? (
                  <>
                    <Link
                      href={`/dependencias/${dependenciaId}/usuarios`}
                      className="group flex flex-col justify-between gap-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:border-(--cyan-accent)/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/85 dark:hover:border-(--cyan-accent)/30"
                    >
                      <div className="flex gap-4">
                        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-(--cyan-accent)/10 ring-1 ring-(--cyan-accent)/15 transition-colors group-hover:bg-(--cyan-accent)/18">
                          <Users
                            className="size-7 text-(--cyan-accent)"
                            aria-hidden
                          />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-(--navy-deep) dark:text-white">
                            Usuarios por área
                          </h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-(--slate-text)">
                            Membresías, roles e invitaciones por cada área natural
                            protegida.
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-(--cyan-accent)">
                        Ver directorio por área
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </Link>
                    <Link
                      href={`/dependencias/${dependenciaId}/requisitos-catalogo`}
                      className="group flex flex-col justify-between gap-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:border-(--cyan-accent)/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/85 dark:hover:border-(--cyan-accent)/30"
                    >
                      <div className="flex gap-4">
                        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-(--cyan-accent)/10 ring-1 ring-(--cyan-accent)/15 transition-colors group-hover:bg-(--cyan-accent)/18">
                          <ListChecks
                            className="size-7 text-(--cyan-accent)"
                            aria-hidden
                          />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-(--navy-deep) dark:text-white">
                            Catálogo de requisitos
                          </h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-(--slate-text)">
                            Requisitos de activos por tipo al crear o configurar
                            ANP.
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-(--cyan-accent)">
                        Abrir catálogo
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </Link>
                  </>
                ) : null}
              </>
            )}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px] lg:gap-12">
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-(--navy-deep) dark:text-white md:text-2xl">
                Áreas naturales protegidas
              </h2>
              <p className="mt-1 text-sm text-(--slate-text)">
                Monitorea y entra al panel de cada ANP.
              </p>
            </div>
            <div
              className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-2 py-1.5 text-(--slate-text) dark:border-slate-600 dark:bg-slate-800/80 sm:flex"
              aria-hidden
            >
              <LayoutGrid className="size-5 text-(--cyan-accent)" />
            </div>
          </div>
          <AreaGrid
            areas={areas}
            canCreateArea={canCreateArea}
            onSelectArea={handleSelectArea}
            onCreateArea={() => setShowCreateArea(true)}
          />
        </section>

        <aside className="space-y-6">
          <DependenciaPlanCard
            dependenciaId={dependenciaId}
            areasCount={areas.length}
            maxAreas={maxAreas}
            planName={planName}
          />
          {!canCreateArea && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 shadow-sm dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              Has alcanzado el límite de <strong>{maxAreas} {maxAreas === 1 ? "área" : "áreas"}</strong> para esta dependencia. Para registrar más Áreas Naturales
              Protegidas necesitarás actualizar tu plan.
            </div>
          )}

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/85">
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
    </>
  );
}
