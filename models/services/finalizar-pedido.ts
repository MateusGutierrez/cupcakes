import "server-only"

import { z } from "zod"

import type { PrismaClient } from "@/generated/prisma/client"
import { db as dbPadrao } from "@/lib/db"
import { formatData } from "@/lib/format"
import { dataPermitida } from "@/models/domain/agenda"
import { calcularDisponivel } from "@/models/domain/capacidade"
import { calcularTotais, maiorAntecedencia } from "@/models/domain/carrinho"
import { buscarArea } from "@/models/domain/entrega"
import {
  type DadosPagamento,
  processarPagamento,
} from "@/models/domain/pagamento"
import { criarPedido } from "@/models/repositories/pedido.repository"
import { vendidosNoDia } from "@/models/repositories/produto.repository"
import {
  enderecoCompleto,
  type PedidoDados,
} from "@/models/schemas/checkout.schema"

export const itensPedidoSchema = z
  .array(
    z.object({
      produtoId: z.number().int().positive(),
      quantidade: z.number().int().min(1).max(100),
    })
  )
  .min(1, { error: "Seu carrinho está vazio." })
  .max(30)

export type ItemPedidoEntrada = z.infer<typeof itensPedidoSchema>[number]

export type ResultadoFinalizacao =
  | { ok: true; numero: string }
  | {
      ok: false
      mensagem: string
      /** Campo do formulário a destacar ("data", "cep", "pagamento"…) */
      campo?: string
      /** O carrinho local precisa ser revisto (preço/capacidade/produto mudou). */
      carrinhoDesatualizado?: boolean
    }

function dadosPagamento(d: PedidoDados): DadosPagamento {
  if (d.formaPagamento === "CARTAO")
    return { formaPagamento: "CARTAO", cartaoNumero: d.cartaoNumero }
  if (d.formaPagamento === "DINHEIRO")
    return { formaPagamento: "DINHEIRO", trocoParaCentavos: d.trocoPara }
  return { formaPagamento: "PIX" }
}

/** Soma quantidades de itens repetidos. */
function agrupar(itens: ItemPedidoEntrada[]) {
  const mapa = new Map<number, number>()
  for (const i of itens)
    mapa.set(i.produtoId, (mapa.get(i.produtoId) ?? 0) + i.quantidade)
  return [...mapa].map(([produtoId, quantidade]) => ({ produtoId, quantidade }))
}

/**
 * US-12 — cria o pedido revalidando TUDO no servidor, dentro de uma transação:
 * produtos ativos e preços atuais, data/antecedência (RN#19), capacidade do dia (RN#14),
 * área de entrega (RN#04) e pagamento (RN#21). Nunca usa preço vindo do cliente.
 */
export async function finalizarPedidoService(
  dados: PedidoDados,
  itensEntrada: ItemPedidoEntrada[],
  agora = new Date(),
  db: PrismaClient = dbPadrao
): Promise<ResultadoFinalizacao> {
  const itens = agrupar(itensEntrada)
  const ids = itens.map((i) => i.produtoId)

  return db.$transaction(async (tx) => {
    const produtos = await tx.produto.findMany({
      where: { id: { in: ids }, ativo: true },
    })
    const porId = new Map(produtos.map((p) => [p.id, p]))
    if (produtos.length !== ids.length) {
      return {
        ok: false,
        mensagem:
          "Algum produto do carrinho saiu do cardápio. Revise o carrinho.",
        carrinhoDesatualizado: true,
      }
    }

    // RN#19: data e horário respeitando a maior antecedência
    if (
      !dataPermitida(
        dados.data,
        dados.horario,
        agora,
        maiorAntecedencia(produtos)
      )
    ) {
      return {
        ok: false,
        mensagem: "Escolha outra data ou horário.",
        campo: "data",
      }
    }

    // RN#14: capacidade da data escolhida (pode ter mudado desde que o item foi ao carrinho)
    const vendidos = await vendidosNoDia(ids, dados.data, tx)
    for (const item of itens) {
      const p = porId.get(item.produtoId)!
      const disponivel = calcularDisponivel(
        p.limiteDiario,
        vendidos.get(p.id) ?? 0
      )
      if (item.quantidade > disponivel) {
        const quando = formatData(new Date(`${dados.data}T12:00:00-03:00`))
        return {
          ok: false,
          mensagem:
            disponivel === 0
              ? `${p.nome} esgotou para ${quando}. Escolha outra data ou remova o item.`
              : `${p.nome}: só restam ${disponivel} unidade(s) para ${quando}.`,
          campo: "data",
          carrinhoDesatualizado: true,
        }
      }
    }

    // RN#04 / RN#20: frete pela área, retirada não paga
    let freteCentavos = 0
    if (dados.modalidade === "ENTREGA") {
      const area = buscarArea(dados.cep, await tx.areaEntrega.findMany())
      if (!area)
        return {
          ok: false,
          mensagem: "Ainda não entregamos nesse CEP.",
          campo: "cep",
        }
      freteCentavos = area.freteCentavos
    }

    const linhas = itens.map((i) => {
      const p = porId.get(i.produtoId)!
      return {
        produtoId: p.id,
        nomeProduto: p.nome,
        precoUnitarioCentavos: p.precoCentavos,
        quantidade: i.quantidade,
      }
    })
    const totais = calcularTotais(
      linhas.map((l) => ({
        precoCentavos: l.precoUnitarioCentavos,
        quantidade: l.quantidade,
      })),
      freteCentavos
    )

    // US-11: pagamento simulado. Recusado → nenhum pedido é criado (RN#23)
    const pagamento = processarPagamento(
      dadosPagamento(dados),
      totais.totalCentavos
    )
    if (!pagamento.aprovado)
      return { ok: false, mensagem: pagamento.motivo, campo: "pagamento" }

    const pedido = await criarPedido(
      {
        nomeCliente: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        modalidade: dados.modalidade,
        cep: dados.modalidade === "ENTREGA" ? dados.cep : null,
        endereco:
          dados.modalidade === "ENTREGA" ? enderecoCompleto(dados) : null,
        dataAgendada: new Date(`${dados.data}T${dados.horario}:00-03:00`),
        subtotalCentavos: totais.subtotalCentavos,
        freteCentavos,
        totalCentavos: totais.totalCentavos,
        formaPagamento: dados.formaPagamento,
        statusPagamento: pagamento.statusPagamento,
        cartaoFinal: pagamento.cartaoFinal,
        trocoParaCentavos: pagamento.trocoParaCentavos,
        status: pagamento.statusPedido,
        observacao: dados.observacao || null,
        itens: linhas,
      },
      "Cliente",
      tx
    )
    return { ok: true, numero: pedido.numero }
  })
}
