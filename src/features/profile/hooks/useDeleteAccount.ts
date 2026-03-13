"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { deleteAccount } from "../services/profile.api";

export function useDeleteAccount() {
  const clearSession = useAuthStore((s) => s.clearSession);

  const mutation = useMutation({
    mutationFn: () => deleteAccount(),
    onSuccess: () => {
      clearSession();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    },
  });

  return {
    remove: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
