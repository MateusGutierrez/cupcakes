// Regras da vitrine: selos de restrição (RN#09), filtro e busca (RN#12).

export const SELOS = [
  { chave: "semGluten", rotulo: "Sem glúten" },
  { chave: "semLactose", rotulo: "Sem lactose" },
  { chave: "vegano", rotulo: "Vegano" },
] as const

export type Selo = (typeof SELOS)[number]["chave"]

type ComSelos = Record<Selo, boolean>

export function isSelo(valor: unknown): valor is Selo {
  return SELOS.some((s) => s.chave === valor)
}

/** Rótulos dos selos que o produto possui, na ordem de SELOS. */
export function selosDoProduto(produto: ComSelos): string[] {
  return SELOS.filter((s) => produto[s.chave]).map((s) => s.rotulo)
}

/** "Limão Siciliano" → "limao siciliano" (sem acentos, minúsculas, espaços normalizados). */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

type Pesquisavel = ComSelos & {
  nome: string
  descricao: string
  ingredientes: string
}

/** Distância de edição (inserções, remoções e trocas) entre duas palavras. */
export function distanciaLevenshtein(a: string, b: string): number {
  const anterior = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diagonal = anterior[0]
    anterior[0] = i
    for (let j = 1; j <= b.length; j++) {
      const acima = anterior[j]
      anterior[j] = Math.min(
        anterior[j] + 1,
        anterior[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
      diagonal = acima
    }
  }
  return anterior[b.length]
}

/**
 * Cada palavra buscada precisa aparecer no texto, ou estar a 1 letra de
 * distância de alguma palavra dele (tolerância a erro de digitação, só para
 * palavras com 4+ letras, para não gerar falsos positivos).
 */
export function correspondeBusca(
  termoNormalizado: string,
  textoNormalizado: string
): boolean {
  const palavrasTexto = textoNormalizado.split(/[^a-z0-9]+/).filter(Boolean)
  return termoNormalizado
    .split(" ")
    .filter(Boolean)
    .every(
      (palavra) =>
        textoNormalizado.includes(palavra) ||
        (palavra.length >= 4 &&
          palavrasTexto.some((p) => distanciaLevenshtein(palavra, p) <= 1))
    )
}

/** Aplica filtro por selo e busca textual (nome, descrição ou ingredientes). */
export function filtrarCatalogo<T extends Pesquisavel>(
  produtos: T[],
  { selo, busca }: { selo?: Selo; busca?: string }
): T[] {
  const termo = busca ? normalizar(busca) : ""
  return produtos.filter((p) => {
    if (selo && !p[selo]) return false
    if (!termo) return true
    return correspondeBusca(
      termo,
      normalizar(`${p.nome} ${p.descricao} ${p.ingredientes}`)
    )
  })
}

/** "Morango com Champagne!" → "morango-com-champagne" */
export function gerarSlug(nome: string): string {
  return normalizar(nome)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
