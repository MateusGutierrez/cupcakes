import "server-only"

import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

import { chave } from "./sessao-token"

// Convidado não tem login: quem fez (ou consultou com número + e-mail) o pedido
// recebe um cookie assinado com os números que pode ver.
const COOKIE = "cg_pedidos"
const AUDIENCIA = "acesso-pedido"
const MAX_PEDIDOS = 10
const DURACAO_DIAS = 30

async function lerNumeros(): Promise<string[]> {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return []
  try {
    const { payload } = await jwtVerify<{ numeros: string[] }>(token, chave(), {
      audience: AUDIENCIA,
    })
    return Array.isArray(payload.numeros) ? payload.numeros : []
  } catch {
    return []
  }
}

export async function temAcessoAoPedido(numero: string): Promise<boolean> {
  return (await lerNumeros()).includes(numero)
}

export async function concederAcessoAoPedido(numero: string) {
  const numeros = [
    numero,
    ...(await lerNumeros()).filter((n) => n !== numero),
  ].slice(0, MAX_PEDIDOS)
  const expira = new Date(Date.now() + DURACAO_DIAS * 24 * 60 * 60 * 1000)
  const token = await new SignJWT({ numeros })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(AUDIENCIA)
    .setExpirationTime(expira)
    .sign(chave())
  ;(await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expira,
  })
}
