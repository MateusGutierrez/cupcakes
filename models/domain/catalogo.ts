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

/** Aplica filtro por selo e busca textual (nome, descrição ou ingredientes). */
export function filtrarCatalogo<T extends Pesquisavel>(
  produtos: T[],
  { selo, busca }: { selo?: Selo; busca?: string }
): T[] {
  const termo = busca ? normalizar(busca) : ""
  return produtos.filter((p) => {
    if (selo && !p[selo]) return false
    if (!termo) return true
    return normalizar(`${p.nome} ${p.descricao} ${p.ingredientes}`).includes(
      termo
    )
  })
}

/** "Morango com Champagne!" → "morango-com-champagne" */
export function gerarSlug(nome: string): string {
  return normalizar(nome)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
