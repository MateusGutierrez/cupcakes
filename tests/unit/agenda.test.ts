import { describe, expect, it } from "vitest"

import {
  dataPermitida,
  diaDaSemana,
  horariosDisponiveis,
  instanteAgendado,
  janelaDeDatas,
  lojaAberta,
  somarDias,
} from "@/models/domain/agenda"

// 10/11/2026 às 09:00 em São Paulo (12:00 UTC)
const agora = new Date("2026-11-10T12:00:00Z")

describe("agenda (RN#19)", () => {
  it("instanteAgendado usa o fuso da loja", () => {
    expect(instanteAgendado("2026-11-10", "14:00").toISOString()).toBe(
      "2026-11-10T17:00:00.000Z"
    )
  })

  it("pronta entrega: respeita o preparo mínimo de 2h", () => {
    // 09:00 + 2h = 11:00 → 10:00 fica de fora
    expect(horariosDisponiveis("2026-11-10", agora, 0)).toEqual([
      "12:00",
      "14:00",
      "16:00",
      "18:00",
    ])
  })

  it("antecedência de 48h bloqueia hoje e amanhã", () => {
    expect(horariosDisponiveis("2026-11-10", agora, 48)).toEqual([])
    expect(horariosDisponiveis("2026-11-11", agora, 48)).toEqual([])
    // 12/11 09:00 é o limite → 10:00 em diante
    expect(horariosDisponiveis("2026-11-12", agora, 48)[0]).toBe("10:00")
  })

  it("janela começa no primeiro dia com horário livre", () => {
    expect(janelaDeDatas(agora, 0).primeiro).toBe("2026-11-10")
    expect(janelaDeDatas(agora, 48).primeiro).toBe("2026-11-12")
    // Depois das 16h, hoje não tem mais horário
    expect(janelaDeDatas(new Date("2026-11-10T20:00:00Z"), 0).primeiro).toBe(
      "2026-11-11"
    )
  })

  it("dataPermitida rejeita passado, horário apertado e além da janela", () => {
    expect(dataPermitida("2026-11-09", "14:00", agora, 0)).toBe(false)
    expect(dataPermitida("2026-11-10", "10:00", agora, 0)).toBe(false)
    expect(dataPermitida("2026-11-10", "14:00", agora, 0)).toBe(true)
    expect(dataPermitida(somarDias("2026-11-10", 31), "14:00", agora, 0)).toBe(
      false
    )
  })

  it("domingo: loja fechada, sem horários e rejeitado no servidor", () => {
    // 15/11/2026 é domingo
    expect(diaDaSemana("2026-11-15")).toBe(0)
    expect(lojaAberta("2026-11-15")).toBe(false)
    expect(lojaAberta("2026-11-14")).toBe(true)
    expect(horariosDisponiveis("2026-11-15", agora, 0)).toEqual([])
    expect(dataPermitida("2026-11-15", "18:00", agora, 0)).toBe(false)
    expect(dataPermitida("2026-11-16", "18:00", agora, 0)).toBe(true)
  })

  it("janela pula o domingo", () => {
    // Sábado 14/11 às 17:00 (20:00 UTC): sábado acabou, domingo fechado → segunda
    expect(janelaDeDatas(new Date("2026-11-14T20:00:00Z"), 0).primeiro).toBe(
      "2026-11-16"
    )
  })

  it("somarDias atravessa meses", () => {
    expect(somarDias("2026-11-30", 1)).toBe("2026-12-01")
  })
})
