import "server-only"

import type { PrismaClient } from "@/generated/prisma/client"
import type { StatusPedido } from "@/generated/prisma/enums"
import { db as dbPadrao } from "@/lib/db"
import { podeTransicionar, ROTULO_STATUS } from "@/models/domain/status"
import { registrarMudancaDeStatus } from "@/models/repositories/pedido.repository"
import { registrarAuditoria } from "@/models/repositories/usuario.repository"

export type PedidoMudarStatus = {
  pedidoId: number
  /** Status que a pessoa estava vendo na tela (evita avançar duas vezes). */
  de: StatusPedido
  para: StatusPedido
  /** Usuário da equipe, ou { cliente: true } quando o próprio cliente cancela (US-14). */
  usuario: { id: number; nome: string } | { cliente: true }
}

export type ResultadoMudanca =
  | { ok: true; numero: string; mensagem: string }
  | { ok: false; mensagem: string }

/**
 * US-17 — muda o status de um pedido validando a máquina de estados (RN#26),
 * grava o histórico com o responsável (RN#27) e o log de auditoria (RNF#31).
 * Cancelar pedido pago com cartão/PIX marca o pagamento como estornado (RN#29).
 */
export async function mudarStatusService(
  { pedidoId, de, para, usuario }: PedidoMudarStatus,
  db: PrismaClient = dbPadrao
): Promise<ResultadoMudanca> {
  return db.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({ where: { id: pedidoId } })
    if (!pedido) return { ok: false, mensagem: "Pedido não encontrado." }

    if (pedido.status !== de) {
      return {
        ok: false,
        mensagem: `O pedido ${pedido.numero} já está em "${ROTULO_STATUS[pedido.status]}". A lista foi atualizada.`,
      }
    }
    // US-17 CA#2/CA#4: só a próxima etapa (ou cancelar, quando permitido)
    if (!podeTransicionar(pedido.status, para, pedido.modalidade)) {
      return {
        ok: false,
        mensagem: `Não é possível ir de "${ROTULO_STATUS[pedido.status]}" para "${ROTULO_STATUS[para]}".`,
      }
    }

    const extra: { statusPagamento?: "APROVADO" | "ESTORNADO" } = {}
    // Confirmar manualmente um PIX que ficou aguardando
    if (pedido.status === "AGUARDANDO_PAGAMENTO" && para === "RECEBIDO")
      extra.statusPagamento = "APROVADO"
    // RN#29: estorno simulado do que já foi pago
    if (para === "CANCELADO" && pedido.statusPagamento === "APROVADO")
      extra.statusPagamento = "ESTORNADO"

    const equipe = "id" in usuario
    // O cliente só pode cancelar; avançar etapas é exclusivo da equipe
    if (!equipe && para !== "CANCELADO")
      return { ok: false, mensagem: "Ação não permitida." }

    await registrarMudancaDeStatus(
      pedido,
      para,
      equipe ? usuario.nome : "Cliente",
      extra,
      tx
    )
    // RNF#31: auditoria das ações da equipe
    if (equipe) {
      await registrarAuditoria(
        {
          usuarioId: usuario.id,
          acao: para === "CANCELADO" ? "CANCELAR_PEDIDO" : `STATUS_${para}`,
          entidade: "Pedido",
          entidadeId: pedido.id,
        },
        tx
      )
    }
    return {
      ok: true,
      numero: pedido.numero,
      mensagem: `${pedido.numero}: ${ROTULO_STATUS[para]}`,
    }
  })
}
