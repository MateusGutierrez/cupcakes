import type { Metadata } from "next"

import { ProdutoForm } from "@/components/admin/produto-form"
import { exigirSessao } from "@/lib/auth"

export const metadata: Metadata = { title: "Novo produto" }

export default async function NovoProdutoPage() {
  await exigirSessao(["ADMIN"])
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="font-heading text-xl font-bold">Novo produto</h1>
      <ProdutoForm />
    </div>
  )
}
