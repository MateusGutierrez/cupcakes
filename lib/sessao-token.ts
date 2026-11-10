// Assinatura/verificação do token de sessão. Sem dependências do Next,
// para poder ser usado tanto no proxy.ts quanto em Server Components.
import { jwtVerify, SignJWT } from "jose"

import type { Papel } from "@/generated/prisma/enums"

export const COOKIE_SESSAO = "cg_sessao"
export const DURACAO_SESSAO_MS = 8 * 60 * 60 * 1000 // um turno de trabalho

export type DadosSessao = { usuarioId: number; papel: Papel; nome: string }

/** Chave HMAC derivada de SESSION_SECRET (também usada no cookie de acesso a pedidos). */
export function chave() {
  const segredo = process.env.SESSION_SECRET
  if (!segredo || segredo.length < 32) {
    throw new Error(
      "SESSION_SECRET ausente ou curta demais (mín. 32 caracteres)"
    )
  }
  return new TextEncoder().encode(segredo)
}

export function assinarSessao(dados: DadosSessao, expiraEm: Date) {
  return new SignJWT(dados)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiraEm)
    .sign(chave())
}

export async function verificarSessao(
  token: string | undefined
): Promise<DadosSessao | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify<DadosSessao>(token, chave(), {
      algorithms: ["HS256"],
    })
    return {
      usuarioId: payload.usuarioId,
      papel: payload.papel,
      nome: payload.nome,
    }
  } catch {
    return null
  }
}
