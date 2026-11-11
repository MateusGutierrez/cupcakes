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

/** Tamanho máximo do termo de busca (campo e servidor). */
export const BUSCA_MAX = 60

/** Lê o termo vindo da URL: só texto, sem espaços nas pontas e no máximo BUSCA_MAX letras. */
export function termoDeBusca(valor: unknown): string {
  if (typeof valor !== "string") return ""
  return valor.trim().slice(0, BUSCA_MAX).trim()
}

/** Quantas letras erradas a busca tolera numa palavra, conforme o tamanho dela. */
function tolerancia(palavra: string): number {
  if (palavra.length >= 8) return 2
  if (palavra.length >= 4) return 1
  return 0
}

/**
 * Cada palavra buscada precisa aparecer no texto (inclusive como começo de
 * palavra: "cho" → "chocolate") ou estar perto de alguma palavra dele:
 * 1 letra de diferença para palavras de 4 a 7 letras, 2 para 8 ou mais.
 * Palavras curtas não têm tolerância, para não gerar falsos positivos.
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
        (tolerancia(palavra) > 0 &&
          palavrasTexto.some(
            (p) => distanciaLevenshtein(palavra, p) <= tolerancia(palavra)
          ))
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

/**
 * "Você quis dizer…": quando a busca não acha nada, sugere até `limite`
 * produtos cujo nome mais se parece com o termo. Compara cada palavra
 * buscada (3+ letras) com as palavras do nome e com o começo delas;
 * só sugere se a diferença total for no máximo 40% das letras buscadas.
 */
export function sugerirProdutos<T extends { nome: string }>(
  termo: string,
  produtos: T[],
  limite = 3
): T[] {
  const palavras = normalizar(termo)
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length >= 3)
  if (palavras.length === 0) return []
  const letras = palavras.reduce((soma, p) => soma + p.length, 0)

  return produtos
    .map((produto) => {
      const doNome = normalizar(produto.nome)
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
      const diferenca = palavras.reduce(
        (soma, buscada) =>
          soma +
          Math.min(
            ...doNome.map((w) =>
              Math.min(
                distanciaLevenshtein(buscada, w),
                distanciaLevenshtein(buscada, w.slice(0, buscada.length))
              )
            )
          ),
        0
      )
      return { produto, nota: diferenca / letras }
    })
    .filter((s) => s.nota <= 0.4)
    .sort((a, b) => a.nota - b.nota)
    .slice(0, limite)
    .map((s) => s.produto)
}

/** "Morango com Champagne!" → "morango-com-champagne" */
export function gerarSlug(nome: string): string {
  return normalizar(nome)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
