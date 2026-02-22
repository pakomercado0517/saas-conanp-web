import { z } from "zod";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Paso 1: validar invitación (invitationId + token del correo o enlace) */
export const invitationCodeSchema = z.object({
  invitationId: z
    .string()
    .min(1, "El ID de invitación es requerido")
    .regex(uuidRegex, "El ID de invitación no tiene un formato válido"),
  token: z.string().min(1, "El código de invitación es requerido"),
});

export type InvitationCodeFormData = z.infer<typeof invitationCodeSchema>;

/** POST /register: invitación por token (enlace) o invitationProof (código manual); email debe coincidir. */
export const registerSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido").max(255).trim(),
    email: z.string().email("El email debe tener un formato válido").max(255).toLowerCase().trim(),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(255),
    confirmPassword: z.string(),
    invitationId: z.string().min(1),
    token: z.string().optional(),
    invitationProof: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => (data.token ? !data.invitationProof : Boolean(data.invitationProof)),
    { message: "Se requiere el token de invitación o el comprobante de verificación", path: ["token"] }
  );

export type RegisterFormData = z.infer<typeof registerSchema>;

/** POST /login: email, password no vacío */
export const loginSchema = z.object({
  email: z.string().email("El email debe tener un formato válido").toLowerCase().trim(),
  password: z.string().min(1, "La contraseña no puede estar vacía"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/** POST /forgot-password, POST /resend-verification: email */
export const forgotPasswordSchema = z.object({
  email: z.string().email("El email debe tener un formato válido").toLowerCase().trim(),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resendVerificationSchema = forgotPasswordSchema;
export type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>;

/** POST /reset-password: token min 10, newPassword 8-255 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(10, "Token inválido"),
    newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(255),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
