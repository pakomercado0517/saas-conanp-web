"use client";

import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/shared/types/api";
import { verifyEmailStart, verifyEmailConfirm } from "@/features/invitations";

interface VerifyEmailStepProps {
  invitationId: string;
  email: string;
  onSuccess: (invitationProof: string) => void;
}

export function VerifyEmailStep({
  invitationId,
  email,
  onSuccess,
}: VerifyEmailStepProps) {
  const [otp, setOtp] = useState("");
  const [startSent, setStartSent] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    verifyEmailStart({ invitationId, email })
      .then(() => {
        if (!cancelled) {
          setStartSent(true);
          setStartError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setStartError(getApiErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [invitationId, email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfirmError(null);
    if (!otp.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await verifyEmailConfirm({
        invitationId,
        email,
        otp: otp.trim(),
      });
      onSuccess(result.invitationProof);
    } catch (err) {
      setConfirmError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!startSent && startError) {
    return (
      <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-sm text-red-700">{startError}</p>
      </div>
    );
  }

  if (!startSent) {
    return (
      <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-600">Enviando código de verificación a tu correo…</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <p>
          Se envió un código de verificación a <strong>{email}</strong>. Ingresa el código a continuación.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {confirmError && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {confirmError}
          </div>
        )}
        <div>
          <label
            htmlFor="otp"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--navy-deep)"
          >
            Código de verificación
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={10}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-lg border border-slate-200 bg-white py-3 px-4 text-(--navy-deep) placeholder:text-slate-400 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !otp.trim()}
          className="flex w-full items-center justify-center rounded-lg bg-(--navy-deep) py-3 font-bold text-white shadow-md transition-colors hover:bg-(--navy-light) disabled:opacity-70"
        >
          {isSubmitting ? "Verificando…" : "Confirmar y continuar al registro"}
        </button>
      </form>
    </div>
  );
}
