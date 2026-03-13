"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import * as authApi from "../services/auth.api";
import { useAuthStore } from "../store/auth.store";

export function useAuth() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  const isAuthenticated = Boolean(accessToken && user);

  const login = useCallback(
    async (email: string, password: string, returnTo?: string | null) => {
      const data = await authApi.login({ email, password });
      setSession({
        user: data.user,
        accessToken: data.accessToken,
        expiresIn: data.expiresIn,
      });
      const target =
        returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
          ? returnTo
          : "/redirect";
      router.push(target);
    },
    [setSession, router],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignorar error de red; limpiar sesión igual
    }
    clearSession();
    router.push("/auth/login");
  }, [clearSession, router]);

  return {
    user,
    accessToken,
    isAuthenticated,
    login,
    logout,
    setSession,
    clearSession,
  };
}
