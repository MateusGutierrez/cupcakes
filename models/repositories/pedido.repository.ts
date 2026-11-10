import "server-only"

import { randomUUID } from "node:crypto"

import type { Prisma } from "@/generated/prisma/client"
import type { StatusPedido } from "@/generated/prisma/enums"
import { db } from "@/lib/db"
import { gerarNumeroPedido } from "@/models/domain/status"

type NovoPedido = Omit<
  Prisma.PedidoCreateInput,
  "numero" | "itens" | "historico"
> & {
  itens: Omit<Prisma.ItemPedidoCreateManyPedidoInput, "id" | "pedidoId">[]
}

/**
 * Cria o pedido com itens (snapshot de nome e preço) e o primeiro registro de
 * histórico. O número legível vem do id (RN#24), então é gravado logo em seguida.
 */
export async function criarPedido(
  dados: NovoPedido,
  responsavel: string,
  tx: Prisma.TransactionClient
) {
  const { itens, ...pedido } = dados
  const criado = await tx.pedido.create({
    data: {
      ...pedido,
      numero: `TMP-${randomUUID()}`,
      itens: { createMany: { data: itens } },
      historico: { create: { de: null, para: pedido.status, responsavel } },
    },
  })
  return tx.pedido.update({
    where: { id: criado.id },
    data: { numero: gerarNumeroPedido(criado.id) },
  })
}

export function buscarPedidoPorNumero(numero: string) {
  return db.pedido.findUnique({
    where: { numero },
    include: {
      itens: { orderBy: { id: "asc" } },
      historico: { orderBy: { createdAt: "asc" } },
    },
  })
}

export type PedidoCompleto = NonNullable<
  Awaited<ReturnType<typeof buscarPedidoPorNumero>>
>

/** Muda o status e registra no histórico quem fez (RN#27). */
export async function registrarMudancaDeStatus(
  pedido: { id: number; status: StatusPedido },
  para: StatusPedido,
  responsavel: string,
  extra: Prisma.PedidoUpdateInput,
  tx: Prisma.TransactionClient
) {
  await tx.historicoStatus.create({
    data: { pedidoId: pedido.id, de: pedido.status, para, responsavel },
  })
  return tx.pedido.update({
    where: { id: pedido.id },
    data: { ...extra, status: para },
  })
}
