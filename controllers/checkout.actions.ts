"use server"

import { revalidatePath } from "next/cache"

import { concederAcessoAoPedido } from "@/lib/acesso-pedido"
import {
  finalizarPedidoService,
  itensPedidoSchema,
  type ResultadoFinalizacao,
} from "@/models/services/finalizar-pedido"
import { pedidoSchema } from "@/models/schemas/checkout.schema"

/** F8 — finaliza o pedido do convidado. Valida no servidor; nunca confia no cliente. */
export async function finalizarPedido(
  dados: unknown,
  itens: unknown
): Promise<ResultadoFinalizacao> {
  const pedido = pedidoSchema.safeParse(dados)
  if (!pedido.success) {
    const campo = pedido.error.issues[0]?.path[0]
    return {
      ok: false,
      mensagem: pedido.error.issues[0]?.message ?? "Revise os dados do pedido.",
      campo: typeof campo === "string" ? campo : undefined,
    }
  }
  const carrinho = itensPedidoSchema.safeParse(itens)
  if (!carrinho.success) {
    return {
      ok: false,
      mensagem: "Seu carrinho está vazio ou inválido.",
      carrinhoDesatualizado: true,
    }
  }

  const resultado = await finalizarPedidoService(pedido.data, carrinho.data)
  if (resultado.ok) {
    await concederAcessoAoPedido(resultado.numero)
    // A capacidade do dia mudou: vitrine e detalhes precisam recalcular
    revalidatePath("/", "layout")
  }
  return resultado
}
