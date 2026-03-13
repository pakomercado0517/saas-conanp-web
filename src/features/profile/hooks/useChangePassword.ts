"use client";

import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../services/profile.api";
import type { ChangePasswordPayload } from "../types";

export function useChangePassword() {
  const mutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  });

  return {
    change: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
