"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { confirmarPix } from "@/controllers/pagamento.actions"

/** Botão de demonstração: simula o banco avisando que o PIX caiu. */
export function SimularPixBotao({ numero }: { numero: string }) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()

  return (
    <Button
      size="touch"
      disabled={pendente}
      onClick={() =>
        iniciar(async () => {
          const r = await confirmarPix(numero)
          if (r.ok) toast.success(r.mensagem)
          else toast.error(r.mensagem)
          router.refresh()
        })
      }
    >
      {pendente && <Spinner />}
      Simular pagamento recebido
    </Button>
  )
}
