"use client"

import { XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
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
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cancelarPedidoCliente } from "@/controllers/pedido.actions"

/** US-14 — cancelamento pelo cliente, com confirmação explícita (RNF#27). */
export function CancelarPedidoBotao({
  numero,
  estornara,
}: {
  numero: string
  estornara: boolean
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()

  function cancelar() {
    iniciar(async () => {
      const r = await cancelarPedidoCliente(numero)
      if (r.ok) toast.success(r.mensagem)
      else toast.error(r.mensagem)
      router.refresh()
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="touch"
            className="w-full text-destructive"
            disabled={pendente}
          />
        }
      >
        {pendente ? <Spinner /> : <XIcon />}
        Cancelar pedido
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar o pedido {numero}?</AlertDialogTitle>
          <AlertDialogDescription>
            Só é possível cancelar antes do preparo começar.
            {estornara && " O valor pago será estornado (simulação)."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="touch">Manter pedido</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="touch"
            onClick={cancelar}
          >
            Sim, cancelar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
