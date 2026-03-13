"use client";

import { create } from "zustand";
import { registerAuthProvider } from "@/shared/lib/api";
import type { AuthUser } from "../types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  expiresAt: number | null;
  setUser: (user: AuthUser) => void;
  setSession: (data: {
    user: AuthUser;
    accessToken: string;
    expiresIn: number;
  }) => void;
  setAccessToken: (accessToken: string, expiresIn: number) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  expiresAt: null,

  setUser: (user) => set({ user }),

  setSession: (data) => {
    const expiresAt = Date.now() + data.expiresIn * 1000;
    set({
      user: data.user,
      accessToken: data.accessToken,
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
      expiresAt: null,
    }),
}));

registerAuthProvider({
  getAccessToken: () => useAuthStore.getState().accessToken,
  setAccessToken: (token, expiresIn) =>
    useAuthStore.getState().setAccessToken(token, expiresIn),
  clearSession: () => useAuthStore.getState().clearSession(),
});

if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("conanp-auth");
  } catch {
    /* SSR o storage bloqueado */
  }
}
