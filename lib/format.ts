// Formatação para a View. Regras de negócio não ficam aqui.

export const FUSO_LOJA = "America/Sao_Paulo"

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

/** 1250 → "R$ 12,50" */
export function formatBRL(centavos: number): string {
  return brl.format(centavos / 100)
}

/** Remove tudo que não for dígito. */
export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "")
}

/** "01310100" → "01310-100" (aceita entrada parcial, útil para máscara) */
export function formatCEP(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

/** "11987654321" → "(11) 98765-4321" (aceita entrada parcial) */
export function formatTelefone(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ""
  const ddd = d.slice(0, 2)
  const resto = d.slice(2)
  const corte = d.length === 11 ? 5 : 4
  if (resto.length <= corte) return `(${ddd}) ${resto}`
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`
}

/** Data no fuso da loja. estilo "curta" → "10/11/2026"; "longa" → "terça-feira, 10 de novembro" */
export function formatData(
  data: Date,
  estilo: "curta" | "longa" = "curta"
): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_LOJA,
    ...(estilo === "curta"
      ? { day: "2-digit", month: "2-digit", year: "numeric" }
      : { weekday: "long", day: "numeric", month: "long" }),
  }).format(data)
}

/** "10/11/2026 14:30" no fuso da loja */
export function formatDataHora(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_LOJA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(data)
    .replace(",", "")
}

/** Dia do calendário da loja ("AAAA-MM-DD") em que um instante cai. */
export function diaLocal(data: Date): string {
  // en-CA formata como AAAA-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_LOJA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(data)
}

/**
 * Início (inclusivo) e fim (exclusivo) de um dia da loja, em UTC, para consultas no banco.
 * O Brasil não tem horário de verão desde 2019, então o fuso é fixo em -03:00.
 */
export function intervaloDoDia(dia: string): { inicio: Date; fim: Date } {
  const inicio = new Date(`${dia}T00:00:00-03:00`)
  const fim = new Date(inicio.getTime() + 24 * 60 * 60 * 1000)
  return { inicio, fim }
}
