"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePermiso } from "../services/permisos.api";
import type { UpdatePermisoPayload } from "../types";
import { permisosByOrganizationKey } from "./permisosQueryKeys";

const QUERY_KEY_PREFIX = ["permisos"] as const;

export function useUpdatePermiso(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      permisoId,
      payload,
    }: { permisoId: string; payload: UpdatePermisoPayload }) => {
      return updatePermiso(organizationId, permisoId, payload);
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
