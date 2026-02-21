import { z } from "zod";

/** POST /register: email, password 8-255, name 1-255 */
export const registerSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido").max(255).trim(),
    email: z.string().email("El email debe tener un formato válido").max(255).toLowerCase().trim(),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(255),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

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
