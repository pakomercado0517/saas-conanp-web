"use client";

import { useState } from "react";
import { Clock, Mail, XCircle, Loader2 } from "lucide-react";
import { getApiErrorMessage } from "@/shared/types/api";
import { useRevokeDependenciaInvitation } from "../hooks/useRevokeDependenciaInvitation";
import type { DependenciaInvitation } from "../types";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  prestador: "Prestador",
  observador: "Observador",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface DependenciaInvitationsListProps {
  dependenciaId: string;
  invitations: DependenciaInvitation[];
}

export function DependenciaInvitationsList({
  dependenciaId,
  invitations,
}: DependenciaInvitationsListProps) {
  const { revoke, isPending: isRevoking } =
    useRevokeDependenciaInvitation(dependenciaId);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  async function handleRevoke(invitationId: string) {
    setRevokeError(null);
    setRevokingId(invitationId);
    try {
      await revoke(invitationId);
    } catch (err) {
      setRevokeError(getApiErrorMessage(err));
    } finally {
      setRevokingId(null);
    }
  }

  if (invitations.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-(--slate-text)">
        No hay invitaciones pendientes.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {revokeError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {revokeError}
        </div>
      )}
      {invitations.map((inv) => (
        <div
          key={inv.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--cyan-accent)/10">
              <Mail className="size-4 text-(--cyan-accent)" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-(--navy-deep) dark:text-white">
                {inv.email}
              </p>
              <div className="flex items-center gap-2 text-xs text-(--slate-text)">
                <span>{ROLE_LABELS[inv.role] ?? inv.role}</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" aria-hidden />
                  Expira {formatDate(inv.expiresAt)}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleRevoke(inv.id)}
            disabled={isRevoking && revokingId === inv.id}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30"
            aria-label={`Revocar invitación de ${inv.email}`}
          >
            {isRevoking && revokingId === inv.id ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <XCircle className="size-4" aria-hidden />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
