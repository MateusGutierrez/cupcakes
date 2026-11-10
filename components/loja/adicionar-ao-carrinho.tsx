"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { formatBRL } from "@/lib/format"

import { QuantidadeStepper } from "./quantidade-stepper"

type Props = {
  produto: { id: number; nome: string; precoCentavos: number }
  disponivel: number
}

/** Barra fixa com quantidade + "Adicionar". Fica acima da BottomNav no celular. */
export function AdicionarAoCarrinho({ produto, disponivel }: Props) {
  const [qtd, setQtd] = useState(1)
  const indisponivel = disponivel === 0

  function adicionar() {
    // TODO(Fase 2): adicionar ao carrinho.store
    toast.success(`${qtd}× ${produto.nome} adicionado ao carrinho`)
  }

  return (
    <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t bg-background/95 px-4 py-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
      {/* US-06 CA#3 */}
      {indisponivel ? (
        <div className="flex flex-col gap-2">
          <p role="status" className="text-sm font-medium text-destructive">
            Indisponível hoje — a produção do dia esgotou.
          </p>
          <Button size="touch" disabled className="w-full">
            Indisponível
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <QuantidadeStepper valor={qtd} onChange={setQtd} max={disponivel} />
          <Button size="touch" className="flex-1" onClick={adicionar}>
            Adicionar · {formatBRL(produto.precoCentavos * qtd)}
          </Button>
        </div>
      )}
    </div>
  )
}
