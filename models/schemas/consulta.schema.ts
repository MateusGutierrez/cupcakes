import { z } from "zod"

import { normalizarNumeroPedido } from "@/models/domain/status"

export const consultaPedidoSchema = z.object({
  numero: z.string().transform((v, ctx) => {
    const numero = normalizarNumeroPedido(v)
    if (!numero) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o número do pedido (ex.: CG-000123)",
      })
      return z.NEVER
    }
    return numero
  }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Informe o e-mail usado no pedido" })),
})
