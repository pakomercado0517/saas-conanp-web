import { z } from "zod";

export const createDependenciaSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .transform((v) => v.trim()),
});

export type CreateDependenciaFormData = z.infer<typeof createDependenciaSchema>;

export const createAreaSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .transform((v) => v.trim()),
  ecosystem_type: z.enum(["terrestre", "maritimo", "mixto"], {
    message: "Selecciona un tipo de ecosistema",
  }),
});

export type CreateAreaFormData = z.infer<typeof createAreaSchema>;

export const createDependenciaInvitationSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es requerido")
    .email("Ingresa un correo electrónico válido")
    .transform((v) => v.trim().toLowerCase()),
  role: z.enum(["admin", "gestor", "prestador", "observador"], {
    message: "Selecciona un rol",
  }),
});

export type CreateDependenciaInvitationFormData = z.infer<
  typeof createDependenciaInvitationSchema
>;
