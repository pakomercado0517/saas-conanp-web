"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPermiso } from "../services/permisos.api";
import type { CreatePermisoPayload } from "../types";
import { permisosByOrganizationKey } from "./permisosQueryKeys";

const QUERY_KEY_PREFIX = ["permisos"] as const;

export function useCreatePermiso(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePermisoPayload) => {
      return createPermiso(organizationId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY_PREFIX, organizationId],
      });
      void queryClient.invalidateQueries({
        queryKey: permisosByOrganizationKey(organizationId),
      });
    },
  });
}
