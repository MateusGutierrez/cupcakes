"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { StatusPedido } from "@/generated/prisma/enums"
import { exigirSessao } from "@/lib/auth"
import {
  mudarStatusService,
  type ResultadoMudanca,
} from "@/models/services/mudar-status"

const entradaSchema = z.object({
  pedidoId: z.number().int().positive(),
  de: z.enum(StatusPedido),
  para: z.enum(StatusPedido),
})

/** US-17 — avança (ou cancela) um pedido. Revalida sessão e papel (RN#34). */
export async function mudarStatusPedido(
  pedidoId: number,
  de: StatusPedido,
  para: StatusPedido
): Promise<ResultadoMudanca> {
  const usuario = await exigirSessao(["ADMIN", "ATENDENTE"])
  const entrada = entradaSchema.safeParse({ pedidoId, de, para })
  if (!entrada.success) return { ok: false, mensagem: "Dados inválidos." }

  const r = await mudarStatusService({ ...entrada.data, usuario })
  revalidatePath("/admin/pedidos")
  if (r.ok) {
    revalidatePath(`/pedido/${r.numero}`)
    // Cancelamento libera capacidade na vitrine
    if (para === "CANCELADO") revalidatePath("/", "layout")
  }
  return r
}
