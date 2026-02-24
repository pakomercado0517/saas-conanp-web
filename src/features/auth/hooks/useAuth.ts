"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import * as authApi from "../services/auth.api";
import { useAuthStore } from "../store/auth.store";

export function useAuth() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  const isAuthenticated = Boolean(accessToken && user);

  const login = useCallback(
    async (email: string, password: string, returnTo?: string | null) => {
      const data = await authApi.login({ email, password });
      setSession({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      });
      const target =
        returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
          ? returnTo
          : "/select-organization";
      router.push(target);
    },
    [setSession, router]
  );

  const logout = useCallback(async () => {
    const token = useAuthStore.getState().refreshToken;
    if (token) {
      try {
        await authApi.logout({ refreshToken: token });
      } catch {
        // Ignorar error (token ya revocado o red); limpiar sesión igual
      }
    }
    clearSession();
    router.push("/auth/login");
  }, [clearSession, router]);

  const refreshIfNeeded = useCallback(async (): Promise<string | null> => {
    const token = useAuthStore.getState().refreshToken;
    if (!token) return null;
    try {
      const data = await authApi.refresh({ refreshToken: token });
      useAuthStore.getState().setAccessToken(data.accessToken, data.expiresIn);
      return data.accessToken;
    } catch {
      clearSession();
      router.push("/auth/login");
      return null;
    }
  }, [clearSession, router]);

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    logout,
    refreshIfNeeded,
    setSession,
    clearSession,
  };
}
