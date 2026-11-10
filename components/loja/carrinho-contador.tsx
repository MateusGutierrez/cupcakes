"use client"

import { cn } from "@/lib/utils"
import { useCarrinho, useCarrinhoHidratado } from "@/stores/carrinho.store"

/** Bolinha com a quantidade de itens no carrinho. */
export function CarrinhoContador({ className }: { className?: string }) {
  const hidratado = useCarrinhoHidratado()
  const quantidade = useCarrinho((s) =>
    s.itens.reduce((t, i) => t + i.quantidade, 0)
  )
  if (!hidratado || quantidade === 0) return null
  return (
    <span
      aria-label={`${quantidade} ${quantidade === 1 ? "item" : "itens"} no carrinho`}
      className={cn(
        "flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.6875rem] leading-none font-bold text-primary-foreground tabular-nums",
        className
      )}
    >
      {quantidade > 99 ? "99+" : quantidade}
    </span>
  )
}
