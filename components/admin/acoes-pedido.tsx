"use client"

import { ArrowRightIcon, PrinterIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { mudarStatusPedido } from "@/controllers/admin-pedido.actions"
import type { StatusPedido } from "@/generated/prisma/enums"
import { ROTULO_STATUS } from "@/models/domain/status"

type Props = {
  pedidoId: number
  numero: string
  status: StatusPedido
  /** Próxima etapa válida (calculada no servidor pela máquina de estados) */
  proximo: StatusPedido | null
  cancelavel: boolean
  estornara: boolean
}

export function AcoesPedido({
  pedidoId,
  numero,
  status,
  proximo,
  cancelavel,
  estornara,
}: Props) {
  const [pendente, iniciar] = useTransition()

  function mudar(para: StatusPedido) {
    iniciar(async () => {
      const r = await mudarStatusPedido(pedidoId, status, para)
      if (r.ok) toast.success(r.mensagem)
      else toast.error(r.mensagem)
    })
  }

  const rotuloAvancar =
    status === "AGUARDANDO_PAGAMENTO"
      ? "Confirmar pagamento"
      : proximo
        ? `Avançar para: ${ROTULO_STATUS[proximo]}`
        : ""

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {/* US-17 CA#2: só a transição válida é oferecida */}
      {proximo && (
        <Button
          size="touch"
          className="sm:flex-1"
          disabled={pendente}
          onClick={() => mudar(proximo)}
        >
          {pendente ? <Spinner /> : <ArrowRightIcon />}
          {rotuloAvancar}
        </Button>
      )}
      <div className="flex gap-2">
        <Link
          href={`/admin/pedidos/${pedidoId}/imprimir`}
          className={buttonVariants({
            variant: "outline",
            size: "touch",
            className: "flex-1",
          })}
        >
          <PrinterIcon />
          Imprimir
        </Link>
        {cancelavel && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  size="touch"
                  className="flex-1"
                  disabled={pendente}
                />
              }
            >
              <XIcon />
              Cancelar
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar o pedido {numero}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita.
                  {estornara && " O pagamento será estornado (simulação)."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel size="touch">Voltar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  size="touch"
                  onClick={() => mudar("CANCELADO")}
                >
                  Cancelar pedido
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
