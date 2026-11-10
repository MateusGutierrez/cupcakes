import "server-only"

import { cookies } from "next/headers"

import {
  assinarSessao,
  COOKIE_SESSAO,
  type DadosSessao,
  DURACAO_SESSAO_MS,
  verificarSessao,
} from "./sessao-token"

/** Cria o cookie de sessão: HttpOnly + SameSite=Lax (adaptação da RNF#10). */
export async function criarSessao(dados: DadosSessao) {
  const expiraEm = new Date(Date.now() + DURACAO_SESSAO_MS)
  const token = await assinarSessao(dados, expiraEm)
  ;(await cookies()).set(COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiraEm,
  })
}

export async function lerSessao() {
  return verificarSessao((await cookies()).get(COOKIE_SESSAO)?.value)
}

export async function encerrarSessao() {
  ;(await cookies()).delete(COOKIE_SESSAO)
}
