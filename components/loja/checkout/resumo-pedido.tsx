import { ChevronDownIcon } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { formatBRL } from "@/lib/format"
import { calcularTotais, type ItemCarrinho } from "@/models/domain/carrinho"

type Props = {
  itens: ItemCarrinho[]
  /** null = ainda não calculado (CEP não informado) */
  freteCentavos: number | null
  retirada: boolean
}

function Linhas({ itens, freteCentavos, retirada }: Props) {
  const t = calcularTotais(itens, freteCentavos ?? 0)
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2 text-sm">
        {itens.map((i) => (
          <li key={i.produtoId} className="flex justify-between gap-2">
            <span>
              {i.quantidade}× {i.nome}
            </span>
            <span className="tabular-nums">
              {formatBRL(i.precoCentavos * i.quantidade)}
            </span>
          </li>
        ))}
      </ul>
      <Separator />
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span className="tabular-nums">{formatBRL(t.subtotalCentavos)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Frete</span>
        <span className="tabular-nums">
          {retirada
            ? "Grátis (retirada)"
            : freteCentavos === null
              ? "Informe o CEP"
              : formatBRL(freteCentavos)}
        </span>
      </div>
      <Separator />
      <div className="flex justify-between font-bold">
        <span>Total</span>
        <span className="tabular-nums">{formatBRL(t.totalCentavos)}</span>
      </div>
    </div>
  )
}

/** Resumo colapsável no celular; card fixo na lateral a partir do `lg`. */
export function ResumoPedido(props: Props) {
  const total = calcularTotais(
    props.itens,
    props.freteCentavos ?? 0
  ).totalCentavos
  return (
    <>
      <details className="group rounded-xl border bg-card lg:hidden">
        <summary className="flex h-12 cursor-pointer list-none items-center justify-between px-4 font-medium [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-1">
            Resumo do pedido
            <ChevronDownIcon
              className="size-4 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </span>
          <span className="font-bold tabular-nums">{formatBRL(total)}</span>
        </summary>
        <div className="px-4 pb-4">
          <Linhas {...props} />
        </div>
      </details>
      <aside
        className="sticky top-20 hidden flex-col gap-3 rounded-xl border bg-card p-4 lg:flex"
        aria-label="Resumo do pedido"
      >
        <h2 className="font-semibold">Resumo do pedido</h2>
        <Linhas {...props} />
      </aside>
    </>
  )
}
