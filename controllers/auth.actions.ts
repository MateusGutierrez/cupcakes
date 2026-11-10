"use server"

import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

import { inicioDoPapel } from "@/lib/auth"
import { errosDoZod, type EstadoAcao } from "@/lib/estado-acao"
import { criarSessao, encerrarSessao } from "@/lib/sessao"
import { loginSchema } from "@/models/schemas/auth.schema"
import {
  buscarUsuarioPorEmail,
  registrarAuditoria,
} from "@/models/repositories/usuario.repository"

// Hash fixo usado quando o e-mail não existe, para o tempo de resposta não revelar isso
const HASH_FALSO =
  "$2b$10$8O4L0hHiErF5.JJlbPffv.pyJHjGNASevas5pIHI8j5AntuQpLki6"

export async function entrar(
  _anterior: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const dados = loginSchema.safeParse(Object.fromEntries(formData))
  if (!dados.success) return errosDoZod(dados.error)

  const usuario = await buscarUsuarioPorEmail(dados.data.email)
  const senhaOk = await bcrypt.compare(
    dados.data.senha,
    usuario?.senhaHash ?? HASH_FALSO
  )

  // US-04 CA#2: mensagem genérica, sem dizer qual dos dois está errado
  if (!usuario || !senhaOk)
    return { ok: false, mensagem: "E-mail ou senha inválidos." }

  await criarSessao({
    usuarioId: usuario.id,
    papel: usuario.papel,
    nome: usuario.nome,
  })
  await registrarAuditoria({
    usuarioId: usuario.id,
    acao: "LOGIN",
    entidade: "Usuario",
    entidadeId: usuario.id,
  })

  const destino = formData.get("de")
  redirect(
    typeof destino === "string" &&
      destino.startsWith("/admin/") &&
      !destino.startsWith("//")
      ? destino
      : inicioDoPapel(usuario.papel)
  )
}

export async function sair() {
  await encerrarSessao()
  redirect("/admin/login")
}
