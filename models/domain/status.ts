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

export type EtapaLinhaDoTempo = {
  status: StatusPedido
  rotulo: string
  /** Quando o pedido entrou nesta etapa (do histórico), se já entrou. */
  quando: Date | null
  estado: "feito" | "atual" | "pendente"
}

/**
 * Monta a linha do tempo do pedido (US-13 CA#1) a partir do histórico (RN#27).
 * Pedidos pagos na hora não passam por "Aguardando pagamento", então essa etapa
 * só aparece quando consta no histórico. Cancelado encerra a linha.
 */
export function linhaDoTempo(
  modalidade: Modalidade,
  status: StatusPedido,
  historico: { para: StatusPedido; createdAt: Date }[]
): EtapaLinhaDoTempo[] {
  const quando = new Map<StatusPedido, Date>()
  for (const h of historico) quando.set(h.para, h.createdAt)

  let etapas = etapasDoPedido(modalidade)
  if (!quando.has("AGUARDANDO_PAGAMENTO"))
    etapas = etapas.filter((e) => e !== "AGUARDANDO_PAGAMENTO")

  if (status === "CANCELADO") {
    const feitas = etapas.filter((e) => quando.has(e))
    return [
      ...feitas.map((e) => ({
        status: e,
        rotulo: ROTULO_STATUS[e],
        quando: quando.get(e)!,
        estado: "feito" as const,
      })),
      {
        status: "CANCELADO",
        rotulo: ROTULO_STATUS.CANCELADO,
        quando: quando.get("CANCELADO") ?? null,
        estado: "atual",
      },
    ]
  }

  const atual = etapas.indexOf(status)
  return etapas.map((e, i) => ({
    status: e,
    rotulo: ROTULO_STATUS[e],
    quando: i <= atual ? (quando.get(e) ?? null) : null,
    // Entregue é o fim: aparece como concluído (US-13 CA#4)
    estado:
      i < atual || (i === atual && e === "ENTREGUE")
        ? "feito"
        : i === atual
          ? "atual"
          : "pendente",
  }))
}

/** Normaliza o que o cliente digita: "123", "cg123", "CG-000123" → "CG-000123". */
export function normalizarNumeroPedido(texto: string): string | null {
  const m = /^\s*(?:cg)?[\s-]*0*(\d{1,9})\s*$/i.exec(texto)
  return m ? gerarNumeroPedido(Number(m[1])) : null
}
