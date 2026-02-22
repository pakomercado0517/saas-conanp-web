"use client";

import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/shared/types/api";
import { validateInvitation } from "@/features/invitations";
import type { ValidateInvitationResponseData } from "@/features/invitations";
import type { InvitationCodeFormData } from "../schemas/auth.schema";
import { InvitationCodeForm } from "./InvitationCodeForm";
import { RegisterForm } from "./RegisterForm";
import { VerifyEmailStep } from "./VerifyEmailStep";

const ROLE_LABELS: Record<string, string> = {
  admin: "administrador",
  gestor: "gestor",
  prestador: "prestador",
  observador: "observador",
};

interface RegisterFlowProps {
  invitationIdFromUrl: string | null;
  tokenFromUrl: string | null;
}

type Step = "idle" | "validating" | "valid" | "invalid";

export function RegisterFlow({
  invitationIdFromUrl,
  tokenFromUrl,
}: RegisterFlowProps) {
  const hasParams = Boolean(
    invitationIdFromUrl?.trim() && tokenFromUrl?.trim()
  );
  const [step, setStep] = useState<Step>(() =>
    hasParams ? "validating" : "idle"
  );
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [validated, setValidated] = useState<{
    data: ValidateInvitationResponseData;
    invitationId: string;
    token: string;
  } | null>(null);
  /** Tras verificar email por OTP (flujo código manual). */
  const [invitationProof, setInvitationProof] = useState<string | null>(null);

  useEffect(() => {
    if (!hasParams || step !== "validating") return;
    const invitationId = invitationIdFromUrl!.trim();
    const token = tokenFromUrl!.trim();
    let cancelled = false;
    validateInvitation({ invitationId, token })
      .then((data) => {
        if (!cancelled) {
          setValidated({ data, invitationId, token });
          setStep("valid");
          setInvitationError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setInvitationError(getApiErrorMessage(err));
          setStep("invalid");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [hasParams, invitationIdFromUrl, tokenFromUrl, step]);

  const [codeSubmitting, setCodeSubmitting] = useState(false);

  async function handleValidateCode(data: InvitationCodeFormData) {
    setInvitationError(null);
    setCodeSubmitting(true);
    try {
      const result = await validateInvitation({
        invitationId: data.invitationId.trim(),
        token: data.token.trim(),
      });
      setValidated({
        data: result,
        invitationId: data.invitationId.trim(),
        token: data.token.trim(),
      });
      setStep("valid");
    } catch (err) {
      setInvitationError(getApiErrorMessage(err));
    } finally {
      setCodeSubmitting(false);
    }
  }

  if (step === "validating") {
    return (
      <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-600">Verificando tu invitación…</p>
      </div>
    );
  }

  if (step === "valid" && validated) {
    const orgBlock = (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <p>
          Te unirás a <strong>{validated.data.organizationName}</strong> como{" "}
          <strong>{ROLE_LABELS[validated.data.role] ?? validated.data.role}</strong>.
          {invitationProof ? " Completa tu registro." : ""}
        </p>
      </div>
    );

    // Flujo por código manual: primero verificar email con OTP, luego registro con invitationProof
    if (!hasParams && !invitationProof) {
      return (
        <div className="space-y-4">
          {orgBlock}
          <VerifyEmailStep
            invitationId={validated.invitationId}
            email={validated.data.email}
            onSuccess={setInvitationProof}
          />
        </div>
      );
    }

    // Flujo por enlace (token) o ya con proof (código manual): formulario de registro
    return (
      <div className="space-y-4">
        {orgBlock}
        <RegisterForm
          invitationId={validated.invitationId}
          defaultEmail={validated.data.email}
          token={hasParams ? validated.token : undefined}
          invitationProof={invitationProof ?? undefined}
        />
      </div>
    );
  }

  return (
    <InvitationCodeForm
      onSubmit={handleValidateCode}
      serverError={invitationError}
      isSubmitting={codeSubmitting}
    />
  );
}
