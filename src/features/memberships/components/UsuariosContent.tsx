"use client";

import { useState } from "react";
import Link from "next/link";
import { getApiErrorMessage } from "@/shared/types/api";
import { getDashboardHref } from "@/shared/config/dashboardNav";
import { useMemberships } from "@/features/memberships/hooks/useMemberships";
import { useInvitations } from "@/features/invitations/hooks/useInvitations";
import { useCreateInvitation } from "@/features/invitations/hooks/useCreateInvitation";
import {
  updateMembership,
  deleteMembership,
} from "@/features/memberships/services/memberships.api";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/shared/components/EmptyState";
import type { MembershipRole, MembershipStatus } from "@/features/memberships/types";
import type { CreateInvitationPayload } from "@/features/invitations/types";

const ROLES: { value: MembershipRole; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "gestor", label: "Gestor" },
  { value: "prestador", label: "Prestador" },
  { value: "observador", label: "Observador" },
];

const STATUS_OPTIONS: { value: MembershipStatus; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "suspendido", label: "Suspendido" },
];

export interface UsuariosContentProps {
  areaId: string;
  /**
   * Si es false, no se muestra el título «Usuarios» (p. ej. cuando el layout padre ya define encabezado).
   */
  showMainHeading?: boolean;
  /** Si se define, el enlace del pie usa esta ruta en lugar del inicio del dashboard del área. */
  footerBackHref?: string;
  footerBackLabel?: string;
}

export function UsuariosContent({
  areaId,
  showMainHeading = true,
  footerBackHref,
  footerBackLabel,
}: UsuariosContentProps) {
  const queryClient = useQueryClient();
  const {
    data: members,
    limits,
    isLoading: loadingMembers,
    error: membersError,
    refetch: refetchMembers,
  } = useMemberships(areaId);
  const {
    data: invitations,
    isLoading: loadingInvitations,
    refetch: refetchInvitations,
  } = useInvitations(areaId);
  const {
    create: createInvitation,
    isPending: creatingInvitation,
    error: createError,
  } = useCreateInvitation(areaId);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MembershipRole>("prestador");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!inviteEmail.trim()) return;
    try {
      const payload: CreateInvitationPayload = {
        email: inviteEmail.trim(),
        role: inviteRole,
      };
      await createInvitation(payload);
      setInviteEmail("");
      setShowInviteForm(false);
      setFeedback({
        type: "success",
        message: "Invitación enviada correctamente.",
      });
      refetchInvitations();
    } catch (err) {
      setFeedback({ type: "error", message: getApiErrorMessage(err) });
    }
  };

  const handleRoleChange = async (
    membershipId: string,
    role: MembershipRole
  ) => {
    setRoleUpdatingId(membershipId);
    setFeedback(null);
    try {
      await updateMembership(areaId, membershipId, { role });
      setFeedback({ type: "success", message: "Rol actualizado." });
      queryClient.invalidateQueries({ queryKey: ["memberships", areaId] });
      refetchMembers();
    } catch (err) {
      setFeedback({ type: "error", message: getApiErrorMessage(err) });
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const handleStatusChange = async (
    membershipId: string,
    status: MembershipStatus
  ) => {
    setStatusUpdatingId(membershipId);
    setFeedback(null);
    try {
      await updateMembership(areaId, membershipId, { status });
      setFeedback({ type: "success", message: "Estado actualizado." });
      queryClient.invalidateQueries({ queryKey: ["memberships", areaId] });
      refetchMembers();
    } catch (err) {
      setFeedback({ type: "error", message: getApiErrorMessage(err) });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async (membershipId: string, userName: string) => {
    if (
      !confirm(
        `¿Eliminar a ${userName} del área? Esta acción no se puede deshacer.`
      )
    )
      return;
    setDeletingId(membershipId);
    setFeedback(null);
    try {
      await deleteMembership(areaId, membershipId);
      setFeedback({ type: "success", message: "Usuario eliminado del área." });
      queryClient.invalidateQueries({ queryKey: ["memberships", areaId] });
      refetchMembers();
    } catch (err) {
      setFeedback({ type: "error", message: getApiErrorMessage(err) });
    } finally {
      setDeletingId(null);
    }
  };

  const inicioHref = getDashboardHref(areaId, "");
  const resolvedBackHref = footerBackHref ?? inicioHref;
  const resolvedBackLabel = footerBackLabel ?? "Volver al inicio del área";

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div
        className={`flex flex-col gap-4 sm:flex-row sm:items-center ${showMainHeading ? "sm:justify-between" : "sm:justify-end"}`}
      >
        {showMainHeading ? (
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Usuarios
          </h1>
        ) : null}
        <div className="flex items-center gap-2">
          {!showInviteForm ? (
            <button
              type="button"
              onClick={() => setShowInviteForm(true)}
              disabled={
                limits?.maxUsers != null &&
                members != null &&
                members.length >= limits.maxUsers
              }
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 dark:focus-visible:ring-slate-400"
            >
              Invitar usuario
            </button>
          ) : (
            <form
              onSubmit={handleInvite}
              className="flex flex-wrap items-center gap-2"
            >
              <label htmlFor="invite-email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                required
              />
              <label htmlFor="invite-role" className="sr-only">
                Rol
              </label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) =>
                  setInviteRole(e.target.value as MembershipRole)
                }
                className="rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={creatingInvitation}
                className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900 dark:focus-visible:ring-slate-400"
              >
                {creatingInvitation ? "Enviando…" : "Enviar invitación"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInviteForm(false);
                  setInviteEmail("");
                  setFeedback(null);
                }}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-900 focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:text-slate-100 dark:focus-visible:ring-slate-400"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-md border p-3 text-sm ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {createError && !feedback && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {getApiErrorMessage(createError)}
        </p>
      )}

      {limits?.maxUsers != null &&
        members &&
        members.length >= limits.maxUsers && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            Has alcanzado el límite de usuarios del plan ({limits.maxUsers}).
            Actualiza tu plan para añadir más usuarios.
          </div>
        )}

      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Miembros
        </h2>
        {loadingMembers ? (
          <p className="text-sm text-slate-500">Cargando miembros…</p>
        ) : membersError ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {getApiErrorMessage(membersError)}
          </p>
        ) : members?.length ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Usuario
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Rol
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-2 text-sm text-slate-900 dark:text-slate-100">
                      {m.User?.name ?? m.User?.email ?? m.userId}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={m.role}
                        onChange={(e) =>
                          handleRoleChange(m.id, e.target.value as MembershipRole)
                        }
                        disabled={roleUpdatingId === m.id}
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={m.status}
                        onChange={(e) =>
                          handleStatusChange(
                            m.id,
                            e.target.value as MembershipStatus
                          )
                        }
                        disabled={statusUpdatingId === m.id}
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              m.id,
                              m.User?.name ?? m.User?.email ?? "este usuario"
                            )
                          }
                          disabled={deletingId === m.id}
                          className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                        >
                          {deletingId === m.id ? "Eliminando…" : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            message="No hay miembros en esta área. Invita usuarios para colaborar."
            action={{
              label: "Invitar usuario",
              onClick: () => setShowInviteForm(true),
            }}
          />
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Invitaciones pendientes
        </h2>
        {loadingInvitations ? (
          <p className="text-sm text-slate-500">Cargando invitaciones…</p>
        ) : invitations?.length ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Correo
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Rol
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                    Vence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900/30">
                {invitations.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-2 text-sm text-slate-900 dark:text-slate-100">
                      {inv.email}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-900 dark:text-slate-100">
                      {inv.role}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-900 dark:text-slate-100">
                      {inv.status}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-900 dark:text-slate-100">
                      {inv.expiresAt
                        ? new Date(inv.expiresAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No hay invitaciones pendientes.</p>
        )}
      </section>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        <Link href={resolvedBackHref} className="underline hover:no-underline">
          {resolvedBackLabel}
        </Link>
      </p>
    </div>
  );
}
