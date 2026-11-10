import { ChevronLeftIcon, ClockIcon, TriangleAlertIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { AdicionarAoCarrinho } from "@/components/loja/adicionar-ao-carrinho"
import { ProdutoImagem } from "@/components/loja/produto-imagem"
import { SelosProduto } from "@/components/loja/selos-produto"
import { Separator } from "@/components/ui/separator"
import { formatBRL } from "@/lib/format"
import { maximoNoCarrinho } from "@/models/domain/carrinho"
import { buscarProdutoAtivoPorSlug } from "@/models/repositories/produto.repository"

export async function generateMetadata({
  params,
}: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const produto = await buscarProdutoAtivoPorSlug((await params).slug)
  return produto
    ? { title: produto.nome, description: produto.descricao }
    : { title: "Produto não encontrado" }
}

// US-06 — Detalhe do produto
export default async function ProdutoPage({
  params,
}: PageProps<"/produto/[slug]">) {
  const { slug } = await params
  const produto = await buscarProdutoAtivoPorSlug(slug)
  // Inativo ou inexistente (US-06 CA#4)
  if (!produto) notFound()

  const diasAntecedencia = Math.ceil(produto.antecedenciaHoras / 24)

  return (
    // Espaço extra no celular para a barra fixa de "Adicionar"
    <article className="flex flex-col gap-4 pb-20 md:grid md:grid-cols-2 md:gap-8 md:pb-0">
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="-ml-2 flex h-11 w-fit items-center gap-1 px-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeftIcon className="size-5" aria-hidden />
          Vitrine
        </Link>
        <ProdutoImagem
          src={produto.imagemUrl}
          alt={produto.nome}
          sizes="(min-width: 768px) 50vw, 100vw"
          preload
          className="-mx-4 md:mx-0 md:rounded-xl"
        />
      </div>

      <div className="flex flex-col gap-4 md:pt-14">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-bold">{produto.nome}</h1>
          <p className="text-2xl font-bold text-primary">
            {formatBRL(produto.precoCentavos)}
          </p>
          <SelosProduto produto={produto} />
        </header>

        {produto.antecedenciaHoras > 0 && (
          <p className="flex items-start gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
            <ClockIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <strong>Sob encomenda:</strong> peça com pelo menos{" "}
              {diasAntecedencia} {diasAntecedencia === 1 ? "dia" : "dias"} de
              antecedência. As datas disponíveis aparecem no checkout.
            </span>
          </p>
        )}

        <p className="text-base leading-relaxed">{produto.descricao}</p>

        {/* RN#13: alergênicos sempre visíveis */}
        <section
          aria-labelledby="titulo-alergenicos"
          className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm"
        >
          <TriangleAlertIcon
            className="mt-0.5 size-4 shrink-0 text-amber-600"
            aria-hidden
          />
          <div>
            <h2 id="titulo-alergenicos" className="font-semibold">
              Alergênicos
            </h2>
            <p>{produto.alergenicos}</p>
          </div>
        </section>

        <Separator />

        <section
          aria-labelledby="titulo-ingredientes"
          className="flex flex-col gap-1"
        >
          <h2 id="titulo-ingredientes" className="font-semibold">
            Ingredientes
          </h2>
          <p className="text-sm text-muted-foreground">
            {produto.ingredientes}
          </p>
        </section>

        <AdicionarAoCarrinho
          produto={{
            produtoId: produto.id,
            slug: produto.slug,
            nome: produto.nome,
            precoCentavos: produto.precoCentavos,
            imagemUrl: produto.imagemUrl,
            antecedenciaHoras: produto.antecedenciaHoras,
          }}
          disponivel={maximoNoCarrinho(produto)}
        />
      </div>
    </article>
  )
}
