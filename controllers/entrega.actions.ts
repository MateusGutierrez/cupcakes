"use server"

import { buscarArea, normalizarCEP } from "@/models/domain/entrega"
import { listarAreas } from "@/models/repositories/area.repository"

export type ResultadoCEP =
  | { ok: true; area: string; freteCentavos: number }
  | { ok: false; motivo: "formato" | "fora" }

/** US-09: verifica se o CEP está na área de entrega e devolve o frete. */
export async function consultarCEP(cep: string): Promise<ResultadoCEP> {
  // O cliente já valida o formato antes de chamar (CA#3), mas o servidor não confia nisso
  if (!normalizarCEP(cep)) return { ok: false, motivo: "formato" }
  const area = buscarArea(cep, await listarAreas())
  return area
    ? { ok: true, area: area.nome, freteCentavos: area.freteCentavos }
    : { ok: false, motivo: "fora" }
}
