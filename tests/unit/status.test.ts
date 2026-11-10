import { describe, expect, it } from "vitest"

import {
  ehTerminal,
  etapasDoPedido,
  gerarNumeroPedido,
  podeCancelar,
  podeTransicionar,
  proximoStatus,
} from "@/models/domain/status"

describe("máquina de estados (RN#26)", () => {
  it("transição válida avança uma etapa (US-17 CA#2)", () => {
    expect(podeTransicionar("RECEBIDO", "EM_PREPARO", "ENTREGA")).toBe(true)
    expect(
      podeTransicionar("AGUARDANDO_PAGAMENTO", "RECEBIDO", "ENTREGA")
    ).toBe(true)
  })

  it("pular etapa é bloqueado", () => {
    expect(podeTransicionar("RECEBIDO", "PRONTO", "ENTREGA")).toBe(false)
    expect(podeTransicionar("EM_PREPARO", "ENTREGUE", "ENTREGA")).toBe(false)
  })

  it("voltar etapa é bloqueado", () => {
    expect(podeTransicionar("PRONTO", "EM_PREPARO", "ENTREGA")).toBe(false)
  })

  it("retirada pula 'Saiu para entrega'", () => {
    expect(proximoStatus("PRONTO", "RETIRADA")).toBe("ENTREGUE")
    expect(proximoStatus("PRONTO", "ENTREGA")).toBe("SAIU_PARA_ENTREGA")
    expect(podeTransicionar("PRONTO", "SAIU_PARA_ENTREGA", "RETIRADA")).toBe(
      false
    )
    expect(etapasDoPedido("RETIRADA")).not.toContain("SAIU_PARA_ENTREGA")
  })

  it("estados terminais não mudam (US-17 CA#4)", () => {
    expect(ehTerminal("ENTREGUE")).toBe(true)
    expect(ehTerminal("CANCELADO")).toBe(true)
    expect(proximoStatus("ENTREGUE", "ENTREGA")).toBeNull()
    expect(podeTransicionar("CANCELADO", "RECEBIDO", "ENTREGA")).toBe(false)
    expect(podeTransicionar("ENTREGUE", "CANCELADO", "ENTREGA")).toBe(false)
  })

  it("cancelar só antes do preparo (US-14 CA#2, RN#28)", () => {
    expect(podeCancelar("RECEBIDO")).toBe(true)
    expect(podeCancelar("AGUARDANDO_PAGAMENTO")).toBe(true)
    expect(podeCancelar("EM_PREPARO")).toBe(false)
    expect(podeTransicionar("EM_PREPARO", "CANCELADO", "ENTREGA")).toBe(false)
  })
})

describe("número do pedido (RN#24)", () => {
  it("formata com prefixo e zeros", () => {
    expect(gerarNumeroPedido(123)).toBe("CG-000123")
    expect(gerarNumeroPedido(1234567)).toBe("CG-1234567")
  })
})
