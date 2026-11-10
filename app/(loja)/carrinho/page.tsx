import type { Metadata } from "next"

import { CarrinhoView } from "@/components/loja/carrinho-view"

export const metadata: Metadata = { title: "Carrinho" }

// US-07, US-08 — Carrinho
export default function CarrinhoPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-xl font-bold">Seu carrinho</h1>
      <CarrinhoView />
    </div>
  )
}
