import { ChevronRightIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { AcompanharForm } from "@/components/loja/acompanhar-form"
import { Badge } from "@/components/ui/badge"
import { pedidosComAcesso } from "@/lib/acesso-pedido"
import { formatBRL, formatData } from "@/lib/format"
import { ROTULO_STATUS } from "@/models/domain/status"
import { listarResumoPedidos } from "@/models/repositories/pedido.repository"

export const metadata: Metadata = { title: "Acompanhar pedido" }

// US-13 — acompanhar pedido como convidado
export default async function AcompanharPage({
  searchParams,
}: PageProps<"/acompanhar">) {
  const { numero } = await searchParams
  const recentes = await listarResumoPedidos(await pedidosComAcesso())

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      {recentes.length > 0 && (
        <section
          aria-labelledby="titulo-recentes"
          className="flex flex-col gap-3"
        >
          <h2 id="titulo-recentes" className="font-heading text-xl font-bold">
            Seus pedidos
          </h2>
          <ul className="flex flex-col gap-2">
            {recentes.map((p) => (
              <li key={p.numero}>
                <Link
                  href={`/pedido/${p.numero}`}
                  className="flex min-h-16 items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-muted"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-mono font-semibold">{p.numero}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatData(p.dataAgendada)} ·{" "}
                      {formatBRL(p.totalCentavos)}
                    </span>
                  </div>
                  <Badge
                    variant={
                      p.status === "CANCELADO" ? "destructive" : "secondary"
                    }
                  >
                    {ROTULO_STATUS[p.status]}
                  </Badge>
                  <ChevronRightIcon
                    className="size-5 text-muted-foreground"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        aria-labelledby="titulo-consulta"
        className="flex flex-col gap-3"
      >
        <div>
          <h1 id="titulo-consulta" className="font-heading text-xl font-bold">
            {recentes.length > 0
              ? "Consultar outro pedido"
              : "Acompanhar pedido"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Informe o número que aparece na confirmação e o e-mail usado na
            compra.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <AcompanharForm
            numero={typeof numero === "string" ? numero : undefined}
          />
        </div>
      </section>
    </div>
  )
}
