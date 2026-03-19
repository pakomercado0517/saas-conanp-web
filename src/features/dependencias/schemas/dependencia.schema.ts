import { z } from "zod";

export const createDependenciaSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .transform((v) => v.trim()),
});

export type CreateDependenciaFormData = z.infer<typeof createDependenciaSchema>;

const requisitoCatalogoItemSchema = z.object({
  tipoActivo: z.enum(["embarcacion", "vehiculo", "guia", "equipo"], {
    message: "Selecciona tipo de activo",
  }),
  key: z.string().min(1, "La clave es requerida"),
  label: z.string().optional(),
  tipoDato: z.enum(["string", "date", "number"], {
    message: "Selecciona tipo de dato",
  }),
  requerido: z.boolean().optional(),
  requiereDocumento: z.boolean().optional(),
  orden: z.number().optional(),
  activo: z.boolean().optional(),
});

export const createAreaSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .transform((v) => v.trim()),
  ecosystem_type: z.enum(["terrestre", "maritimo", "mixto"], {
    message: "Selecciona un tipo de ecosistema",
  }),
  requisitoCatalogo: z.array(requisitoCatalogoItemSchema).optional(),
});

export type CreateAreaFormData = z.infer<typeof createAreaSchema>;
export type RequisitoCatalogoItemFormData = z.infer<
  typeof requisitoCatalogoItemSchema
>;

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
