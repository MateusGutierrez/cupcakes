"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { exigirSessao } from "@/lib/auth"
import { db } from "@/lib/db"
import { errosDoZod, type EstadoAcao } from "@/lib/estado-acao"
import { gerarSlug } from "@/models/domain/catalogo"
import {
  atualizarProduto,
  buscarProdutoPorId,
  criarProduto,
  slugEmUso,
} from "@/models/repositories/produto.repository"
import { registrarAuditoria } from "@/models/repositories/usuario.repository"
import { produtoSchema } from "@/models/schemas/produto.schema"

// RN#34: só ADMIN gerencia o cardápio
const PAPEIS = ["ADMIN"] as const

async function slugDisponivel(nome: string) {
  const base = gerarSlug(nome) || "produto"
  let slug = base
  for (let i = 2; await slugEmUso(slug); i++) slug = `${base}-${i}`
  return slug
}

function revalidarCatalogo(slug?: string) {
  revalidatePath("/")
  revalidatePath("/admin/produtos")
  if (slug) revalidatePath(`/produto/${slug}`)
}

/** Cria (id = null) ou edita um produto. US-16. */
export async function salvarProduto(
  id: number | null,
  _anterior: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const usuario = await exigirSessao(PAPEIS)

  const dados = produtoSchema.safeParse(Object.fromEntries(formData))
  if (!dados.success) return errosDoZod(dados.error)

  let slug: string
  if (id === null) {
    slug = await slugDisponivel(dados.data.nome)
    await db.$transaction(async (tx) => {
      // RN#35: todo produto novo nasce inativo
      const criado = await criarProduto(
        { ...dados.data, slug, ativo: false },
        tx
      )
      await registrarAuditoria(
        {
          usuarioId: usuario.id,
          acao: "CRIAR_PRODUTO",
          entidade: "Produto",
          entidadeId: criado.id,
        },
        tx
      )
    })
  } else {
    const existente = await buscarProdutoPorId(id)
    if (!existente) return { ok: false, mensagem: "Produto não encontrado." }
    slug = existente.slug // o slug não muda, para não quebrar links já compartilhados
    await db.$transaction(async (tx) => {
      await atualizarProduto(id, dados.data, tx)
      await registrarAuditoria(
        {
          usuarioId: usuario.id,
          acao: "EDITAR_PRODUTO",
          entidade: "Produto",
          entidadeId: id,
        },
        tx
      )
    })
  }

  revalidarCatalogo(slug)
  redirect(`/admin/produtos?salvo=${id === null ? "novo" : "editado"}`)
}

/** Ativa ou pausa um produto na vitrine. */
export async function alterarAtivo(
  id: number,
  ativo: boolean
): Promise<EstadoAcao> {
  const usuario = await exigirSessao(PAPEIS)

  const existente = await buscarProdutoPorId(id)
  if (!existente) return { ok: false, mensagem: "Produto não encontrado." }

  await db.$transaction(async (tx) => {
    await atualizarProduto(id, { ativo }, tx)
    await registrarAuditoria(
      {
        usuarioId: usuario.id,
        acao: ativo ? "ATIVAR_PRODUTO" : "PAUSAR_PRODUTO",
        entidade: "Produto",
        entidadeId: id,
      },
      tx
    )
  })

  revalidarCatalogo(existente.slug)
  return {
    ok: true,
    mensagem: ativo
      ? `${existente.nome} está na vitrine.`
      : `${existente.nome} foi pausado.`,
  }
}
