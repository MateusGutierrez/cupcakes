import { describe, expect, it } from "vitest"

import {
  diaLocal,
  formatBRL,
  formatCEP,
  formatData,
  formatDataHora,
  formatTelefone,
  intervaloDoDia,
} from "@/lib/format"

// Intl usa espaço não separável entre "R$" e o número
const nbsp = (s: string) => s.replace(/ /g, " ")

describe("formatBRL", () => {
  it("formata centavos em reais", () => {
    expect(nbsp(formatBRL(1250))).toBe("R$ 12,50")
    expect(nbsp(formatBRL(0))).toBe("R$ 0,00")
    expect(nbsp(formatBRL(123456))).toBe("R$ 1.234,56")
  })
})

describe("formatCEP", () => {
  it("aplica a máscara 00000-000", () => {
    expect(formatCEP("01310100")).toBe("01310-100")
    expect(formatCEP("01310-100")).toBe("01310-100")
  })
  it("aceita entrada parcial e ignora excesso", () => {
    expect(formatCEP("013")).toBe("013")
    expect(formatCEP("013101")).toBe("01310-1")
    expect(formatCEP("0131010099")).toBe("01310-100")
  })
})

describe("formatTelefone", () => {
  it("formata celular e fixo", () => {
    expect(formatTelefone("11987654321")).toBe("(11) 98765-4321")
    expect(formatTelefone("1133334444")).toBe("(11) 3333-4444")
  })
  it("aceita entrada parcial", () => {
    expect(formatTelefone("1")).toBe("(1")
    expect(formatTelefone("119")).toBe("(11) 9")
    expect(formatTelefone("")).toBe("")
  })
})

describe("datas no fuso da loja", () => {
  // 02:00 UTC do dia 11 ainda é dia 10 em São Paulo (23:00)
  const instante = new Date("2026-11-11T02:00:00Z")

  it("diaLocal usa o fuso de São Paulo", () => {
    expect(diaLocal(instante)).toBe("2026-11-10")
    expect(diaLocal(new Date("2026-11-11T03:00:00Z"))).toBe("2026-11-11")
  })

  it("formatData e formatDataHora", () => {
    expect(formatData(instante)).toBe("10/11/2026")
    expect(formatData(instante, "longa")).toBe("terça-feira, 10 de novembro")
    expect(formatDataHora(instante)).toBe("10/11/2026 23:00")
  })

  it("intervaloDoDia cobre exatamente 24h do dia local", () => {
    const { inicio, fim } = intervaloDoDia("2026-11-10")
    expect(inicio.toISOString()).toBe("2026-11-10T03:00:00.000Z")
    expect(fim.toISOString()).toBe("2026-11-11T03:00:00.000Z")
    expect(instante >= inicio && instante < fim).toBe(true)
  })
})
