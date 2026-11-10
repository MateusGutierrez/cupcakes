// Textos exibidos ao cliente para valores do banco.
import type {
  FormaPagamento,
  Modalidade,
  StatusPagamento,
} from "@/generated/prisma/enums"

export const ROTULO_FORMA_PAGAMENTO: Record<FormaPagamento, string> = {
  CARTAO: "Cartão de crédito",
  PIX: "PIX",
  DINHEIRO: "Dinheiro",
}

export const ROTULO_STATUS_PAGAMENTO: Record<StatusPagamento, string> = {
  PENDENTE: "Aguardando pagamento",
  APROVADO: "Aprovado",
  NA_ENTREGA: "Pagar na entrega/retirada",
  ESTORNADO: "Estornado",
}

export const ROTULO_MODALIDADE: Record<Modalidade, string> = {
  ENTREGA: "Entrega",
  RETIRADA: "Retirada na loja",
}
