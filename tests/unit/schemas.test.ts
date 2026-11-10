import { describe, expect, it } from "vitest"

import { gerarSlug } from "@/models/domain/catalogo"
import { centavosParaCampo, reaisParaCentavos } from "@/models/domain/dinheiro"
import { loginSchema } from "@/models/schemas/auth.schema"
import { IMAGEM_PADRAO, produtoSchema } from "@/models/schemas/produto.schema"

const valido = {
  nome: "Red Velvet",
  descricao: "Massa aveludada de cacau",
  ingredientes: "Farinha, cacau",
  precoCentavos: "12,00",
  alergenicos: "Contém glúten",
  imagemUrl: "",
  limiteDiario: "20",
  antecedenciaHoras: "0",
  colecao: "",
}

function errosDe(dados: Record<string, unknown>) {
  const r = produtoSchema.safeParse(dados)
  return r.success ? {} : r.error.flatten().fieldErrors
}

describe("reaisParaCentavos", () => {
  it.each([
    ["12,50", 1250],
    ["12.50", 1250],
    ["R$ 12,50", 1250],
    ["1.234,56", 123456],
    ["1.234", 123400],
    ["12", 1200],
    ["0,1", 10],
  ])("%s → %i", (texto, esperado) => {
    expect(reaisParaCentavos(texto)).toBe(esperado)
  })

  it("rejeita texto que não é número", () => {
    expect(reaisParaCentavos("abc")).toBeNull()
    expect(reaisParaCentavos("")).toBeNull()
  })

  it("centavosParaCampo faz o caminho inverso", () => {
    expect(centavosParaCampo(1250)).toBe("12,50")
  })
})

describe("produtoSchema (US-16)", () => {
  it("aceita produto válido e converte tipos", () => {
    const r = produtoSchema.parse({ ...valido, vegano: "on" })
    expect(r.precoCentavos).toBe(1200)
    expect(r.limiteDiario).toBe(20)
    expect(r.vegano).toBe(true)
    expect(r.semGluten).toBe(false)
    expect(r.colecao).toBeNull()
    expect(r.imagemUrl).toBe(IMAGEM_PADRAO)
  })

  it("rejeita preço zero ou negativo (RN#33, CA#3)", () => {
    expect(
      errosDe({ ...valido, precoCentavos: "0" }).precoCentavos
    ).toBeDefined()
    expect(
      errosDe({ ...valido, precoCentavos: "-5" }).precoCentavos
    ).toBeDefined()
    expect(
      errosDe({ ...valido, precoCentavos: "abc" }).precoCentavos
    ).toBeDefined()
  })

  it("exige alergênicos (RN#13)", () => {
    expect(errosDe({ ...valido, alergenicos: "" }).alergenicos).toBeDefined()
    expect(errosDe({ ...valido, alergenicos: "   " }).alergenicos).toBeDefined()
  })

  it("aponta campos obrigatórios vazios (CA#2)", () => {
    const erros = errosDe({ ...valido, nome: "", descricao: "" })
    expect(erros.nome).toBeDefined()
    expect(erros.descricao).toBeDefined()
  })

  it("rejeita limite negativo e URL de imagem insegura", () => {
    expect(
      errosDe({ ...valido, limiteDiario: "-1" }).limiteDiario
    ).toBeDefined()
    expect(
      errosDe({ ...valido, imagemUrl: "http://x.com/a.png" }).imagemUrl
    ).toBeDefined()
    expect(
      errosDe({ ...valido, imagemUrl: "javascript:alert(1)" }).imagemUrl
    ).toBeDefined()
  })
})

describe("gerarSlug", () => {
  it("cria slug sem acentos e símbolos", () => {
    expect(gerarSlug("Morango com Champagne!")).toBe("morango-com-champagne")
    expect(gerarSlug("  Limão  Siciliano ")).toBe("limao-siciliano")
  })
})

describe("loginSchema", () => {
  it("normaliza e-mail e exige senha", () => {
    expect(
      loginSchema.parse({ email: " Admin@Cupcakes.dev ", senha: "x" }).email
    ).toBe("admin@cupcakes.dev")
    expect(
      loginSchema.safeParse({ email: "invalido", senha: "x" }).success
    ).toBe(false)
    expect(loginSchema.safeParse({ email: "a@b.com", senha: "" }).success).toBe(
      false
    )
  })
})
