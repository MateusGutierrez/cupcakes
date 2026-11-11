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
  /** Nível do título: h2 na grade (logo abaixo do h1), h3 dentro da coleção. */
  titulo?: "h2" | "h3"
}

export function ProductCard({ produto, preload, titulo = "h3" }: Props) {
  const indisponivel = produto.disponivelHoje === 0
  const Titulo = titulo

  return (
    <Link
      href={`/produto/${produto.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      )}
    >
      <div className="relative">
        <ProdutoImagem
          src={produto.imagemUrl}
          alt={produto.nome}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          preload={preload}
          className={cn(indisponivel && "opacity-60 grayscale")}
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
        <Titulo className="leading-tight font-semibold">{produto.nome}</Titulo>
        <SelosProduto produto={produto} />
        <p
          className={cn(
            "mt-auto text-base font-bold",
            indisponivel ? "text-muted-foreground" : "text-primary"
          )}
        >
          {formatBRL(produto.precoCentavos)}
        </p>
      </div>
    </Link>
  )
}
