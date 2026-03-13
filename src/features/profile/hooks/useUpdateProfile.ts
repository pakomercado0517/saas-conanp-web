"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateProfile } from "../services/profile.api";
import type { UpdateProfilePayload } from "../types";

const QUERY_KEY = ["profile"] as const;

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (data) => {
      if (user && data) {
        setUser({
          id: data.userId ?? user.id,
          email: data.email,
          name: data.name ?? user.name,
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    update: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
