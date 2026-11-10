import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Informe um e-mail válido" })),
  senha: z.string().min(1, { error: "Informe a senha" }),
})
