import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import type { StatusPedido } from "@/generated/prisma/enums"
import { mudarStatusService } from "@/models/services/mudar-status"

import { criarBancoDeTeste } from "./banco-de-teste"

let banco: ReturnType<typeof criarBancoDeTeste>
let usuario: { id: number; nome: string }
let pedidoId: number

async function criarPedido(dados: {
  status: StatusPedido
  modalidade?: "ENTREGA" | "RETIRADA"
  pagamento?: "CARTAO" | "PIX" | "DINHEIRO"
}) {
  const formaPagamento = dados.pagamento ?? "CARTAO"
  const p = await banco.db.pedido.create({
    data: {
      numero: `CG-${Math.random().toString().slice(2, 8)}`,
      nomeCliente: "Maria",
      email: "maria@email.com",
      telefone: "11987654321",
      modalidade: dados.modalidade ?? "RETIRADA",
      dataAgendada: new Date(),
      subtotalCentavos: 1000,
      freteCentavos: 0,
      totalCentavos: 1000,
      formaPagamento,
      statusPagamento:
        dados.status === "AGUARDANDO_PAGAMENTO"
          ? "PENDENTE"
          : formaPagamento === "DINHEIRO"
            ? "NA_ENTREGA"
            : "APROVADO",
      status: dados.status,
    },
  })
  return p.id
}

beforeAll(async () => {
  banco = criarBancoDeTeste()
  const u = await banco.db.usuario.create({
    data: {
      nome: "Beto Atendente",
      email: "beto@x.com",
      senhaHash: "x",
      papel: "ATENDENTE",
    },
  })
  usuario = { id: u.id, nome: u.nome }
})
afterAll(() => banco.remover())
beforeEach(async () => {
  pedidoId = await criarPedido({ status: "RECEBIDO" })
})

describe("avancarStatus (US-17)", () => {
  it("avança e grava histórico com o responsável (CA#3, RN#27) e auditoria", async () => {
    const r = await mudarStatusService(
      { pedidoId, de: "RECEBIDO", para: "EM_PREPARO", usuario },
      banco.db
    )
    expect(r.ok).toBe(true)
    const pedido = await banco.db.pedido.findUniqueOrThrow({
      where: { id: pedidoId },
      include: { historico: true },
    })
    expect(pedido.status).toBe("EM_PREPARO")
    expect(pedido.historico.at(-1)).toMatchObject({
      de: "RECEBIDO",
      para: "EM_PREPARO",
      responsavel: "Beto Atendente",
    })
    const log = await banco.db.logAuditoria.findFirst({
      where: { entidade: "Pedido", entidadeId: String(pedidoId) },
    })
    expect(log).toMatchObject({
      usuarioId: usuario.id,
      acao: "STATUS_EM_PREPARO",
    })
  })

  it("não deixa pular etapa (CA#2)", async () => {
    const r = await mudarStatusService(
      { pedidoId, de: "RECEBIDO", para: "PRONTO", usuario },
      banco.db
    )
    expect(r.ok).toBe(false)
  })

  it("recusa se o pedido já mudou (dois atendentes / clique duplo)", async () => {
    await mudarStatusService(
      { pedidoId, de: "RECEBIDO", para: "EM_PREPARO", usuario },
      banco.db
    )
    const r = await mudarStatusService(
      { pedidoId, de: "RECEBIDO", para: "EM_PREPARO", usuario },
      banco.db
    )
    expect(r.ok).toBe(false)
    expect(await banco.db.historicoStatus.count({ where: { pedidoId } })).toBe(
      1
    )
  })

  it("entregue e cancelado não mudam mais (CA#4)", async () => {
    const entregue = await criarPedido({ status: "ENTREGUE" })
    expect(
      (
        await mudarStatusService(
          { pedidoId: entregue, de: "ENTREGUE", para: "CANCELADO", usuario },
          banco.db
        )
      ).ok
    ).toBe(false)
    const cancelado = await criarPedido({ status: "CANCELADO" })
    expect(
      (
        await mudarStatusService(
          { pedidoId: cancelado, de: "CANCELADO", para: "RECEBIDO", usuario },
          banco.db
        )
      ).ok
    ).toBe(false)
  })

  it("cancelar pedido pago com cartão estorna; em dinheiro só cancela (RN#29)", async () => {
    await mudarStatusService(
      { pedidoId, de: "RECEBIDO", para: "CANCELADO", usuario },
      banco.db
    )
    expect(
      (await banco.db.pedido.findUniqueOrThrow({ where: { id: pedidoId } }))
        .statusPagamento
    ).toBe("ESTORNADO")

    const dinheiro = await criarPedido({
      status: "RECEBIDO",
      pagamento: "DINHEIRO",
    })
    await mudarStatusService(
      { pedidoId: dinheiro, de: "RECEBIDO", para: "CANCELADO", usuario },
      banco.db
    )
    expect(
      (await banco.db.pedido.findUniqueOrThrow({ where: { id: dinheiro } }))
        .statusPagamento
    ).toBe("NA_ENTREGA")
  })

  it("não cancela depois que o preparo começou (RN#28)", async () => {
    await mudarStatusService(
      { pedidoId, de: "RECEBIDO", para: "EM_PREPARO", usuario },
      banco.db
    )
    const r = await mudarStatusService(
      { pedidoId, de: "EM_PREPARO", para: "CANCELADO", usuario },
      banco.db
    )
    expect(r.ok).toBe(false)
  })

  it("confirmar PIX manualmente aprova o pagamento", async () => {
    const pix = await criarPedido({
      status: "AGUARDANDO_PAGAMENTO",
      pagamento: "PIX",
    })
    await mudarStatusService(
      { pedidoId: pix, de: "AGUARDANDO_PAGAMENTO", para: "RECEBIDO", usuario },
      banco.db
    )
    expect(
      await banco.db.pedido.findUniqueOrThrow({ where: { id: pix } })
    ).toMatchObject({
      status: "RECEBIDO",
      statusPagamento: "APROVADO",
    })
  })
})
