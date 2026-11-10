// Schema do checkout, usado no formulário (cliente) e no servidor.
import { z } from "zod"

import { HORARIOS } from "@/models/domain/agenda"
import { reaisParaCentavos } from "@/models/domain/dinheiro"
import { cepValido } from "@/models/domain/entrega"
import { luhnValido, validadeOk } from "@/models/domain/pagamento"

const apenasDigitos = (v: string) => v.replace(/\D/g, "")

// RN#05: nome, e-mail e telefone obrigatórios
const contato = {
  nome: z
    .string()
    .trim()
    .min(3, { error: "Informe seu nome completo" })
    .max(80, { error: "Nome muito longo" }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Informe um e-mail válido" })),
  telefone: z
    .string()
    .transform(apenasDigitos)
    .pipe(
      z.string().regex(/^\d{10,11}$/, { error: "Informe um telefone com DDD" })
    ),
}

const agendamento = {
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Escolha uma data" }),
  horario: z.enum(HORARIOS, { error: "Escolha um horário" }),
  observacao: z
    .string()
    .trim()
    .max(300, { error: "Máximo de 300 caracteres" })
    .optional(),
}

const entrega = z.object({
  modalidade: z.literal("ENTREGA"),
  ...contato,
  ...agendamento,
  cep: z
    .string()
    .refine(cepValido, { error: "CEP inválido (use 00000-000)" })
    .transform(apenasDigitos),
  rua: z.string().trim().min(3, { error: "Informe a rua" }).max(120),
  numero: z.string().trim().min(1, { error: "Informe o número" }).max(10),
  complemento: z.string().trim().max(60).optional(),
  bairro: z.string().trim().min(2, { error: "Informe o bairro" }).max(60),
})

const retirada = z.object({
  modalidade: z.literal("RETIRADA"),
  ...contato,
  ...agendamento,
})

export const checkoutSchema = z.discriminatedUnion("modalidade", [
  entrega,
  retirada,
])

// ---- Pagamento (US-11) ----

const cartao = z.object({
  formaPagamento: z.literal("CARTAO"),
  cartaoNumero: z
    .string()
    .transform(apenasDigitos)
    .refine(luhnValido, { error: "Número de cartão inválido" }),
  cartaoNome: z
    .string()
    .trim()
    .min(3, { error: "Informe o nome impresso no cartão" })
    .max(60),
  cartaoValidade: z
    .string()
    .trim()
    .refine((v) => validadeOk(v, new Date()), {
      error: "Validade inválida ou vencida (MM/AA)",
    }),
  cartaoCvv: z.string().regex(/^\d{3,4}$/, { error: "CVV inválido" }),
})

const pix = z.object({ formaPagamento: z.literal("PIX") })

const dinheiro = z.object({
  formaPagamento: z.literal("DINHEIRO"),
  // Vazio = não precisa de troco
  trocoPara: z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (!v || v.trim() === "") return null
      const centavos = reaisParaCentavos(v)
      if (centavos === null || centavos <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Valor inválido (ex.: 100,00)",
        })
        return z.NEVER
      }
      return centavos
    }),
})

export const pagamentoSchema = z.discriminatedUnion(
  "formaPagamento",
  [cartao, pix, dinheiro],
  {
    error: "Escolha a forma de pagamento",
  }
)

/** Checkout completo: dados + entrega/retirada + pagamento. */
export const pedidoSchema = checkoutSchema.and(pagamentoSchema)

export type CheckoutEntrada = z.input<typeof checkoutSchema>
export type CheckoutDados = z.output<typeof checkoutSchema>
export type PedidoEntrada = z.input<typeof pedidoSchema>
export type PedidoDados = z.output<typeof pedidoSchema>

/** Endereço em uma linha, para gravar no pedido. */
export function enderecoCompleto(
  d: Extract<CheckoutDados, { modalidade: "ENTREGA" }>
): string {
  const complemento = d.complemento ? `, ${d.complemento}` : ""
  return `${d.rua}, ${d.numero}${complemento} — ${d.bairro}`
}
