import { describe, expect, it } from "vitest"

import {
  checkoutSchema,
  enderecoCompleto,
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
