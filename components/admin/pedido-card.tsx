import { ClockIcon, MapPinIcon, PhoneIcon, StoreIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  formatBRL,
  formatData,
  formatDataHora,
  formatTelefone,
} from "@/lib/format"
import {
  ROTULO_FORMA_PAGAMENTO,
  ROTULO_STATUS_PAGAMENTO,
} from "@/models/domain/rotulos"
import {
  podeCancelar,
  proximoStatus,
  ROTULO_STATUS,
} from "@/models/domain/status"
import type { PedidoCompleto } from "@/models/repositories/pedido.repository"

import { AcoesPedido } from "./acoes-pedido"

/** Card do pedido no painel (US-17): horário, modalidade, itens, pagamento e ações. */
export function PedidoCard({ pedido }: { pedido: PedidoCompleto }) {
  const hora = formatDataHora(pedido.dataAgendada).slice(-5)
  const entrega = pedido.modalidade === "ENTREGA"

  return (
    <article
      className="flex flex-col gap-3 rounded-xl border bg-background p-4"
      aria-label={`Pedido ${pedido.numero}`}
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-lg font-bold">{pedido.numero}</p>
          <p className="flex items-center gap-1 text-sm font-medium">
            <ClockIcon className="size-4" aria-hidden />
            {formatData(pedido.dataAgendada)} às {hora}
          </p>
        </div>
        <Badge variant={entrega ? "default" : "secondary"}>
          {entrega ? <MapPinIcon aria-hidden /> : <StoreIcon aria-hidden />}
          {entrega ? "Entrega" : "Retirada"}
        </Badge>
      </header>

      <div className="flex flex-col gap-1 text-sm">
        <p className="font-medium">{pedido.nomeCliente}</p>
        <a
          href={`tel:${pedido.telefone}`}
          className="flex w-fit items-center gap-1 text-primary underline-offset-4 hover:underline"
        >
          <PhoneIcon className="size-4" aria-hidden />
          {formatTelefone(pedido.telefone)}
        </a>
        {entrega && <p className="text-muted-foreground">{pedido.endereco}</p>}
      </div>

      <Separator />

      <ul className="flex flex-col gap-1 text-sm" aria-label="Itens">
        {pedido.itens.map((i) => (
          <li key={i.id} className="flex justify-between gap-2">
            <span>
              <strong>{i.quantidade}×</strong> {i.nomeProduto}
            </span>
          </li>
        ))}
      </ul>
      {pedido.observacao && (
        <p className="rounded-md bg-amber-500/10 p-2 text-sm">
          <strong>Obs.:</strong> {pedido.observacao}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>
          {ROTULO_FORMA_PAGAMENTO[pedido.formaPagamento]} ·{" "}
          {ROTULO_STATUS_PAGAMENTO[pedido.statusPagamento]}
          {pedido.trocoParaCentavos
            ? ` · troco p/ ${formatBRL(pedido.trocoParaCentavos)}`
            : ""}
        </span>
        <strong className="tabular-nums">
          {formatBRL(pedido.totalCentavos)}
        </strong>
      </div>

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer py-1">
          Histórico ({pedido.historico.length})
        </summary>
        <ol className="mt-1 flex flex-col gap-0.5">
          {pedido.historico.map((h) => (
            <li key={h.id}>
              {formatDataHora(h.createdAt)} — {ROTULO_STATUS[h.para]} ·{" "}
              {h.responsavel}
            </li>
          ))}
        </ol>
      </details>

      <AcoesPedido
        pedidoId={pedido.id}
        numero={pedido.numero}
        status={pedido.status}
        proximo={proximoStatus(pedido.status, pedido.modalidade)}
        cancelavel={podeCancelar(pedido.status)}
        estornara={pedido.statusPagamento === "APROVADO"}
      />
    </article>
  )
}
