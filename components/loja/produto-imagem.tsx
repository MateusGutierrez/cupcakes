import Image from "next/image"

import { cn } from "@/lib/utils"

type Props = {
  src: string
  alt: string
  sizes: string
  preload?: boolean
  className?: string
}

/** Imagem quadrada do produto. URLs externas (cadastradas no admin) não passam pelo otimizador. */
export function ProdutoImagem({ src, alt, sizes, preload, className }: Props) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden bg-muted",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        loading={preload ? "eager" : undefined}
        unoptimized={!src.startsWith("/")}
        className="object-cover"
      />
    </div>
  )
}
