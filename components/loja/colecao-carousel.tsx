"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import type { ProdutoComDisponibilidade } from "@/models/repositories/produto.repository"

import { ProductCard } from "./product-card"

type Props = { nome: string; produtos: ProdutoComDisponibilidade[] }

/** Destaque da coleção sazonal no topo da vitrine (US-03 CA#3). */
export function ColecaoCarousel({ nome, produtos }: Props) {
  return (
    <section aria-labelledby="titulo-colecao" className="flex flex-col gap-3">
      <div>
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
          Coleção especial
        </p>
        <h2 id="titulo-colecao" className="font-heading text-xl font-bold">
          {nome}
        </h2>
      </div>
      {/* Arrastar no celular; no desktop os itens cabem lado a lado */}
      <Carousel
        opts={{ align: "start" }}
        aria-label={`Produtos da coleção ${nome}`}
      >
        <CarouselContent className="-ml-3">
          {produtos.map((p, i) => (
            <CarouselItem
              key={p.id}
              className="basis-[46%] pl-3 sm:basis-1/3 md:basis-1/4"
            >
              <ProductCard produto={p} preload={i < 2} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
