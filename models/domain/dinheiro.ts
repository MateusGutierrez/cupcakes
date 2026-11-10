/**
 * Converte um valor digitado em reais para centavos.
 * Aceita "12,50", "12.50", "R$ 12,50", "1.234,56", "12". Retorna null se não for número.
 */
export function reaisParaCentavos(texto: string): number | null {
  let limpo = texto.replace(/R\$|\s/g, "")
  if (!/^-?[\d.,]+$/.test(limpo)) return null

  const ultimaVirgula = limpo.lastIndexOf(",")
  const ultimoPonto = limpo.lastIndexOf(".")
  if (ultimaVirgula > ultimoPonto) {
    // Formato brasileiro: ponto é milhar, vírgula é decimal
    limpo = limpo.replace(/\./g, "").replace(",", ".")
  } else if (
    ultimoPonto > -1 &&
    limpo.length - ultimoPonto - 1 === 3 &&
    ultimaVirgula === -1
  ) {
    // "1.234" → milhar
    limpo = limpo.replace(/\./g, "")
  } else {
    limpo = limpo.replace(/,/g, "")
  }

  const valor = Number(limpo)
  if (!Number.isFinite(valor)) return null
  return Math.round(valor * 100)
}

/** 1250 → "12,50" (para preencher o campo de preço na edição) */
export function centavosParaCampo(centavos: number): string {
  return (centavos / 100).toFixed(2).replace(".", ",")
}
