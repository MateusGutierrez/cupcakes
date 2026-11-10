import type { z } from "zod"

/** Estado devolvido pelas Server Actions de formulário (usado com useActionState). */
export type EstadoAcao = {
  ok: boolean
  mensagem?: string
  /** Erros por campo, para destacar o input (ex.: { email: ["E-mail inválido"] }) */
  erros?: Record<string, string[] | undefined>
}

export const ESTADO_INICIAL: EstadoAcao = { ok: false }

export function errosDoZod(erro: z.ZodError): EstadoAcao {
  const { fieldErrors, formErrors } = (
    erro as z.ZodError<Record<string, unknown>>
  ).flatten()
  return {
    ok: false,
    mensagem: formErrors[0] ?? "Revise os campos destacados.",
    erros: fieldErrors as Record<string, string[] | undefined>,
  }
}
