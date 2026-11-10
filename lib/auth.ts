import "server-only"

import { redirect } from "next/navigation"
import { cache } from "react"

import type { Papel } from "@/generated/prisma/enums"
import { buscarUsuarioPorId } from "@/models/repositories/usuario.repository"

import { lerSessao } from "./sessao"

/**
 * Usuário da equipe logado, conferido no banco (o usuário pode ter sido removido
 * depois do login). Memorizado por requisição.
 */
export const obterUsuarioLogado = cache(async () => {
  const sessao = await lerSessao()
  if (!sessao) return null
  return buscarUsuarioPorId(sessao.usuarioId)
})

/**
 * Exige sessão válida e, opcionalmente, um dos papéis (RN#34).
 * Chamar no início de TODA página e Server Action de admin — o proxy.ts sozinho não basta.
 */
export async function exigirSessao(papeis?: readonly Papel[]) {
  const usuario = await obterUsuarioLogado()
  if (!usuario) redirect("/admin/login")
  if (papeis && !papeis.includes(usuario.papel)) redirect("/admin?negado=1")
  return usuario
}

/** Página inicial do painel conforme o papel. */
export function inicioDoPapel(papel: Papel) {
  return papel === "ADMIN" ? "/admin/produtos" : "/admin/pedidos"
}
