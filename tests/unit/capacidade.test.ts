import { describe, expect, it } from "vitest"

import {
  calcularDisponivel,
  estaIndisponivel,
  ocupaCapacidade,
} from "@/models/domain/capacidade"

describe("capacidade diária (RN#14)", () => {
  it("disponível = limite − vendidos", () => {
    expect(calcularDisponivel(20, 5)).toBe(15)
    expect(calcularDisponivel(20, 0)).toBe(20)
  })

  it("nunca fica negativo", () => {
    expect(calcularDisponivel(10, 12)).toBe(0)
  })

  it("limite 0 = indisponível (US-03 CA#2)", () => {
    expect(estaIndisponivel(0, 0)).toBe(true)
    expect(estaIndisponivel(10, 10)).toBe(true)
    expect(estaIndisponivel(10, 9)).toBe(false)
  })

  it("pedidos cancelados não contam; aguardando pagamento conta", () => {
    expect(ocupaCapacidade("CANCELADO")).toBe(false)
    expect(ocupaCapacidade("AGUARDANDO_PAGAMENTO")).toBe(true)
    expect(ocupaCapacidade("RECEBIDO")).toBe(true)
    expect(ocupaCapacidade("ENTREGUE")).toBe(true)
  })
})
