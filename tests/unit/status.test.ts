import { describe, expect, it } from "vitest"

import {
  ehTerminal,
  etapasDoPedido,
  gerarNumeroPedido,
  linhaDoTempo,
  normalizarNumeroPedido,
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

describe("linhaDoTempo (US-13)", () => {
  const t = (min: number) => new Date(Date.UTC(2026, 10, 10, 12, min))

  it("marca etapas feitas, atual e pendentes com data/hora", () => {
    const linha = linhaDoTempo("ENTREGA", "EM_PREPARO", [
      { para: "RECEBIDO", createdAt: t(0) },
      { para: "EM_PREPARO", createdAt: t(10) },
    ])
    expect(linha.map((e) => [e.status, e.estado])).toEqual([
      ["RECEBIDO", "feito"],
      ["EM_PREPARO", "atual"],
      ["PRONTO", "pendente"],
      ["SAIU_PARA_ENTREGA", "pendente"],
      ["ENTREGUE", "pendente"],
    ])
    expect(linha[1].quando).toEqual(t(10))
    expect(linha[2].quando).toBeNull()
  })

  it("inclui 'Aguardando pagamento' só para quem passou por ela (PIX)", () => {
    const pix = linhaDoTempo("RETIRADA", "AGUARDANDO_PAGAMENTO", [
      { para: "AGUARDANDO_PAGAMENTO", createdAt: t(0) },
    ])
    expect(pix[0]).toMatchObject({
      status: "AGUARDANDO_PAGAMENTO",
      estado: "atual",
    })
    expect(pix.map((e) => e.status)).not.toContain("SAIU_PARA_ENTREGA")
  })

  it("entregue aparece como concluído (CA#4)", () => {
    const linha = linhaDoTempo("RETIRADA", "ENTREGUE", [
      { para: "RECEBIDO", createdAt: t(0) },
      { para: "EM_PREPARO", createdAt: t(1) },
      { para: "PRONTO", createdAt: t(2) },
      { para: "ENTREGUE", createdAt: t(3) },
    ])
    expect(linha.every((e) => e.estado === "feito")).toBe(true)
  })

  it("cancelado encerra a linha após as etapas feitas", () => {
    const linha = linhaDoTempo("ENTREGA", "CANCELADO", [
      { para: "RECEBIDO", createdAt: t(0) },
      { para: "CANCELADO", createdAt: t(5) },
    ])
    expect(linha.map((e) => e.status)).toEqual(["RECEBIDO", "CANCELADO"])
    expect(linha[1].estado).toBe("atual")
  })
})

describe("normalizarNumeroPedido", () => {
  it("aceita variações digitadas pelo cliente", () => {
    expect(normalizarNumeroPedido("CG-000123")).toBe("CG-000123")
    expect(normalizarNumeroPedido("cg123")).toBe("CG-000123")
    expect(normalizarNumeroPedido(" 123 ")).toBe("CG-000123")
    expect(normalizarNumeroPedido("cg-0001")).toBe("CG-000001")
  })
  it("rejeita o resto", () => {
    expect(normalizarNumeroPedido("abc")).toBeNull()
    expect(normalizarNumeroPedido("")).toBeNull()
  })
})
