import { ClockIcon } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { formatBRL } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ProdutoComDisponibilidade } from "@/models/repositories/produto.repository"

import { ProdutoImagem } from "./produto-imagem"
import { SelosProduto } from "./selos-produto"

type Props = {
  produto: ProdutoComDisponibilidade
  preload?: boolean
}

export function ProductCard({ produto, preload }: Props) {
  const indisponivel = produto.disponivelHoje === 0

  return (
    <Link
      href={`/produto/${produto.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        indisponivel && "opacity-60"
      )}
    >
      <div className="relative">
        <ProdutoImagem
          src={produto.imagemUrl}
          alt={produto.nome}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          preload={preload}
          className={cn(indisponivel && "grayscale")}
        />
        {/* US-03 CA#2 / RN#07 */}
        {indisponivel && (
          <Badge
            variant="destructive"
            className="absolute top-2 left-2 bg-background"
          >
            Indisponível hoje
          </Badge>
        )}
        {!indisponivel && produto.antecedenciaHoras > 0 && (
          <Badge
            variant="outline"
            className="absolute top-2 left-2 bg-background"
          >
            <ClockIcon aria-hidden />
            Sob encomenda
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="leading-tight font-semibold">{produto.nome}</h3>
        <SelosProduto produto={produto} />
        <p className="mt-auto text-base font-bold text-primary">
          {formatBRL(produto.precoCentavos)}
        </p>
      </div>
    </Link>
  )
}
