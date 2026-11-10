// CEP, área de entrega e frete (US-09, RN#04, RN#17, RN#18, RN#20).

export type Area = {
  nome: string
  cepInicio: string
  cepFim: string
  freteCentavos: number
}
export type Modalidade = "ENTREGA" | "RETIRADA"

/** Remove a máscara e confere se sobram exatamente 8 dígitos. */
export function normalizarCEP(cep: string): string | null {
  const digitos = cep.replace(/\D/g, "")
  return /^\d{8}$/.test(digitos) && cep.replace(/[\d\s-]/g, "") === ""
    ? digitos
    : null
}

export function cepValido(cep: string): boolean {
  return normalizarCEP(cep) !== null
}

/** Área que atende o CEP (faixas inclusivas), ou null se fora da área. */
export function buscarArea<T extends Area>(cep: string, areas: T[]): T | null {
  const c = normalizarCEP(cep)
  if (!c) return null
  return areas.find((a) => c >= a.cepInicio && c <= a.cepFim) ?? null
}

/** RN#20: retirada não paga frete. */
export function calcularFrete(
  modalidade: Modalidade,
  area: Area | null
): number {
  if (modalidade === "RETIRADA") return 0
  if (!area) throw new Error("CEP fora da área de entrega")
  return area.freteCentavos
}
