"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApiErrorMessage } from "@/shared/types/api";
import * as authApi from "../services/auth.api";

interface VerifyEmailResultProps {
  token: string | null;
}

type Status = "idle" | "loading" | "success" | "error";

const INVALID_TOKEN_MESSAGE =
  "Token de verificación inválido o expirado. Solicita uno nuevo.";

function getInitialState(token: string | null): { status: Status; message: string } {
  if (!token || token.length < 10) {
    return { status: "error", message: INVALID_TOKEN_MESSAGE };
  }
  return { status: "loading", message: "" };
}

export function VerifyEmailResult({ token }: VerifyEmailResultProps) {
  const [state, setState] = useState(() => getInitialState(token));

  useEffect(() => {
    if (!token || token.length < 10) return;
    let cancelled = false;
    authApi
      .verifyEmail(token)
      .then(() => {
        if (!cancelled) {
          setState({ status: "success", message: "Correo electrónico verificado exitosamente" });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ status: "error", message: getApiErrorMessage(err) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const { status, message } = state;

  if (status === "loading" || status === "idle") {
    return (
      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-600">Verificando tu correo…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mt-6 space-y-5">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-sm text-green-800">{message}</p>
          <p className="mt-2 text-xs text-green-700">Ya puedes iniciar sesión con tu cuenta.</p>
        </div>
        <Link
          href="/auth/login"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--navy-deep) py-3 font-bold text-white shadow-md transition-colors hover:bg-(--navy-light)"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-sm text-red-700" role="alert">
          {message}
        </p>
        <p className="mt-2 text-xs text-red-600">
          Puedes solicitar un nuevo enlace desde el registro o la pantalla de inicio de sesión.
        </p>
      </div>
      <Link
        href="/auth/login"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--navy-deep) py-3 font-bold text-white shadow-md transition-colors hover:bg-(--navy-light)"
      >
        Ir a Iniciar sesión
      </Link>
    </div>
  );
}
