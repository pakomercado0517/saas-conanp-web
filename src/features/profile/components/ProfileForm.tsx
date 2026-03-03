"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getApiErrorMessage } from "@/shared/types/api";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { updateProfileSchema, type UpdateProfileFormData } from "../schemas/profile.schema";
import type { AuthUser } from "@/features/auth/types";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:border-(--cyan-accent)/50 focus:outline-none focus:ring-1 focus:ring-(--cyan-accent)/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300";

interface ProfileFormProps {
  user: AuthUser;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { update, isPending, error } = useUpdateProfile();

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name ?? "",
      email: user.email ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await update({ name: data.name, email: data.email });
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

      <div>
        <label htmlFor="profile-name" className={labelClass}>
          Nombre
        </label>
        <input
          id="profile-name"
          type="text"
          className={inputClass}
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="profile-email" className={labelClass}>
          Correo electrónico
        </label>
        <input
          id="profile-email"
          type="email"
          className={inputClass}
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-(--cyan-accent) px-5 py-2.5 text-sm font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover) disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-(--cyan-accent)/50 focus:ring-offset-2"
      >
        {isPending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
