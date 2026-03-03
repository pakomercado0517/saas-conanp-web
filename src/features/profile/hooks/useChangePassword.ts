"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { changePassword } from "../services/profile.api";
import type { ChangePasswordPayload } from "../types";

export function useChangePassword() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const mutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      changePassword(payload, accessToken!),
  });

  return {
    change: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
