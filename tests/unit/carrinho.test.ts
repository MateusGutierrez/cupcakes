import { describe, expect, it } from "vitest"

import {
  adicionarItem,
  alterarQuantidade,
  calcularTotais,
  type ItemCarrinho,
  maiorAntecedencia,
  reconciliarCarrinho,
  removerItem,
} from "@/models/domain/carrinho"

const produto = (
  id: number,
  preco = 1000,
  maximo = 10,
  antecedenciaHoras = 0
) => ({
  produtoId: id,
  slug: `p${id}`,
  nome: `Produto ${id}`,
  precoCentavos: preco,
  imagemUrl: "/x.svg",
  maximo,
  antecedenciaHoras,
})

describe("adicionarItem (US-07)", () => {
  it("adiciona item novo", () => {
    const r = adicionarItem([], produto(1), 2)
    expect(r.itens).toHaveLength(1)
    expect(r.itens[0].quantidade).toBe(2)
    expect(r.limitado).toBe(false)
  })

  it("produto repetido soma a quantidade em vez de duplicar (CA#4)", () => {
    const { itens } = adicionarItem([], produto(1), 2)
    const r = adicionarItem(itens, produto(1), 3)
    expect(r.itens).toHaveLength(1)
    expect(r.itens[0].quantidade).toBe(5)
  })

  it("respeita o teto da capacidade e avisa (CA#3, RN#14)", () => {
    const { itens } = adicionarItem([], produto(1, 1000, 4), 3)
    const r = adicionarItem(itens, produto(1, 1000, 4), 3)
    expect(r.itens[0].quantidade).toBe(4)
    expect(r.limitado).toBe(true)
  })

  it("não adiciona produto com capacidade 0", () => {
    const r = adicionarItem([], produto(1, 1000, 0), 1)
    expect(r.itens).toEqual([])
    expect(r.limitado).toBe(true)
  })
})

describe("alterarQuantidade (US-08)", () => {
  const base = adicionarItem([], produto(1, 1000, 5), 2).itens

  it("altera a quantidade", () => {
    expect(alterarQuantidade(base, 1, 3).itens[0].quantidade).toBe(3)
  })

  it("quantidade 0 remove o item (CA#3)", () => {
    expect(alterarQuantidade(base, 1, 0).itens).toEqual([])
  })

  it("limita ao teto", () => {
    const r = alterarQuantidade(base, 1, 9)
    expect(r.itens[0].quantidade).toBe(5)
    expect(r.limitado).toBe(true)
  })

  it("removerItem tira só o produto indicado", () => {
    const dois = adicionarItem(base, produto(2), 1).itens
    expect(removerItem(dois, 1).map((i) => i.produtoId)).toEqual([2])
  })
})

describe("calcularTotais (RN#16)", () => {
  const itens: ItemCarrinho[] = [
    { ...produto(1, 1200), quantidade: 2 },
    { ...produto(2, 1000), quantidade: 3 },
  ]

  it("total = Σ subtotais + frete", () => {
    expect(calcularTotais(itens, 800)).toEqual({
      quantidade: 5,
      subtotalCentavos: 5400,
      freteCentavos: 800,
      totalCentavos: 6200,
    })
  })

  it("carrinho vazio zera tudo", () => {
    expect(calcularTotais([]).totalCentavos).toBe(0)
  })

  it("maiorAntecedencia pega o maior valor", () => {
    expect(maiorAntecedencia([produto(1, 1, 1, 0), produto(2, 1, 1, 48)])).toBe(
      48
    )
    expect(maiorAntecedencia([])).toBe(0)
  })
})

describe("reconciliarCarrinho (revalidação no servidor)", () => {
  const item = (
    id: number,
    preco: number,
    quantidade: number
  ): ItemCarrinho => ({
    ...produto(id, preco),
    quantidade,
  })
  const atual = (
    id: number,
    preco: number,
    disponivelHoje: number,
    antecedenciaHoras = 0
  ) => ({
    id,
    slug: `p${id}`,
    nome: `Produto ${id}`,
    precoCentavos: preco,
    imagemUrl: "/x.svg",
    antecedenciaHoras,
    limiteDiario: 20,
    disponivelHoje,
  })

  it("mantém itens sem mudança e sem avisos", () => {
    const r = reconciliarCarrinho([item(1, 1000, 2)], [atual(1, 1000, 10)])
    expect(r.itens[0].quantidade).toBe(2)
    expect(r.avisos).toEqual([])
  })

  it("remove produto que saiu do cardápio", () => {
    const r = reconciliarCarrinho([item(1, 1000, 2)], [])
    expect(r.itens).toEqual([])
    expect(r.avisos[0]).toMatch(/saiu do cardápio/)
  })

  it("atualiza preço e avisa", () => {
    const r = reconciliarCarrinho([item(1, 1000, 1)], [atual(1, 1200, 10)])
    expect(r.itens[0].precoCentavos).toBe(1200)
    expect(r.avisos[0]).toMatch(/preço/)
  })

  it("reduz quantidade à capacidade atual", () => {
    const r = reconciliarCarrinho([item(1, 1000, 5)], [atual(1, 1000, 3)])
    expect(r.itens[0].quantidade).toBe(3)
    expect(r.itens[0].maximo).toBe(3)
  })

  it("produto sob encomenda usa o limite diário, não a produção de hoje", () => {
    const r = reconciliarCarrinho([item(1, 1000, 5)], [atual(1, 1000, 0, 48)])
    expect(r.itens[0].quantidade).toBe(5)
    expect(r.itens[0].maximo).toBe(20)
  })

  it("remove produto esgotado hoje", () => {
    const r = reconciliarCarrinho([item(1, 1000, 1)], [atual(1, 1000, 0)])
    expect(r.itens).toEqual([])
    expect(r.avisos[0]).toMatch(/esgotou/)
  })
})
