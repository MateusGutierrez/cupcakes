"use client"

import { Trash2Icon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useRevalidarCarrinho } from "@/hooks/use-revalidar-carrinho"
import { formatBRL } from "@/lib/format"
import { cn } from "@/lib/utils"
import { calcularTotais } from "@/models/domain/carrinho"
import { useCarrinho } from "@/stores/carrinho.store"

import { CarrinhoVazio } from "./carrinho-vazio"
import { ProdutoImagem } from "./produto-imagem"
import { QuantidadeStepper } from "./quantidade-stepper"

export function CarrinhoView() {
  const carregando = useRevalidarCarrinho()
  const itens = useCarrinho((s) => s.itens)
  const alterarQtd = useCarrinho((s) => s.alterarQtd)
  const remover = useCarrinho((s) => s.remover)
  // RN#16: recalculado a cada mudança, sem recarregar a página
  const totais = calcularTotais(itens)

  if (carregando && itens.length === 0) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    )
  }

  if (itens.length === 0) return <CarrinhoVazio />

  function mudarQuantidade(
    produtoId: number,
    nome: string,
    qtd: number,
    maximo: number
  ) {
    if (alterarQtd(produtoId, qtd))
      toast.warning(`Só temos ${maximo} unidade(s) de ${nome}.`)
  }

  return (
    <div className="flex flex-col gap-4 pb-24 lg:grid lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-8 lg:pb-0">
      <ul className="flex flex-col gap-3" aria-label="Itens do carrinho">
        {itens.map((i) => (
          <li
            key={i.produtoId}
            className="flex gap-3 rounded-xl border bg-card p-3"
          >
            <Link
              href={`/produto/${i.slug}`}
              className="w-16 shrink-0 self-start overflow-hidden rounded-lg sm:w-20"
            >
              <ProdutoImagem src={i.imagemUrl} alt={i.nome} sizes="80px" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/produto/${i.slug}`}
                    className="leading-tight font-semibold"
                  >
                    {i.nome}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatBRL(i.precoCentavos)} cada
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-touch"
                  className="-mt-2 -mr-2 text-muted-foreground"
                  aria-label={`Remover ${i.nome}`}
                  onClick={() => remover(i.produtoId)}
                >
                  <Trash2Icon />
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <QuantidadeStepper
                  valor={i.quantidade}
                  min={0}
                  max={i.maximo}
                  rotulo={`Quantidade de ${i.nome}`}
                  onChange={(q) =>
                    mudarQuantidade(i.produtoId, i.nome, q, i.maximo)
                  }
                />
                <p className="font-bold tabular-nums">
                  {formatBRL(i.precoCentavos * i.quantidade)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside
        className="flex flex-col gap-3 rounded-xl border bg-card p-4"
        aria-label="Resumo"
      >
        <div className="flex justify-between text-sm">
          <span>
            Subtotal ({totais.quantidade}{" "}
            {totais.quantidade === 1 ? "item" : "itens"})
          </span>
          <span className="tabular-nums">
            {formatBRL(totais.subtotalCentavos)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Frete</span>
          <span>calculado no checkout</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span className="tabular-nums">
            {formatBRL(totais.totalCentavos)}
          </span>
        </div>
        <Link
          href="/checkout"
          className={cn(
            buttonVariants({ size: "touch" }),
            "hidden lg:inline-flex"
          )}
        >
          Finalizar pedido
        </Link>
      </aside>

      {/* Barra fixa no celular, acima da navegação inferior */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="font-bold tabular-nums">
            {formatBRL(totais.totalCentavos)}
          </span>
        </div>
        <Link
          href="/checkout"
          className={buttonVariants({ size: "touch", className: "flex-1" })}
        >
          Finalizar pedido
        </Link>
      </div>
    </div>
  )
}
