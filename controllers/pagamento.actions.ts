"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/db"
import { temAcessoAoPedido } from "@/lib/acesso-pedido"
import { registrarMudancaDeStatus } from "@/models/repositories/pedido.repository"

/**
 * Simula a confirmação do PIX pelo banco: AGUARDANDO_PAGAMENTO → RECEBIDO.
 * Só quem tem acesso ao pedido pode acionar.
 */
export async function confirmarPix(
  numero: string
): Promise<{ ok: boolean; mensagem: string }> {
  if (!(await temAcessoAoPedido(numero)))
    return { ok: false, mensagem: "Pedido não encontrado." }

  const resultado = await db.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({ where: { numero } })
    if (!pedido || pedido.formaPagamento !== "PIX")
      return { ok: false, mensagem: "Pedido não encontrado." }
    if (pedido.status !== "AGUARDANDO_PAGAMENTO") {
      return { ok: false, mensagem: "Este pagamento já foi processado." }
    }
    await registrarMudancaDeStatus(
      pedido,
      "RECEBIDO",
      "Banco (PIX simulado)",
      { statusPagamento: "APROVADO" },
      tx
    )
    return {
      ok: true,
      mensagem: "Pagamento PIX confirmado! Seu pedido foi para a cozinha.",
    }
  })

  revalidatePath(`/pedido/${numero}`)
  return resultado
}
