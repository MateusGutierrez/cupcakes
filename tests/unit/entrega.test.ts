import { describe, expect, it } from "vitest"

import {
  buscarArea,
  calcularFrete,
  cepValido,
  normalizarCEP,
} from "@/models/domain/entrega"

const areas = [
  {
    nome: "Centro",
    cepInicio: "01000000",
    cepFim: "01599999",
    freteCentavos: 800,
  },
  {
    nome: "Zona Sul",
    cepInicio: "04000000",
    cepFim: "04999999",
    freteCentavos: 1500,
  },
]

describe("formato do CEP (US-09 CA#3)", () => {
  it("aceita com ou sem hífen", () => {
    expect(normalizarCEP("01310-100")).toBe("01310100")
    expect(normalizarCEP("01310100")).toBe("01310100")
  })

  it("rejeita formatos inválidos", () => {
    expect(cepValido("1234")).toBe(false)
    expect(cepValido("01310-1000")).toBe(false)
    expect(cepValido("abcde-fgh")).toBe(false)
    expect(cepValido("01.310-100")).toBe(false)
  })
})

describe("área de entrega (RN#04, RN#17)", () => {
  it("CEP dentro da área retorna a área (CA#1)", () => {
    expect(buscarArea("01310-100", areas)?.nome).toBe("Centro")
    expect(buscarArea("04999999", areas)?.nome).toBe("Zona Sul")
  })

  it("limites da faixa são inclusivos", () => {
    expect(buscarArea("01000000", areas)?.nome).toBe("Centro")
    expect(buscarArea("01599999", areas)?.nome).toBe("Centro")
  })

  it("CEP fora da área retorna null (CA#2)", () => {
    expect(buscarArea("20040-020", areas)).toBeNull()
  })

  it("formato inválido retorna null", () => {
    expect(buscarArea("123", areas)).toBeNull()
  })
})

describe("frete (RN#20)", () => {
  it("entrega cobra o frete da área", () => {
    expect(calcularFrete("ENTREGA", areas[1])).toBe(1500)
  })

  it("retirada não cobra frete", () => {
    expect(calcularFrete("RETIRADA", null)).toBe(0)
    expect(calcularFrete("RETIRADA", areas[1])).toBe(0)
  })

  it("entrega fora da área é erro", () => {
    expect(() => calcularFrete("ENTREGA", null)).toThrow()
  })
})
