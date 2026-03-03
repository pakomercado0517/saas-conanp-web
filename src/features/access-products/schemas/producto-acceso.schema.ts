import { z } from "zod";

export const createProductoAccesoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  tipo: z.enum(["brazalete", "pasaporte"]),
  vigenciaDias: z.number().min(1, "La vigencia debe ser al menos 1 día"),
  precioReferencia: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v): number | null => {
      if (v === undefined || v === "" || v === null) return null;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isNaN(n) || n < 0 ? null : n;
    }),
  active: z.boolean().default(true),
});

export const updateProductoAccesoSchema = createProductoAccesoSchema.partial();

export const registrarMovimientoSchema = z.object({
  cantidad: z.number().min(1, "La cantidad debe ser al menos 1"),
  prestadorId: z.string().uuid().optional().nullable(),
  eventoId: z.string().uuid().optional().nullable(),
  observaciones: z.string().max(500).optional().nullable(),
});

export type CreateProductoAccesoFormData = z.infer<typeof createProductoAccesoSchema>;
export type UpdateProductoAccesoFormData = z.infer<typeof updateProductoAccesoSchema>;
export type RegistrarMovimientoFormData = z.infer<typeof registrarMovimientoSchema>;
