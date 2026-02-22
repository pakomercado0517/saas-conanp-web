"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import {
  invitationCodeSchema,
  type InvitationCodeFormData,
} from "../schemas/auth.schema";

const defaultValues: InvitationCodeFormData = {
  invitationId: "",
  token: "",
};

interface InvitationCodeFormProps {
  onSubmit: (data: InvitationCodeFormData) => Promise<void>;
  serverError: string | null;
  isSubmitting: boolean;
}

export function InvitationCodeForm({
  onSubmit,
  serverError,
  isSubmitting,
}: InvitationCodeFormProps) {
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<InvitationCodeFormData>({
    resolver: zodResolver(invitationCodeSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
      <p className="text-sm text-slate-600">
        Ingresa el ID de invitación y el código que recibiste por correo, o usa
        el enlace de la invitación.
      </p>
      {serverError && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {serverError}
        </div>
      )}
      <div>
        <label
          htmlFor="invitationId"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep)"
        >
          ID de invitación
        </label>
        <div className="relative">
          <KeyRound
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id="invitationId"
            type="text"
            autoComplete="off"
            placeholder="ej. 550e8400-e29b-41d4-a716-446655440000"
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 font-mono text-sm text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50"
            {...registerField("invitationId")}
          />
        </div>
        {errors.invitationId && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.invitationId.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="token"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep)"
        >
          Código de invitación
        </label>
        <div className="relative">
          <KeyRound
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id="token"
            type="text"
            autoComplete="off"
            placeholder="Código que recibiste por correo"
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50"
            {...registerField("token")}
          />
        </div>
        {errors.token && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.token.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--navy-deep) py-3 font-bold text-white shadow-md transition-colors hover:bg-(--navy-light) disabled:opacity-70"
      >
        {isSubmitting ? "Validando…" : "Continuar al registro"}
      </button>
    </form>
  );
}
