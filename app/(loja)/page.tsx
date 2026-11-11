import { SearchXIcon } from "lucide-react"
import Link from "next/link"

import { BuscaForm } from "@/components/loja/busca-form"
import { ColecaoCarousel } from "@/components/loja/colecao-carousel"
import { FiltroSelos } from "@/components/loja/filtro-selos"
import { ProductCard } from "@/components/loja/product-card"
import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  filtrarCatalogo,
  isSelo,
  sugerirProdutos,
  termoDeBusca,
} from "@/models/domain/catalogo"
import { listarProdutosAtivos } from "@/models/repositories/produto.repository"

function rotuloResultados(n: number) {
  if (n === 0) return "Nenhum resultado"
  return n === 1 ? "1 resultado" : `${n} resultados`
}

// US-03 — Vitrine
export default async function VitrinePage({ searchParams }: PageProps<"/">) {
  const sp = await searchParams
  const buscando = "busca" in sp
  // Termo limitado também no servidor (laudo D3): a URL aceita qualquer tamanho
  const busca = termoDeBusca(sp.busca)
  const selo = isSelo(sp.selo) ? sp.selo : undefined

  const todos = await listarProdutosAtivos()
  const produtos = filtrarCatalogo(todos, { selo, busca })
  const filtrando = Boolean(busca || selo)
  // "Você quis dizer…" só quando a busca não acha nada (laudo M1)
  const sugestoes =
    busca && produtos.length === 0
      ? sugerirProdutos(busca, filtrarCatalogo(todos, { selo }))
      : []

  // Coleção sazonal: primeiro nome de coleção entre os produtos ativos
  const nomeColecao = todos.find((p) => p.colecao)?.colecao
  const colecao = nomeColecao
    ? todos.filter((p) => p.colecao === nomeColecao)
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <BuscaForm busca={busca} selo={selo} focar={buscando && !busca} />
        <FiltroSelos seloAtivo={selo} busca={busca} />
      </div>

      {!filtrando && nomeColecao && (
        <ColecaoCarousel nome={nomeColecao} produtos={colecao} />
      )}

      <section
        aria-labelledby="titulo-catalogo"
        className="flex flex-col gap-3"
      >
        <h1 id="titulo-catalogo" className="font-heading text-xl font-bold">
          {filtrando ? rotuloResultados(produtos.length) : "Nossos cupcakes"}
        </h1>

        {produtos.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {produtos.map((p, i) => (
              <li key={p.id}>
                {/* As 2 primeiras fotos aparecem logo no celular: carregam primeiro (LCP) */}
                <ProductCard produto={p} titulo="h2" preload={i < 2} />
              </li>
            ))}
          </ul>
        ) : (
          // US-05 CA#2
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchXIcon />
              </EmptyMedia>
              <EmptyTitle>Nenhum produto encontrado</EmptyTitle>
              <EmptyDescription className="wrap-anywhere">
                {busca
                  ? `Não achamos nada para “${busca}”.`
                  : "Nenhum cupcake com esse filtro hoje."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {sugestoes.length > 0 && (
                <nav aria-label="Sugestões" className="flex flex-col gap-2">
                  <p className="text-sm font-medium">Você quis dizer:</p>
                  <ul className="flex flex-wrap justify-center gap-2">
                    {sugestoes.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/produto/${p.slug}`}
                          className={buttonVariants({
                            size: "touch",
                            variant: "secondary",
                          })}
                        >
                          {p.nome}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              <Link
                href="/"
                className={buttonVariants({
                  size: "touch",
                  variant: "outline",
                })}
              >
                Limpar filtros
              </Link>
            </EmptyContent>
          </Empty>
        )}
      </section>
    </div>
  )
}
