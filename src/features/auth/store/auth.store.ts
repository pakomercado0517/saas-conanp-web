"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "../services/auth.api";
import type { AuthSession, AuthUser } from "../types";

const STORAGE_KEY = "conanp-auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  setSession: (data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }) => void;
  setAccessToken: (accessToken: string, expiresIn: number) => void;
  clearSession: () => void;
  /** Intenta renovar el access token con el refresh token. Devuelve el nuevo access token o null. No redirige. */
  refreshAccessToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,

      setSession: (data) => {
        const expiresAt = Date.now() + data.expiresIn * 1000;
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt,
        });
      },

      setAccessToken: (accessToken, expiresIn) => {
        const expiresAt = Date.now() + expiresIn * 1000;
        set({ accessToken, expiresAt });
      },

      clearSession: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
        }),

      refreshAccessToken: async () => {
        const { refreshToken: rt, setAccessToken, clearSession } = useAuthStore.getState();
        if (!rt) return null;
        try {
          const data = await authApi.refresh({ refreshToken: rt });
          setAccessToken(data.accessToken, data.expiresIn);
          return data.accessToken;
        } catch {
          clearSession();
          return null;
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
      }),
    }
  )
);

export function getSessionForRedirect(): AuthSession | null {
  const state = useAuthStore.getState();
  if (!state.user || !state.accessToken || !state.refreshToken || !state.expiresAt) {
    return null;
  }
  const expiresIn = state.expiresAt - Math.floor(Date.now() / 1000);
  if (expiresIn <= 0) return null;
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    expiresIn,
    expiresAt: state.expiresAt,
  };
}
