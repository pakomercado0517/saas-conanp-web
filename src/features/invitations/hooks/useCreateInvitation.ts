"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createInvitation } from "../services/invitations.api";
import type { CreateInvitationPayload, InvitationItem } from "../types";

const QUERY_KEY_PREFIX = ["invitations"] as const;

export function useCreateInvitation(organizationId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [...QUERY_KEY_PREFIX, "create", organizationId],
    mutationFn: (payload: CreateInvitationPayload) =>
      createInvitation(organizationId, payload, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId],
      });
    },
  });

  return {
    create: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  } as {
    create: (payload: CreateInvitationPayload) => Promise<InvitationItem>;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
  };
}
