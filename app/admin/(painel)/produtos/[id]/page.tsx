import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ProdutoForm } from "@/components/admin/produto-form"
import { exigirSessao } from "@/lib/auth"
import { buscarProdutoPorId } from "@/models/repositories/produto.repository"

export const metadata: Metadata = { title: "Editar produto" }

export default async function EditarProdutoPage({
  params,
}: PageProps<"/admin/produtos/[id]">) {
  await exigirSessao(["ADMIN"])
  const id = Number((await params).id)
  const produto = Number.isInteger(id) ? await buscarProdutoPorId(id) : null
  if (!produto) notFound()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-bold">
          Editar: {produto.nome}
        </h1>
        {produto.ativo && (
          <Link
            href={`/produto/${produto.slug}`}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Ver na vitrine
          </Link>
        )}
      </div>
      <ProdutoForm produto={produto} />
    </div>
  )
}
