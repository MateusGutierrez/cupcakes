import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export default function ProdutoAdminNaoEncontrado() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border bg-background p-8 text-center">
      <p className="font-semibold">Produto não encontrado.</p>
      <Link
        href="/admin/produtos"
        className={buttonVariants({ size: "touch", variant: "outline" })}
      >
        Voltar para a lista
      </Link>
    </div>
  )
}
