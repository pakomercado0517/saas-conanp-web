"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useDependencia } from "../hooks/useDependencia";
import { useDependenciaAreas } from "../hooks/useDependenciaAreas";
import { useDependenciaInvitations } from "../hooks/useDependenciaInvitations";
import type {
  Dependencia,
  DependenciaArea,
  DependenciaInvitation,
} from "../types";

export interface DependenciaContextValue {
  dependenciaId: string;
  dependencia: Dependencia | null;
  areas: DependenciaArea[];
  invitations: DependenciaInvitation[];
  isLoading: boolean;
  error: unknown;
  canCreateArea: boolean;
  refetch: () => void;
}

const DependenciaCtx = createContext<DependenciaContextValue | null>(null);

export function useDependenciaContext(): DependenciaContextValue {
  const ctx = useContext(DependenciaCtx);
  if (!ctx) {
    throw new Error(
      "useDependenciaContext debe usarse dentro de DependenciaContextProvider"
    );
  }
  return ctx;
}

interface DependenciaContextProviderProps {
  dependenciaId: string;
  children: ReactNode;
}

export function DependenciaContextProvider({
  dependenciaId,
  children,
}: DependenciaContextProviderProps) {
  const dep = useDependencia(dependenciaId);
  const areasQuery = useDependenciaAreas(dependenciaId);
  const invQuery = useDependenciaInvitations(dependenciaId, {
    status: "pending",
  });

  const isLoading = dep.isLoading || areasQuery.isLoading;
  const areas = useMemo(() => areasQuery.data ?? [], [areasQuery.data]);
  const invitations = useMemo(() => invQuery.data ?? [], [invQuery.data]);

  const canCreateArea = areas.length < 1;

  const refetch = useCallback(() => {
    dep.refetch();
    areasQuery.refetch();
    invQuery.refetch();
  }, [dep, areasQuery, invQuery]);

  const value: DependenciaContextValue = useMemo(
    () => ({
      dependenciaId,
      dependencia: dep.data ?? null,
      areas,
      invitations,
      isLoading,
      error: dep.error ?? areasQuery.error,
      canCreateArea,
      refetch,
    }),
    [
      dependenciaId,
      dep.data,
      dep.error,
      areas,
      invitations,
      isLoading,
      areasQuery.error,
      canCreateArea,
      refetch,
    ]
  );

  return (
    <DependenciaCtx.Provider value={value}>
      {children}
    </DependenciaCtx.Provider>
  );
}
