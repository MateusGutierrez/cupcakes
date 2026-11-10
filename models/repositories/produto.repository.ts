import "server-only"

import { cache } from "react"

import type { Prisma, Produto } from "@/generated/prisma/client"
import { db } from "@/lib/db"
import { diaLocal, intervaloDoDia } from "@/lib/format"
import {
  calcularDisponivel,
  STATUS_QUE_LIBERAM_CAPACIDADE,
} from "@/models/domain/capacidade"
import { normalizar } from "@/models/domain/catalogo"

export type ProdutoComDisponibilidade = Produto & { disponivelHoje: number }

/** Unidades vendidas por produto em um dia da loja ("AAAA-MM-DD"), ignorando cancelados. */
export async function vendidosNoDia(
  produtoIds: number[],
  dia: string
): Promise<Map<number, number>> {
  if (produtoIds.length === 0) return new Map()
  const { inicio, fim } = intervaloDoDia(dia)
  const grupos = await db.itemPedido.groupBy({
    by: ["produtoId"],
    where: {
      produtoId: { in: produtoIds },
      pedido: {
        dataAgendada: { gte: inicio, lt: fim },
        status: { notIn: [...STATUS_QUE_LIBERAM_CAPACIDADE] },
      },
    },
    _sum: { quantidade: true },
  })
  return new Map(grupos.map((g) => [g.produtoId, g._sum.quantidade ?? 0]))
}

async function comDisponibilidade(
  produtos: Produto[],
  dia = diaLocal(new Date())
): Promise<ProdutoComDisponibilidade[]> {
  const vendidos = await vendidosNoDia(
    produtos.map((p) => p.id),
    dia
  )
  return produtos.map((p) => ({
    ...p,
    disponivelHoje: calcularDisponivel(p.limiteDiario, vendidos.get(p.id) ?? 0),
  }))
}

// ---- Loja (somente produtos ativos, RN#08) ----

export const listarProdutosAtivos = cache(async () => {
  const produtos = await db.produto.findMany({
    where: { ativo: true },
    orderBy: [{ destaque: "desc" }, { nome: "asc" }],
  })
  return comDisponibilidade(produtos)
})

export const buscarProdutoAtivoPorSlug = cache(async (slug: string) => {
  const produto = await db.produto.findFirst({ where: { slug, ativo: true } })
  if (!produto) return null
  const [comDisp] = await comDisponibilidade([produto])
  return comDisp
})

// ---- Administração ----

export async function listarTodosProdutos(busca?: string) {
  const produtos = await db.produto.findMany({
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
  })
  if (!busca) return produtos
  // SQLite não tem busca sem acento; o catálogo é pequeno, então filtramos em memória
  const termo = normalizar(busca)
  return produtos.filter((p) => normalizar(p.nome).includes(termo))
}

export function buscarProdutoPorId(id: number) {
  return db.produto.findUnique({ where: { id } })
}

export function slugEmUso(slug: string, ignorarId?: number) {
  return db.produto
    .count({
      where: { slug, ...(ignorarId ? { id: { not: ignorarId } } : {}) },
    })
    .then((n) => n > 0)
}

export function criarProduto(
  dados: Prisma.ProdutoCreateInput,
  tx: Prisma.TransactionClient = db
) {
  return tx.produto.create({ data: dados })
}

export function atualizarProduto(
  id: number,
  dados: Prisma.ProdutoUpdateInput,
  tx: Prisma.TransactionClient = db
) {
  return tx.produto.update({ where: { id }, data: dados })
}
