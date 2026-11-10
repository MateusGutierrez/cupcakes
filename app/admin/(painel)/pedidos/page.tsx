import type { Metadata } from "next"

import { AvisoNegado } from "@/components/admin/aviso-negado"
import { exigirSessao } from "@/lib/auth"

export const metadata: Metadata = { title: "Pedidos" }

// Placeholder — a gestão de pedidos (F13) é construída na Fase 4
export default async function PedidosAdminPage({
  searchParams,
}: PageProps<"/admin/pedidos">) {
  await exigirSessao(["ADMIN", "ATENDENTE"])
  const { negado } = await searchParams
  return (
    <div className="flex flex-col gap-2">
      <AvisoNegado visivel={Boolean(negado)} />
      <h1 className="font-heading text-xl font-bold">Pedidos</h1>
      <p className="text-muted-foreground">
        A gestão de pedidos chega na Fase 4.
      </p>
    </div>
  )
}
