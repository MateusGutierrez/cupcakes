"use server"

import { redirect } from "next/navigation"

import { concederAcessoAoPedido } from "@/lib/acesso-pedido"
import { errosDoZod, type EstadoAcao } from "@/lib/estado-acao"
import { buscarPedidoDoCliente } from "@/models/repositories/pedido.repository"
import { consultaPedidoSchema } from "@/models/schemas/consulta.schema"

/** US-13 CA#3 — convidado consulta o pedido com número + e-mail, sem login. */
export async function consultarPedido(
  _anterior: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const dados = consultaPedidoSchema.safeParse(Object.fromEntries(formData))
  if (!dados.success) return errosDoZod(dados.error)

  const numero = await buscarPedidoDoCliente(
    dados.data.numero,
    dados.data.email
  )
  // Mesma mensagem para "não existe" e "e-mail errado": não revela se o número existe
  if (!numero)
    return {
      ok: false,
      mensagem: "Não encontramos um pedido com esse número e e-mail.",
    }

  await concederAcessoAoPedido(numero)
  redirect(`/pedido/${numero}`)
}
