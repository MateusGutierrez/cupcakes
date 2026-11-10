import { describe, expect, it } from "vitest"

import {
  correspondeBusca,
  distanciaLevenshtein,
  filtrarCatalogo,
  isSelo,
  normalizar,
  selosDoProduto,
} from "@/models/domain/catalogo"

const base = {
  descricao: "",
  ingredientes: "",
  semGluten: false,
  semLactose: false,
  vegano: false,
}
const produtos = [
  { ...base, nome: "Limão Siciliano", ingredientes: "limão, açúcar" },
  { ...base, nome: "Coco Vegano", vegano: true, semLactose: true },
  {
    ...base,
    nome: "Banana com Canela",
    semGluten: true,
    descricao: "Farinha de arroz",
  },
]

describe("normalizar", () => {
  it("remove acentos, maiúsculas e espaços extras", () => {
    expect(normalizar("  Limão   SICILIANO ")).toBe("limao siciliano")
    expect(normalizar("Pão de Açúcar")).toBe("pao de acucar")
  })
})

describe("filtrarCatalogo", () => {
  it("busca ignora acentos e maiúsculas (US-05)", () => {
    expect(
      filtrarCatalogo(produtos, { busca: "LIMAO" }).map((p) => p.nome)
    ).toEqual(["Limão Siciliano"])
  })

  it("busca também na descrição e nos ingredientes", () => {
    expect(filtrarCatalogo(produtos, { busca: "arroz" })).toHaveLength(1)
    expect(filtrarCatalogo(produtos, { busca: "acucar" })).toHaveLength(1)
  })

  it("sem resultado retorna lista vazia", () => {
    expect(filtrarCatalogo(produtos, { busca: "pistache" })).toEqual([])
  })

  it("filtra por selo e combina com a busca", () => {
    expect(filtrarCatalogo(produtos, { selo: "vegano" })).toHaveLength(1)
    expect(
      filtrarCatalogo(produtos, { selo: "semLactose", busca: "banana" })
    ).toEqual([])
  })

  it("sem filtros retorna tudo", () => {
    expect(filtrarCatalogo(produtos, {})).toHaveLength(3)
  })
})

describe("selos", () => {
  it("lista os rótulos que o produto possui", () => {
    expect(selosDoProduto(produtos[1])).toEqual(["Sem lactose", "Vegano"])
    expect(selosDoProduto(produtos[0])).toEqual([])
  })

  it("isSelo valida valores vindos da URL", () => {
    expect(isSelo("vegano")).toBe(true)
    expect(isSelo("picante")).toBe(false)
    expect(isSelo(undefined)).toBe(false)
  })
})

describe("busca tolerante a erro de digitação (US-05)", () => {
  it("distância de Levenshtein", () => {
    expect(distanciaLevenshtein("pistache", "pistache")).toBe(0)
    expect(distanciaLevenshtein("pistaxe", "pistache")).toBe(2)
    expect(distanciaLevenshtein("pistace", "pistache")).toBe(1)
    expect(distanciaLevenshtein("", "abc")).toBe(3)
  })

  it("aceita uma letra errada em palavras com 4+ letras", () => {
    expect(filtrarCatalogo(produtos, { busca: "limai" })).toHaveLength(1) // limão
    expect(filtrarCatalogo(produtos, { busca: "banan" })).toHaveLength(1) // prefixo
    expect(filtrarCatalogo(produtos, { busca: "canella" })).toHaveLength(1) // letra a mais
  })

  it("todas as palavras precisam corresponder", () => {
    expect(filtrarCatalogo(produtos, { busca: "coco vegano" })).toHaveLength(1)
    expect(filtrarCatalogo(produtos, { busca: "coco pistache" })).toEqual([])
  })

  it("palavras curtas não usam tolerância (evita falso positivo)", () => {
    expect(correspondeBusca("cox", "coco vegano")).toBe(false)
  })
})
