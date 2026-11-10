import { describe, expect, it } from "vitest"

import {
  CARTAO_APROVADO_EXEMPLO,
  CARTAO_RECUSADO_EXEMPLO,
  luhnValido,
  pixCopiaECola,
  processarPagamento,
  validadeOk,
} from "@/models/domain/pagamento"

describe("Luhn", () => {
  it("valida números de cartão", () => {
    expect(luhnValido(CARTAO_APROVADO_EXEMPLO)).toBe(true)
    expect(luhnValido(CARTAO_RECUSADO_EXEMPLO)).toBe(true)
    expect(luhnValido("4111 1111 1111 1112")).toBe(false)
    expect(luhnValido("1234")).toBe(false)
  })
})

describe("validade do cartão", () => {
  const agora = new Date(2026, 10, 10) // novembro/2026
  it("aceita mês atual e futuro, recusa vencido e formato errado", () => {
    expect(validadeOk("11/26", agora)).toBe(true)
    expect(validadeOk("01/30", agora)).toBe(true)
    expect(validadeOk("10/26", agora)).toBe(false)
    expect(validadeOk("13/27", agora)).toBe(false)
    expect(validadeOk("1127", agora)).toBe(false)
  })
})

describe("processarPagamento (US-11)", () => {
  it("cartão válido é aprovado e guarda só os 4 últimos dígitos (RNF#20)", () => {
    const r = processarPagamento(
      { formaPagamento: "CARTAO", cartaoNumero: CARTAO_APROVADO_EXEMPLO },
      5000
    )
    expect(r).toMatchObject({
      aprovado: true,
      statusPagamento: "APROVADO",
      statusPedido: "RECEBIDO",
      cartaoFinal: "1111",
    })
  })

  it("cartão com final 0002 é recusado (RN#23)", () => {
    const r = processarPagamento(
      { formaPagamento: "CARTAO", cartaoNumero: CARTAO_RECUSADO_EXEMPLO },
      5000
    )
    expect(r.aprovado).toBe(false)
  })

  it("cartão com Luhn inválido é recusado", () => {
    expect(
      processarPagamento(
        { formaPagamento: "CARTAO", cartaoNumero: "4111111111111112" },
        1
      ).aprovado
    ).toBe(false)
  })

  it("PIX deixa o pedido aguardando pagamento (RN#21)", () => {
    expect(processarPagamento({ formaPagamento: "PIX" }, 5000)).toMatchObject({
      aprovado: true,
      statusPagamento: "PENDENTE",
      statusPedido: "AGUARDANDO_PAGAMENTO",
    })
  })

  it("dinheiro fica NA_ENTREGA e valida o troco (RN#22)", () => {
    expect(
      processarPagamento(
        { formaPagamento: "DINHEIRO", trocoParaCentavos: null },
        5000
      )
    ).toMatchObject({
      aprovado: true,
      statusPagamento: "NA_ENTREGA",
      statusPedido: "RECEBIDO",
    })
    expect(
      processarPagamento(
        { formaPagamento: "DINHEIRO", trocoParaCentavos: 10000 },
        5000
      )
    ).toMatchObject({
      trocoParaCentavos: 10000,
    })
    expect(
      processarPagamento(
        { formaPagamento: "DINHEIRO", trocoParaCentavos: 2000 },
        5000
      ).aprovado
    ).toBe(false)
  })

  it("copia e cola contém o número do pedido e o valor", () => {
    const codigo = pixCopiaECola("CG-000123", 4450)
    expect(codigo).toContain("CG-000123")
    expect(codigo).toContain("44.50")
  })
})
