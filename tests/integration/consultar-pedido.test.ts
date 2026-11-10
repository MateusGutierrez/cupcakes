import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { buscarPedidoDoCliente } from "@/models/repositories/pedido.repository"

import { criarBancoDeTeste } from "./banco-de-teste"

let banco: ReturnType<typeof criarBancoDeTeste>

beforeAll(async () => {
  banco = criarBancoDeTeste()
  await banco.db.pedido.create({
    data: {
      numero: "CG-000042",
      nomeCliente: "Maria",
      email: "maria@email.com",
      telefone: "11987654321",
      modalidade: "RETIRADA",
      dataAgendada: new Date(),
      subtotalCentavos: 1000,
      freteCentavos: 0,
      totalCentavos: 1000,
      formaPagamento: "PIX",
      statusPagamento: "PENDENTE",
      status: "AGUARDANDO_PAGAMENTO",
    },
  })
})
afterAll(() => banco.remover())

describe("consultarPedido (US-13 CA#3)", () => {
  it("número + e-mail corretos retornam o pedido", async () => {
    expect(
      await buscarPedidoDoCliente("CG-000042", "maria@email.com", banco.db)
    ).toBe("CG-000042")
  })

  it("e-mail com maiúsculas/espaços também confere", async () => {
    expect(
      await buscarPedidoDoCliente("CG-000042", "  Maria@Email.com ", banco.db)
    ).toBe("CG-000042")
  })

  it("e-mail errado não vaza dados (mesmo resultado de número inexistente)", async () => {
    const emailErrado = await buscarPedidoDoCliente(
      "CG-000042",
      "outra@email.com",
      banco.db
    )
    const inexistente = await buscarPedidoDoCliente(
      "CG-999999",
      "maria@email.com",
      banco.db
    )
    expect(emailErrado).toBeNull()
    expect(inexistente).toBeNull()
  })
})
