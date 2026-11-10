import "server-only"

import { randomUUID } from "node:crypto"

import type { Prisma, PrismaClient } from "@/generated/prisma/client"
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

/**
 * Pedido do convidado por número + e-mail (US-13 CA#3). Retorna null tanto se o
 * número não existe quanto se o e-mail não confere, para não revelar nada.
 */
export async function buscarPedidoDoCliente(
  numero: string,
  email: string,
  cliente: PrismaClient = db
) {
  const pedido = await cliente.pedido.findUnique({
    where: { numero },
    select: { numero: true, email: true },
  })
  return pedido && pedido.email === email.trim().toLowerCase()
    ? pedido.numero
    : null
}

/** Resumo para a lista "seus pedidos". */
export function listarResumoPedidos(numeros: string[]) {
  if (numeros.length === 0) return Promise.resolve([])
  return db.pedido.findMany({
    where: { numero: { in: numeros } },
    select: {
      numero: true,
      status: true,
      totalCentavos: true,
      dataAgendada: true,
      modalidade: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

/** Pedidos para o painel, por status, na ordem do horário agendado (RNF#32). */
export function listarPedidosPorStatus(status: StatusPedido) {
  return db.pedido.findMany({
    where: { status },
    include: {
      itens: { orderBy: { id: "asc" } },
      historico: { orderBy: { createdAt: "asc" } },
    },
    // Entregues/cancelados: mais recentes primeiro; demais: o próximo horário primeiro
    orderBy: {
      dataAgendada:
        status === "ENTREGUE" || status === "CANCELADO" ? "desc" : "asc",
    },
    take: 100,
  })
}

export async function contarPedidosPorStatus(): Promise<
  Partial<Record<StatusPedido, number>>
> {
  const grupos = await db.pedido.groupBy({
    by: ["status"],
    _count: { _all: true },
  })
  return Object.fromEntries(grupos.map((g) => [g.status, g._count._all]))
}

export function buscarPedidoPorId(id: number) {
  return db.pedido.findUnique({
    where: { id },
    include: { itens: { orderBy: { id: "asc" } } },
  })
}
