import { CakeSliceIcon } from "lucide-react"
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

export default function ProdutoNaoEncontrado() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CakeSliceIcon />
        </EmptyMedia>
        <EmptyTitle>Este cupcake não está disponível</EmptyTitle>
        <EmptyDescription>
          Ele pode ter saído do cardápio ou o link está incorreto. Que tal ver
          os outros sabores?
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
