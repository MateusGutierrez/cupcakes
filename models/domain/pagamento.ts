// Simulador de pagamento (US-11, RN#21, RN#22, RN#23). Nenhum dado de cartão é guardado
// além dos 4 últimos dígitos (RNF#20). Projeto acadêmico: não há gateway real.
import type { StatusPagamento, StatusPedido } from "@/generated/prisma/enums"

export const CARTAO_APROVADO_EXEMPLO = "4111 1111 1111 1111"
export const CARTAO_RECUSADO_EXEMPLO = "4000 0000 0000 0002"
/** Cartões que terminam assim são recusados pela "operadora" simulada. */
export const FINAL_RECUSADO = "0002"

/** Algoritmo de Luhn (dígito verificador de cartões). */
export function luhnValido(numero: string): boolean {
  const d = numero.replace(/\D/g, "")
  if (d.length < 13 || d.length > 19) return false
  let soma = 0
  let dobrar = false
  for (let i = d.length - 1; i >= 0; i--) {
    let x = Number(d[i])
    if (dobrar) {
      x *= 2
      if (x > 9) x -= 9
    }
    soma += x
    dobrar = !dobrar
  }
  return soma % 10 === 0
}

/** "MM/AA" ainda não vencido em relação a `agora`. */
export function validadeOk(validade: string, agora: Date): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(validade)
  if (!m) return false
  const mes = Number(m[1])
  const ano = 2000 + Number(m[2])
  if (mes < 1 || mes > 12) return false
  // Válido até o último dia do mês
  return new Date(ano, mes, 1) > agora
}

export type DadosPagamento =
  | { formaPagamento: "CARTAO"; cartaoNumero: string }
  | { formaPagamento: "PIX" }
  | { formaPagamento: "DINHEIRO"; trocoParaCentavos: number | null }

export type ResultadoPagamento =
  | {
      aprovado: true
      statusPagamento: StatusPagamento
      statusPedido: StatusPedido
      cartaoFinal: string | null
      trocoParaCentavos: number | null
    }
  | { aprovado: false; motivo: string }

/** Decide o resultado do pagamento. O formato dos dados já foi validado pelo schema. */
export function processarPagamento(
  dados: DadosPagamento,
  totalCentavos: number
): ResultadoPagamento {
  switch (dados.formaPagamento) {
    case "CARTAO": {
      const digitos = dados.cartaoNumero.replace(/\D/g, "")
      if (!luhnValido(digitos))
        return { aprovado: false, motivo: "Número de cartão inválido." }
      const final = digitos.slice(-4)
      if (final === FINAL_RECUSADO) {
        return {
          aprovado: false,
          motivo:
            "Pagamento recusado pela operadora do cartão. Tente outro cartão ou outra forma de pagamento.",
        }
      }
      return {
        aprovado: true,
        statusPagamento: "APROVADO",
        statusPedido: "RECEBIDO",
        cartaoFinal: final,
        trocoParaCentavos: null,
      }
    }
    case "PIX":
      // RN#21: o pedido só vai para a cozinha depois que o PIX é confirmado
      return {
        aprovado: true,
        statusPagamento: "PENDENTE",
        statusPedido: "AGUARDANDO_PAGAMENTO",
        cartaoFinal: null,
        trocoParaCentavos: null,
      }
    case "DINHEIRO":
      if (
        dados.trocoParaCentavos !== null &&
        dados.trocoParaCentavos < totalCentavos
      ) {
        return {
          aprovado: false,
          motivo: "O valor para troco deve ser maior ou igual ao total.",
        }
      }
      // RN#22: pago na entrega/retirada
      return {
        aprovado: true,
        statusPagamento: "NA_ENTREGA",
        statusPedido: "RECEBIDO",
        cartaoFinal: null,
        trocoParaCentavos: dados.trocoParaCentavos,
      }
  }
}

/** Código "copia e cola" fictício (não é um BR Code válido). */
export function pixCopiaECola(
  numeroPedido: string,
  totalCentavos: number
): string {
  const valor = (totalCentavos / 100).toFixed(2)
  return `00020126DEMO0014BR.GOV.BCB.PIX0114CUPCAKESGOURMET5204000053039865406${valor}5802BR5916CUPCAKES GOURMET6009SAO PAULO62${numeroPedido.length + 4}05${numeroPedido}6304DEMO`
}
