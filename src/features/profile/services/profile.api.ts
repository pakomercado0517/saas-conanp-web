import { apiRequest } from "@/shared/lib/api";
import type { ProfileData, UpdateProfilePayload, ChangePasswordPayload } from "../types";

const AUTH_BASE = "/api/v1/auth";
const USERS_BASE = "/api/v1/users";

export async function updateProfile(
  payload: UpdateProfilePayload,
  accessToken: string
): Promise<ProfileData> {
  const res = await apiRequest<{ success: true; data: ProfileData }>(
    `${USERS_BASE}/profile`,
    {
      method: "PATCH",
      body: payload,
      accessToken,
    }
  );
  return (res as { success: true; data: ProfileData }).data;
}

export async function changePassword(
  payload: ChangePasswordPayload,
  accessToken: string
): Promise<{ success: true; message?: string }> {
  await apiRequest<{ success: true; message?: string }>(
    `${AUTH_BASE}/change-password`,
    {
      method: "POST",
      body: payload,
      accessToken,
    }
  );
  return { success: true as const };
}

export async function deleteAccount(accessToken: string): Promise<void> {
  await apiRequest<{ success: true; message?: string }>(
    `${USERS_BASE}/profile`,
    {
      method: "DELETE",
      accessToken,
    }
  );
}
