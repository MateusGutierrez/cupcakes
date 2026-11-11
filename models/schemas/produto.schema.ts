import { z } from "zod"

import { reaisParaCentavos } from "@/models/domain/dinheiro"

// Checkbox/switch de formulário HTML: "on" quando marcado, ausente quando não
const marcado = z.preprocess(
  (v) => v === "on" || v === "true" || v === true,
  z.boolean()
)

const textoOpcional = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z.string().trim().max(60).nullable().default(null)
)

const inteiro = (min: number, max: number, rotulo: string) =>
  z.coerce
    .number({ error: `${rotulo}: informe um número` })
    .int({ error: `${rotulo}: use um número inteiro` })
    .min(min, { error: `${rotulo}: mínimo ${min}` })
    .max(max, { error: `${rotulo}: máximo ${max}` })

export const IMAGEM_PADRAO = "/produtos/padrao.webp"

export const produtoSchema = z.object({
  nome: z.string().trim().min(2, { error: "Informe o nome" }).max(80),
  descricao: z
    .string()
    .trim()
    .min(10, { error: "Descreva o produto (mín. 10 caracteres)" })
    .max(500),
  ingredientes: z
    .string()
    .trim()
    .min(3, { error: "Informe os ingredientes" })
    .max(500),
  // RN#33: preço maior que zero
  precoCentavos: z
    .string({ error: "Informe o preço" })
    .transform((texto, ctx) => {
      const centavos = reaisParaCentavos(texto)
      if (centavos === null) {
        ctx.addIssue({ code: "custom", message: "Preço inválido (ex.: 12,50)" })
        return z.NEVER
      }
      return centavos
    })
    .pipe(z.number().positive({ error: "O preço deve ser maior que zero" })),
  // RN#13: alergênicos obrigatórios
  alergenicos: z
    .string()
    .trim()
    .min(3, { error: "Informe os alergênicos (ou “Não contém alergênicos”)" })
    .max(300),
  imagemUrl: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? IMAGEM_PADRAO : v),
    z
      .string()
      .trim()
      .refine((url) => url.startsWith("/") || url.startsWith("https://"), {
        error: "Use um caminho local (/produtos/...) ou uma URL https://",
      })
  ),
  semGluten: marcado,
  semLactose: marcado,
  vegano: marcado,
  destaque: marcado,
  limiteDiario: inteiro(0, 1000, "Limite diário"),
  antecedenciaHoras: inteiro(0, 720, "Antecedência"),
  colecao: textoOpcional,
})

export type ProdutoInput = z.output<typeof produtoSchema>
