// Máquina de estados do pedido (RN#26, RN#28).
//
// AGUARDANDO_PAGAMENTO → RECEBIDO → EM_PREPARO → PRONTO → SAIU_PARA_ENTREGA → ENTREGUE
//                                                   └─(retirada)──────────────→ ENTREGUE
// AGUARDANDO_PAGAMENTO | RECEBIDO → CANCELADO
import type { Modalidade, StatusPedido } from "@/generated/prisma/enums"

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  RECEBIDO: "Pedido recebido",
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto",
  SAIU_PARA_ENTREGA: "Saiu para entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
}

const TERMINAIS: readonly StatusPedido[] = ["ENTREGUE", "CANCELADO"]
/** RN#28 + decisão 1.3 do plano de ação: PIX não pago também pode ser cancelado. */
const CANCELAVEIS: readonly StatusPedido[] = [
  "AGUARDANDO_PAGAMENTO",
  "RECEBIDO",
]

/** Etapas na ordem, conforme a modalidade (retirada pula "Saiu para entrega"). */
export function etapasDoPedido(modalidade: Modalidade): StatusPedido[] {
  const etapas: StatusPedido[] = [
    "AGUARDANDO_PAGAMENTO",
    "RECEBIDO",
    "EM_PREPARO",
    "PRONTO",
  ]
  if (modalidade === "ENTREGA") etapas.push("SAIU_PARA_ENTREGA")
  etapas.push("ENTREGUE")
  return etapas
}

export function ehTerminal(status: StatusPedido): boolean {
  return TERMINAIS.includes(status)
}

export function podeCancelar(status: StatusPedido): boolean {
  return CANCELAVEIS.includes(status)
}

/** Próxima etapa do fluxo normal, ou null se não houver. */
export function proximoStatus(
  status: StatusPedido,
  modalidade: Modalidade
): StatusPedido | null {
  if (ehTerminal(status)) return null
  const etapas = etapasDoPedido(modalidade)
  const i = etapas.indexOf(status)
  return i >= 0 && i < etapas.length - 1 ? etapas[i + 1] : null
}

/** Só permite avançar uma etapa por vez, ou cancelar quando ainda é permitido. */
export function podeTransicionar(
  de: StatusPedido,
  para: StatusPedido,
  modalidade: Modalidade
): boolean {
  if (para === "CANCELADO") return podeCancelar(de)
  return proximoStatus(de, modalidade) === para
}

/** Número legível e único derivado do id (RN#24): 123 → "CG-000123". */
export function gerarNumeroPedido(id: number): string {
  return `CG-${String(id).padStart(6, "0")}`
}
