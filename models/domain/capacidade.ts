// RN#14 — capacidade diária de produção por produto.
// disponível = limiteDiario − soma das quantidades em pedidos do dia (exceto cancelados).
import type { StatusPedido } from "@/generated/prisma/enums"

/** Status que NÃO ocupam capacidade. Pedido PIX aguardando pagamento ocupa (decisão 1.1 do plano de ação). */
export const STATUS_QUE_LIBERAM_CAPACIDADE: readonly StatusPedido[] = [
  "CANCELADO",
]

export function ocupaCapacidade(status: StatusPedido): boolean {
  return !STATUS_QUE_LIBERAM_CAPACIDADE.includes(status)
}

/** Quantas unidades ainda podem ser vendidas no dia. Nunca negativo. */
export function calcularDisponivel(
  limiteDiario: number,
  vendidos: number
): number {
  return Math.max(0, limiteDiario - vendidos)
}

export function estaIndisponivel(
  limiteDiario: number,
  vendidos: number
): boolean {
  return calcularDisponivel(limiteDiario, vendidos) === 0
}
