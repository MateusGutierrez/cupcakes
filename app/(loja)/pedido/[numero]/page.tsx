import { CircleCheckIcon, ClockIcon, LockIcon, XCircleIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import QRCode from "qrcode"

import { CopiarBotao } from "@/components/copiar-botao"
import { AtualizacaoAutomatica } from "@/components/loja/atualizacao-automatica"
import { SimularPixBotao } from "@/components/loja/simular-pix-botao"
import { StatusTimeline } from "@/components/loja/status-timeline"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { temAcessoAoPedido } from "@/lib/acesso-pedido"
import { formatBRL, formatCEP, formatData, formatDataHora } from "@/lib/format"
import { LOJA } from "@/lib/loja"
import { pixCopiaECola } from "@/models/domain/pagamento"
import {
  ROTULO_FORMA_PAGAMENTO,
  ROTULO_MODALIDADE,
  ROTULO_STATUS_PAGAMENTO,
} from "@/models/domain/rotulos"
import { ehTerminal, linhaDoTempo, ROTULO_STATUS } from "@/models/domain/status"
import { buscarPedidoPorNumero } from "@/models/repositories/pedido.repository"

export async function generateMetadata({
  params,
}: PageProps<"/pedido/[numero]">): Promise<Metadata> {
  return { title: `Pedido ${(await params).numero}`, robots: { index: false } }
}

function Linha({
  rotulo,
  children,
}: {
  rotulo: string
  children: React.ReactNode
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  )
}

// US-12 CA#1 — confirmação do pedido
export default async function PedidoPage({
  params,
}: PageProps<"/pedido/[numero]">) {
  const numero = decodeURIComponent((await params).numero)

  // Sem login: só quem fez (ou consultou com e-mail) o pedido pode ver os dados
  if (!(await temAcessoAoPedido(numero))) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border p-6 text-center">
        <LockIcon className="size-8 text-muted-foreground" aria-hidden />
        <h1 className="font-heading text-lg font-bold">Confirme seu e-mail</h1>
        <p className="text-sm text-muted-foreground">
          Para proteger seus dados, informe o e-mail usado no pedido.
        </p>
        <Link
          href={`/acompanhar?numero=${encodeURIComponent(numero)}`}
          className={buttonVariants({ size: "touch" })}
        >
          Acompanhar pedido
        </Link>
      </div>
    )
  }

  const pedido = await buscarPedidoPorNumero(numero)
  if (!pedido) notFound()

  const aguardandoPix = pedido.status === "AGUARDANDO_PAGAMENTO"
  const cancelado = pedido.status === "CANCELADO"
  const codigoPix = aguardandoPix
    ? pixCopiaECola(pedido.numero, pedido.totalCentavos)
    : null
  const qrPix = codigoPix
    ? await QRCode.toDataURL(codigoPix, { margin: 1, width: 240 })
    : null

  const Icone = cancelado
    ? XCircleIcon
    : aguardandoPix
      ? ClockIcon
      : CircleCheckIcon
  const titulo = cancelado
    ? "Pedido cancelado"
    : aguardandoPix
      ? "Falta pagar o PIX"
      : pedido.status === "ENTREGUE"
        ? "Pedido entregue. Bom apetite!"
        : "Pedido confirmado!"
  const etapas = linhaDoTempo(
    pedido.modalidade,
    pedido.status,
    pedido.historico
  )

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <header className="flex flex-col items-center gap-2 pt-2 text-center">
        <Icone
          className={
            cancelado
              ? "size-12 text-destructive"
              : aguardandoPix
                ? "size-12 text-amber-600"
                : "size-12 text-green-600"
          }
          aria-hidden
        />
        <h1 className="font-heading text-2xl font-bold">{titulo}</h1>
        <Badge variant="secondary">{ROTULO_STATUS[pedido.status]}</Badge>
      </header>

      <section
        aria-label="Número do pedido"
        className="flex flex-col items-center gap-3 rounded-xl border bg-card p-4"
      >
        <p className="text-sm text-muted-foreground">Número do pedido</p>
        <p className="font-mono text-3xl font-bold tracking-wider">
          {pedido.numero}
        </p>
        <CopiarBotao
          texto={pedido.numero}
          rotulo="Copiar número"
          mensagem="Número do pedido copiado"
        />
        <p className="text-center text-xs text-muted-foreground">
          Guarde este número: com ele e seu e-mail você acompanha o pedido.
        </p>
      </section>

      {codigoPix && qrPix && (
        <section
          aria-labelledby="titulo-pix"
          className="flex flex-col items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4"
        >
          <h2 id="titulo-pix" className="font-semibold">
            Pague {formatBRL(pedido.totalCentavos)} com PIX
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL gerada no servidor */}
          <img
            src={qrPix}
            alt="QR Code PIX (demonstração)"
            width={240}
            height={240}
            className="rounded-lg bg-white p-2"
          />
          <p
            className="w-full truncate rounded-md bg-muted p-2 font-mono text-xs"
            title={codigoPix}
          >
            {codigoPix}
          </p>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <CopiarBotao
              texto={codigoPix}
              rotulo="Copiar código PIX"
              mensagem="Código PIX copiado"
              className="sm:flex-1"
            />
            <div className="*:w-full sm:flex-1">
              <SimularPixBotao numero={pedido.numero} />
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Demonstração: o QR Code é fictício. Use o botão acima para simular a
            confirmação do banco.
          </p>
        </section>
      )}

      <section
        aria-labelledby="titulo-andamento"
        className="flex flex-col gap-3 rounded-xl border bg-card p-4"
      >
        <h2 id="titulo-andamento" className="font-semibold">
          Andamento
        </h2>
        <StatusTimeline etapas={etapas} />
        {!ehTerminal(pedido.status) && (
          <p className="text-xs text-muted-foreground">
            Esta página se atualiza sozinha.
          </p>
        )}
      </section>
      {!ehTerminal(pedido.status) && <AtualizacaoAutomatica />}

      <section
        aria-labelledby="titulo-detalhes"
        className="flex flex-col gap-3 rounded-xl border bg-card p-4"
      >
        <h2 id="titulo-detalhes" className="font-semibold">
          Detalhes
        </h2>
        <dl className="flex flex-col gap-2">
          <Linha rotulo="Cliente">{pedido.nomeCliente}</Linha>
          <Linha
            rotulo={
              pedido.modalidade === "ENTREGA" ? "Entrega em" : "Retirada em"
            }
          >
            {formatData(pedido.dataAgendada, "longa")},{" "}
            {formatDataHora(pedido.dataAgendada).slice(-5)}
          </Linha>
          <Linha rotulo="Modalidade">
            {ROTULO_MODALIDADE[pedido.modalidade]}
          </Linha>
          <Linha rotulo="Endereço">
            {pedido.modalidade === "ENTREGA"
              ? `${pedido.endereco} · CEP ${formatCEP(pedido.cep ?? "")}`
              : LOJA.endereco}
          </Linha>
          <Linha rotulo="Pagamento">
            {ROTULO_FORMA_PAGAMENTO[pedido.formaPagamento]}
            {pedido.cartaoFinal && ` •••• ${pedido.cartaoFinal}`}
          </Linha>
          <Linha rotulo="Situação do pagamento">
            {ROTULO_STATUS_PAGAMENTO[pedido.statusPagamento]}
          </Linha>
          {pedido.trocoParaCentavos && (
            <Linha rotulo="Troco para">
              {formatBRL(pedido.trocoParaCentavos)}
            </Linha>
          )}
          {pedido.observacao && (
            <Linha rotulo="Observações">{pedido.observacao}</Linha>
          )}
        </dl>
      </section>

      <section
        aria-labelledby="titulo-itens"
        className="flex flex-col gap-3 rounded-xl border bg-card p-4"
      >
        <h2 id="titulo-itens" className="font-semibold">
          Itens
        </h2>
        <ul className="flex flex-col gap-2 text-sm">
          {pedido.itens.map((i) => (
            <li key={i.id} className="flex justify-between gap-2">
              <span>
                {i.quantidade}× {i.nomeProduto}
              </span>
              <span className="tabular-nums">
                {formatBRL(i.precoUnitarioCentavos * i.quantidade)}
              </span>
            </li>
          ))}
        </ul>
        <Separator />
        <dl className="flex flex-col gap-2">
          <Linha rotulo="Subtotal">{formatBRL(pedido.subtotalCentavos)}</Linha>
          <Linha rotulo="Frete">
            {pedido.freteCentavos ? formatBRL(pedido.freteCentavos) : "Grátis"}
          </Linha>
        </dl>
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span className="tabular-nums">
            {formatBRL(pedido.totalCentavos)}
          </span>
        </div>
      </section>

      <Link
        href="/"
        className={buttonVariants({ variant: "outline", size: "touch" })}
      >
        Voltar à vitrine
      </Link>
    </div>
  )
}
