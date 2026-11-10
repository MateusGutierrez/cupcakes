import { describe, expect, it } from "vitest"

import {
  checkoutSchema,
  enderecoCompleto,
  pedidoSchema,
} from "@/models/schemas/checkout.schema"

const retirada = {
  modalidade: "RETIRADA" as const,
  nome: "Maria Silva",
  email: "Maria@Email.com ",
  telefone: "(11) 98765-4321",
  data: "2026-11-12",
  horario: "14:00",
}

const entrega = {
  ...retirada,
  modalidade: "ENTREGA" as const,
  cep: "01310-100",
  rua: "Av. Paulista",
  numero: "1000",
  bairro: "Bela Vista",
}

function erros(
  dados: Record<string, unknown>
): Record<string, string[] | undefined> {
  const r = checkoutSchema.safeParse(dados)
  return r.success ? {} : r.error.flatten().fieldErrors
}

describe("checkoutSchema (US-02, US-10)", () => {
  it("aceita retirada e normaliza e-mail e telefone", () => {
    const r = checkoutSchema.parse(retirada)
    expect(r.email).toBe("maria@email.com")
    expect(r.telefone).toBe("11987654321")
  })

  it("nome, e-mail e telefone são obrigatórios (RN#05, CA#2)", () => {
    const e = erros({ ...retirada, nome: "", email: "", telefone: "" })
    expect(e.nome).toBeDefined()
    expect(e.email).toBeDefined()
    expect(e.telefone).toBeDefined()
  })

  it("rejeita e-mail e telefone inválidos", () => {
    expect(erros({ ...retirada, email: "maria@" }).email).toBeDefined()
    expect(erros({ ...retirada, telefone: "98765" }).telefone).toBeDefined()
  })

  it("entrega exige CEP válido e endereço", () => {
    expect(checkoutSchema.parse(entrega)).toMatchObject({ cep: "01310100" })
    const e = erros({ ...entrega, cep: "123", rua: "", numero: "", bairro: "" })
    expect(e.cep).toBeDefined()
    expect(e.rua).toBeDefined()
    expect(e.numero).toBeDefined()
    expect(e.bairro).toBeDefined()
  })

  it("retirada não exige endereço", () => {
    expect(checkoutSchema.safeParse(retirada).success).toBe(true)
  })

  it("exige data e um dos horários fixos", () => {
    expect(erros({ ...retirada, data: "" }).data).toBeDefined()
    expect(erros({ ...retirada, horario: "13:00" }).horario).toBeDefined()
  })

  it("monta o endereço em uma linha", () => {
    const d = checkoutSchema.parse({ ...entrega, complemento: "ap 12" })
    if (d.modalidade !== "ENTREGA") throw new Error()
    expect(enderecoCompleto(d)).toBe("Av. Paulista, 1000, ap 12 — Bela Vista")
  })
})

describe("pedidoSchema = checkout + pagamento (US-11)", () => {
  const cartao = {
    formaPagamento: "CARTAO" as const,
    cartaoNumero: "4111 1111 1111 1111",
    cartaoNome: "MARIA SILVA",
    cartaoValidade: "12/30",
    cartaoCvv: "123",
  }

  function errosPedido(
    dados: Record<string, unknown>
  ): Record<string, string[] | undefined> {
    const r = pedidoSchema.safeParse(dados)
    return r.success ? {} : r.error.flatten().fieldErrors
  }

  it("aceita retirada com cartão e mantém os dois lados", () => {
    const r = pedidoSchema.parse({ ...retirada, ...cartao })
    expect(r.modalidade).toBe("RETIRADA")
    expect(r.formaPagamento).toBe("CARTAO")
    if (r.formaPagamento === "CARTAO")
      expect(r.cartaoNumero).toBe("4111111111111111")
  })

  it("aceita entrega com PIX", () => {
    expect(
      pedidoSchema.safeParse({ ...entrega, formaPagamento: "PIX" }).success
    ).toBe(true)
  })

  it("valida os campos do cartão", () => {
    const e = errosPedido({
      ...retirada,
      ...cartao,
      cartaoNumero: "1234",
      cartaoValidade: "01/20",
      cartaoCvv: "1",
    })
    expect(e.cartaoNumero).toBeDefined()
    expect(e.cartaoValidade).toBeDefined()
    expect(e.cartaoCvv).toBeDefined()
  })

  it("troco em dinheiro é opcional e convertido para centavos", () => {
    const sem = pedidoSchema.parse({
      ...retirada,
      formaPagamento: "DINHEIRO",
      trocoPara: "",
    })
    const com = pedidoSchema.parse({
      ...retirada,
      formaPagamento: "DINHEIRO",
      trocoPara: "100,00",
    })
    expect(sem.formaPagamento === "DINHEIRO" && sem.trocoPara).toBeNull()
    expect(com.formaPagamento === "DINHEIRO" && com.trocoPara).toBe(10000)
  })

  it("exige escolher a forma de pagamento", () => {
    expect(pedidoSchema.safeParse(retirada).success).toBe(false)
  })
})
