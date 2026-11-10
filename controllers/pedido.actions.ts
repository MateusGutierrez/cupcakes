"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { concederAcessoAoPedido, temAcessoAoPedido } from "@/lib/acesso-pedido"
import { errosDoZod, type EstadoAcao } from "@/lib/estado-acao"
import {
  buscarPedidoDoCliente,
  buscarPedidoPorNumero,
} from "@/models/repositories/pedido.repository"
import { mudarStatusService } from "@/models/services/mudar-status"
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

/** US-14 — o cliente cancela o próprio pedido enquanto ainda não entrou em preparo (RN#28). */
export async function cancelarPedidoCliente(
  numero: string
): Promise<{ ok: boolean; mensagem: string }> {
  if (!(await temAcessoAoPedido(numero)))
    return { ok: false, mensagem: "Pedido não encontrado." }
  const pedido = await buscarPedidoPorNumero(numero)
  if (!pedido) return { ok: false, mensagem: "Pedido não encontrado." }

  // O servidor revalida: a tela pode estar desatualizada (ex.: a cozinha acabou de começar)
  const r = await mudarStatusService({
    pedidoId: pedido.id,
    de: pedido.status,
    para: "CANCELADO",
    usuario: { cliente: true },
  })
  revalidatePath(`/pedido/${numero}`)
  revalidatePath("/admin/pedidos")
  if (!r.ok)
    return {
      ok: false,
      mensagem:
        "Este pedido não pode mais ser cancelado: o preparo já começou.",
    }
  revalidatePath("/", "layout")
  return {
    ok: true,
    mensagem:
      pedido.statusPagamento === "APROVADO"
        ? "Pedido cancelado. O valor será estornado (simulação)."
        : "Pedido cancelado.",
  }
}
