import { ShoppingBagIcon } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

/** US-07 CA#4 — carrinho vazio com atalho para a vitrine. */
export function CarrinhoVazio() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShoppingBagIcon />
        </EmptyMedia>
        <EmptyTitle>Seu carrinho está vazio</EmptyTitle>
        <EmptyDescription>
          Escolha seus cupcakes favoritos na vitrine.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/" className={buttonVariants({ size: "touch" })}>
          Ver vitrine
        </Link>
      </EmptyContent>
    </Empty>
  )
}
