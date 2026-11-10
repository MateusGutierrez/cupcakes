// Regras do carrinho (US-07, US-08, RN#14, RN#16). Funções puras: o store só as chama.

export type ItemCarrinho = {
  produtoId: number
  slug: string
  nome: string
  precoCentavos: number
  imagemUrl: string
  quantidade: number
  /** Teto de unidades (capacidade disponível quando o item foi adicionado/revalidado). */
  maximo: number
  antecedenciaHoras: number
}

export type ResultadoCarrinho = {
  itens: ItemCarrinho[]
  /** true quando a quantidade pedida foi reduzida para caber no teto (RN#14). */
  limitado: boolean
}

function limitar(quantidade: number, maximo: number) {
  const final = Math.max(0, Math.min(quantidade, maximo))
  return { final, limitado: final < quantidade }
}

/** Adiciona; se o produto já estiver no carrinho, soma a quantidade (US-07 CA#4). */
export function adicionarItem(
  itens: ItemCarrinho[],
  novo: Omit<ItemCarrinho, "quantidade">,
  quantidade: number
): ResultadoCarrinho {
  const existente = itens.find((i) => i.produtoId === novo.produtoId)
  const desejada = (existente?.quantidade ?? 0) + quantidade
  const { final, limitado } = limitar(desejada, novo.maximo)

  if (final === 0) return { itens, limitado: true }
  if (existente) {
    return {
      itens: itens.map((i) =>
        i.produtoId === novo.produtoId
          ? { ...i, ...novo, quantidade: final }
          : i
      ),
      limitado,
    }
  }
  return { itens: [...itens, { ...novo, quantidade: final }], limitado }
}

/** Altera a quantidade; 0 ou menos remove o item (US-08 CA#3). */
export function alterarQuantidade(
  itens: ItemCarrinho[],
  produtoId: number,
  quantidade: number
): ResultadoCarrinho {
  if (quantidade <= 0)
    return { itens: removerItem(itens, produtoId), limitado: false }
  let limitado = false
  const novos = itens.map((i) => {
    if (i.produtoId !== produtoId) return i
    const r = limitar(quantidade, i.maximo)
    limitado = r.limitado
    return { ...i, quantidade: r.final }
  })
  return { itens: novos.filter((i) => i.quantidade > 0), limitado }
}

export function removerItem(
  itens: ItemCarrinho[],
  produtoId: number
): ItemCarrinho[] {
  return itens.filter((i) => i.produtoId !== produtoId)
}

export type Totais = {
  quantidade: number
  subtotalCentavos: number
  freteCentavos: number
  totalCentavos: number
}

/** RN#16: total = soma dos subtotais + frete. */
export function calcularTotais(
  itens: Pick<ItemCarrinho, "precoCentavos" | "quantidade">[],
  freteCentavos = 0
): Totais {
  const subtotalCentavos = itens.reduce(
    (s, i) => s + i.precoCentavos * i.quantidade,
    0
  )
  return {
    quantidade: itens.reduce((s, i) => s + i.quantidade, 0),
    subtotalCentavos,
    freteCentavos,
    totalCentavos: subtotalCentavos + freteCentavos,
  }
}

/** A maior antecedência entre os itens define a primeira data possível (RN#19). */
export function maiorAntecedencia(
  itens: Pick<ItemCarrinho, "antecedenciaHoras">[]
): number {
  return itens.reduce((m, i) => Math.max(m, i.antecedenciaHoras), 0)
}

/**
 * Teto de unidades no carrinho. Produtos sob encomenda não dependem da produção
 * de hoje, então o teto é o limite diário; a capacidade da data escolhida é
 * conferida de novo ao finalizar o pedido.
 */
export function maximoNoCarrinho(produto: {
  antecedenciaHoras: number
  limiteDiario: number
  disponivelHoje: number
}): number {
  return produto.antecedenciaHoras > 0
    ? produto.limiteDiario
    : produto.disponivelHoje
}

export type ProdutoAtual = {
  id: number
  slug: string
  nome: string
  precoCentavos: number
  imagemUrl: string
  antecedenciaHoras: number
  limiteDiario: number
  disponivelHoje: number
}

/**
 * Atualiza o carrinho local com os dados atuais do servidor (preço, capacidade,
 * produtos que saíram do cardápio) e gera avisos para o cliente.
 */
export function reconciliarCarrinho(
  itens: ItemCarrinho[],
  atuais: ProdutoAtual[]
): { itens: ItemCarrinho[]; avisos: string[] } {
  const porId = new Map(atuais.map((p) => [p.id, p]))
  const avisos: string[] = []
  const novos: ItemCarrinho[] = []

  for (const item of itens) {
    const p = porId.get(item.produtoId)
    if (!p) {
      avisos.push(`${item.nome} saiu do cardápio e foi removido.`)
      continue
    }
    const maximo = maximoNoCarrinho(p)
    if (maximo === 0) {
      avisos.push(`${p.nome} esgotou hoje e foi removido.`)
      continue
    }
    if (p.precoCentavos !== item.precoCentavos) {
      avisos.push(`O preço de ${p.nome} foi atualizado.`)
    }
    const quantidade = Math.min(item.quantidade, maximo)
    if (quantidade < item.quantidade) {
      avisos.push(
        `${p.nome}: só ${maximo} unidade(s) disponíveis; ajustamos a quantidade.`
      )
    }
    novos.push({
      produtoId: p.id,
      slug: p.slug,
      nome: p.nome,
      precoCentavos: p.precoCentavos,
      imagemUrl: p.imagemUrl,
      antecedenciaHoras: p.antecedenciaHoras,
      maximo,
      quantidade,
    })
  }
  return { itens: novos, avisos }
}
