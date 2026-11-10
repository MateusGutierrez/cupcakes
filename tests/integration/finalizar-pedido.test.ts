import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import type { PrismaClient } from "@/generated/prisma/client"
import { finalizarPedidoService } from "@/models/services/finalizar-pedido"
import { pedidoSchema } from "@/models/schemas/checkout.schema"

import { criarBancoDeTeste } from "./banco-de-teste"

// 10/11/2026 09:00 em São Paulo
const AGORA = new Date("2026-11-10T12:00:00Z")

let banco: ReturnType<typeof criarBancoDeTeste>
let db: PrismaClient
let idRedVelvet: number
let idEncomenda: number

const base = {
  nome: "Maria Silva",
  email: "maria@email.com",
  telefone: "11987654321",
  data: "2026-11-12",
  horario: "14:00",
}
const retiradaPix = pedidoSchema.parse({
  ...base,
  modalidade: "RETIRADA",
  formaPagamento: "PIX",
})
const entregaCartao = (cartaoNumero: string, cep = "01310100") =>
  pedidoSchema.parse({
    ...base,
    modalidade: "ENTREGA",
    cep,
    rua: "Av. Paulista",
    numero: "1000",
    bairro: "Bela Vista",
    formaPagamento: "CARTAO",
    cartaoNumero,
    cartaoNome: "MARIA SILVA",
    cartaoValidade: "12/30",
    cartaoCvv: "123",
  })

beforeAll(() => {
  banco = criarBancoDeTeste()
  db = banco.db
})
afterAll(() => banco.remover())

beforeEach(async () => {
  await db.historicoStatus.deleteMany()
  await db.itemPedido.deleteMany()
  await db.pedido.deleteMany()
  await db.produto.deleteMany()
  await db.areaEntrega.deleteMany()
  const comum = {
    descricao: "x",
    ingredientes: "x",
    alergenicos: "Contém glúten",
    imagemUrl: "/x.svg",
    ativo: true,
  }
  idRedVelvet = (
    await db.produto.create({
      data: {
        ...comum,
        slug: "rv",
        nome: "Red Velvet",
        precoCentavos: 1200,
        limiteDiario: 3,
      },
    })
  ).id
  idEncomenda = (
    await db.produto.create({
      data: {
        ...comum,
        slug: "enc",
        nome: "Encomenda",
        precoCentavos: 1400,
        limiteDiario: 10,
        antecedenciaHoras: 72,
      },
    })
  ).id
  await db.areaEntrega.create({
    data: {
      nome: "Centro",
      cepInicio: "01000000",
      cepFim: "01599999",
      freteCentavos: 800,
    },
  })
})

describe("finalizarPedido (US-12)", () => {
  it("cria pedido, itens com snapshot de preço e histórico inicial", async () => {
    const r = await finalizarPedidoService(
      entregaCartao("4111111111111111"),
      [{ produtoId: idRedVelvet, quantidade: 2 }],
      AGORA,
      db
    )
    expect(r).toMatchObject({ ok: true })
    if (!r.ok) return
    expect(r.numero).toMatch(/^CG-\d{6}$/) // RN#24

    const pedido = await db.pedido.findUniqueOrThrow({
      where: { numero: r.numero },
      include: { itens: true, historico: true },
    })
    expect(pedido).toMatchObject({
      status: "RECEBIDO",
      statusPagamento: "APROVADO",
      cartaoFinal: "1111", // RNF#20: só os 4 últimos
      subtotalCentavos: 2400,
      freteCentavos: 800,
      totalCentavos: 3200,
    })
    expect(pedido.itens[0]).toMatchObject({
      nomeProduto: "Red Velvet",
      precoUnitarioCentavos: 1200,
      quantidade: 2,
    })
    expect(pedido.historico).toHaveLength(1)
    expect(pedido.historico[0]).toMatchObject({
      de: null,
      para: "RECEBIDO",
      responsavel: "Cliente",
    })

    // Snapshot: mudar o preço do produto não altera o pedido
    await db.produto.update({
      where: { id: idRedVelvet },
      data: { precoCentavos: 9999 },
    })
    const item = await db.itemPedido.findFirstOrThrow({
      where: { pedidoId: pedido.id },
    })
    expect(item.precoUnitarioCentavos).toBe(1200)
  })

  it("recusa se a capacidade estourou entre o carrinho e a finalização (RN#14)", async () => {
    const primeiro = await finalizarPedidoService(
      retiradaPix,
      [{ produtoId: idRedVelvet, quantidade: 2 }],
      AGORA,
      db
    )
    expect(primeiro.ok).toBe(true)

    const segundo = await finalizarPedidoService(
      retiradaPix,
      [{ produtoId: idRedVelvet, quantidade: 2 }],
      AGORA,
      db
    )
    expect(segundo).toMatchObject({ ok: false, carrinhoDesatualizado: true })
    expect(await db.pedido.count()).toBe(1)
  })

  it("pedidos cancelados liberam a capacidade", async () => {
    const primeiro = await finalizarPedidoService(
      retiradaPix,
      [{ produtoId: idRedVelvet, quantidade: 3 }],
      AGORA,
      db
    )
    if (!primeiro.ok) throw new Error("deveria criar")
    await db.pedido.update({
      where: { numero: primeiro.numero },
      data: { status: "CANCELADO" },
    })

    const segundo = await finalizarPedidoService(
      retiradaPix,
      [{ produtoId: idRedVelvet, quantidade: 3 }],
      AGORA,
      db
    )
    expect(segundo.ok).toBe(true)
  })

  it("cartão recusado não cria pedido (RN#23)", async () => {
    const r = await finalizarPedidoService(
      entregaCartao("4000000000000002"),
      [{ produtoId: idRedVelvet, quantidade: 1 }],
      AGORA,
      db
    )
    expect(r).toMatchObject({ ok: false, campo: "pagamento" })
    expect(await db.pedido.count()).toBe(0)
  })

  it("PIX cria o pedido aguardando pagamento (RN#21)", async () => {
    const r = await finalizarPedidoService(
      retiradaPix,
      [{ produtoId: idRedVelvet, quantidade: 1 }],
      AGORA,
      db
    )
    if (!r.ok) throw new Error("deveria criar")
    const pedido = await db.pedido.findUniqueOrThrow({
      where: { numero: r.numero },
    })
    expect(pedido).toMatchObject({
      status: "AGUARDANDO_PAGAMENTO",
      statusPagamento: "PENDENTE",
      freteCentavos: 0,
    })
  })

  it("recusa CEP fora da área de entrega", async () => {
    const r = await finalizarPedidoService(
      entregaCartao("4111111111111111", "20040020"),
      [{ produtoId: idRedVelvet, quantidade: 1 }],
      AGORA,
      db
    )
    expect(r).toMatchObject({ ok: false, campo: "cep" })
  })

  it("recusa data antes da antecedência do produto (RN#19)", async () => {
    // Encomenda exige 72h; 12/11 14:00 fica a ~53h de AGORA
    const r = await finalizarPedidoService(
      retiradaPix,
      [{ produtoId: idEncomenda, quantidade: 1 }],
      AGORA,
      db
    )
    expect(r).toMatchObject({ ok: false, campo: "data" })
  })

  it("recusa produto inativo", async () => {
    await db.produto.update({
      where: { id: idRedVelvet },
      data: { ativo: false },
    })
    const r = await finalizarPedidoService(
      retiradaPix,
      [{ produtoId: idRedVelvet, quantidade: 1 }],
      AGORA,
      db
    )
    expect(r).toMatchObject({ ok: false, carrinhoDesatualizado: true })
  })

  it("soma itens repetidos antes de checar a capacidade", async () => {
    const r = await finalizarPedidoService(
      retiradaPix,
      [
        { produtoId: idRedVelvet, quantidade: 2 },
        { produtoId: idRedVelvet, quantidade: 2 },
      ],
      AGORA,
      db
    )
    expect(r.ok).toBe(false)
  })
})
