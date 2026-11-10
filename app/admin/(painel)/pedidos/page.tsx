import { InboxIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { AvisoNegado } from "@/components/admin/aviso-negado"
import { PedidoCard } from "@/components/admin/pedido-card"
import { AtualizacaoAutomatica } from "@/components/loja/atualizacao-automatica"
import { StatusPedido } from "@/generated/prisma/enums"
import { exigirSessao } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { ROTULO_STATUS } from "@/models/domain/status"
import {
  contarPedidosPorStatus,
  listarPedidosPorStatus,
} from "@/models/repositories/pedido.repository"

export const metadata: Metadata = { title: "Pedidos" }

const ABAS: StatusPedido[] = [
  "RECEBIDO",
  "EM_PREPARO",
  "PRONTO",
  "SAIU_PARA_ENTREGA",
  "AGUARDANDO_PAGAMENTO",
  "ENTREGUE",
  "CANCELADO",
]

function isStatus(v: unknown): v is StatusPedido {
  return typeof v === "string" && v in StatusPedido
}

// US-17 — gestão de pedidos
export default async function PedidosAdminPage({
  searchParams,
}: PageProps<"/admin/pedidos">) {
  await exigirSessao(["ADMIN", "ATENDENTE"])
  const { negado, status: statusParam } = await searchParams
  const status = isStatus(statusParam) ? statusParam : "RECEBIDO"

  const [pedidos, contagem] = await Promise.all([
    listarPedidosPorStatus(status),
    contarPedidosPorStatus(),
  ])

  return (
    <div className="flex flex-col gap-4">
      <AvisoNegado visivel={Boolean(negado)} />
      {/* Novos pedidos aparecem sem recarregar */}
      <AtualizacaoAutomatica segundos={30} />
      <h1 className="font-heading text-xl font-bold">Pedidos</h1>

      {/* Abas por status (links: funciona sem JS e mantém a aba na URL) */}
      <nav
        aria-label="Filtrar por status"
        className="-mx-4 [scrollbar-width:none] overflow-x-auto px-4"
      >
        <ul className="flex w-max gap-2">
          {ABAS.map((s) => {
            const ativo = s === status
            const n = contagem[s] ?? 0
            return (
              <li key={s}>
                <Link
                  href={`/admin/pedidos?status=${s}`}
                  aria-current={ativo ? "page" : undefined}
                  className={cn(
                    "flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
                    ativo
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  )}
                >
                  {ROTULO_STATUS[s]}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      ativo ? "bg-primary-foreground/20" : "bg-muted"
                    )}
                  >
                    {n}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {pedidos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-background p-8 text-center text-muted-foreground">
          <InboxIcon className="size-8" aria-hidden />
          <p>Nenhum pedido em “{ROTULO_STATUS[status]}”.</p>
        </div>
      ) : (
        // Cards em 1 coluna no celular; 2–3 colunas em telas maiores
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pedidos.map((p) => (
            <li key={p.id}>
              <PedidoCard pedido={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
