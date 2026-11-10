import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { BotaoImprimir } from "@/components/admin/botao-imprimir"
import { buttonVariants } from "@/components/ui/button"
import { exigirSessao } from "@/lib/auth"
import { formatData, formatDataHora, formatTelefone } from "@/lib/format"
import {
  ROTULO_FORMA_PAGAMENTO,
  ROTULO_STATUS_PAGAMENTO,
} from "@/models/domain/rotulos"
import { buscarPedidoPorId } from "@/models/repositories/pedido.repository"

export const metadata: Metadata = { title: "Comanda" }

// US-18 (parte de impressão) — comanda da cozinha, otimizada para @media print
export default async function ImprimirPedidoPage({
  params,
}: PageProps<"/admin/pedidos/[id]/imprimir">) {
  await exigirSessao(["ADMIN", "ATENDENTE"])
  const id = Number((await params).id)
  const pedido = Number.isInteger(id) ? await buscarPedidoPorId(id) : null
  if (!pedido) notFound()

  const entrega = pedido.modalidade === "ENTREGA"

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div className="flex gap-2 print:hidden">
        <Link
          href={`/admin/pedidos?status=${pedido.status}`}
          className={buttonVariants({
            variant: "outline",
            size: "touch",
            className: "flex-1",
          })}
        >
          Voltar
        </Link>
        <div className="flex-1 *:w-full">
          <BotaoImprimir />
        </div>
      </div>

      {/* Comanda: preto e branco, fonte grande, sem enfeites */}
      <article className="flex flex-col gap-3 rounded-xl border bg-white p-5 font-mono text-black print:rounded-none print:border-0 print:p-0">
        <header className="border-b-2 border-dashed border-black pb-3 text-center">
          <p className="text-xs uppercase">Cupcakes Gourmet · Comanda</p>
          <p className="text-3xl font-bold">{pedido.numero}</p>
          <p className="text-lg font-bold">
            {entrega ? "ENTREGA" : "RETIRADA"} ·{" "}
            {formatData(pedido.dataAgendada)}{" "}
            {formatDataHora(pedido.dataAgendada).slice(-5)}
          </p>
        </header>

        <ul className="flex flex-col gap-2 text-lg">
          {pedido.itens.map((i) => (
            <li key={i.id} className="flex gap-3">
              <span className="w-10 shrink-0 text-right font-bold">
                {i.quantidade}×
              </span>
              <span>
                {i.nomeProduto}
                {i.mensagem && (
                  <span className="block text-sm">“{i.mensagem}”</span>
                )}
              </span>
            </li>
          ))}
        </ul>

        {pedido.observacao && (
          <p className="border-2 border-black p-2 text-base">
            <strong>OBS:</strong> {pedido.observacao}
          </p>
        )}

        <footer className="flex flex-col gap-0.5 border-t-2 border-dashed border-black pt-3 text-sm">
          <p>
            <strong>Cliente:</strong> {pedido.nomeCliente} ·{" "}
            {formatTelefone(pedido.telefone)}
          </p>
          {entrega && (
            <p>
              <strong>Endereço:</strong> {pedido.endereco}
            </p>
          )}
          <p>
            <strong>Pagamento:</strong>{" "}
            {ROTULO_FORMA_PAGAMENTO[pedido.formaPagamento]} (
            {ROTULO_STATUS_PAGAMENTO[pedido.statusPagamento]})
          </p>
          <p className="text-xs">Impresso em {formatDataHora(new Date())}</p>
        </footer>
      </article>
    </div>
  )
}
