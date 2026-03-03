"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getApiErrorMessage } from "@/shared/types/api";
import { useChangePassword } from "../hooks/useChangePassword";
import { changePasswordSchema, type ChangePasswordFormData } from "../schemas/profile.schema";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300";

export function ChangePasswordForm() {
  const [success, setSuccess] = useState(false);
  const { change, isPending, error } = useChangePassword();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setSuccess(false);
    try {
      await change({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      form.reset();
      setSuccess(true);
    } catch {
      // Error manejado por mutation
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
          role="alert"
        >
          {getApiErrorMessage(error)}
        </div>
      )}

      {success && (
        <div
          className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300"
          role="status"
        >
          Contraseña actualizada correctamente.
        </div>
      )}

      <div>
        <label htmlFor="current-password" className={labelClass}>
          Contraseña actual
        </label>
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          className={inputClass}
          {...form.register("currentPassword")}
        />
        {form.formState.errors.currentPassword && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.currentPassword.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="new-password" className={labelClass}>
          Nueva contraseña
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          {...form.register("newPassword")}
        />
        {form.formState.errors.newPassword && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirm-password" className={labelClass}>
          Confirmar nueva contraseña
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          {...form.register("confirmPassword")}
        />
        {form.formState.errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover) disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-(--cyan-accent)/50 focus:ring-offset-2"
      >
        {isPending ? "Cambiando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
