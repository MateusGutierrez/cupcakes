"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { formatBRL } from "@/lib/format"
import type { ItemCarrinho } from "@/models/domain/carrinho"
import { useCarrinho } from "@/stores/carrinho.store"

import { QuantidadeStepper } from "./quantidade-stepper"

type Props = {
  produto: Omit<ItemCarrinho, "quantidade" | "maximo">
  disponivel: number
}

/** Barra fixa com quantidade + "Adicionar". Fica acima da BottomNav no celular. */
export function AdicionarAoCarrinho({ produto, disponivel }: Props) {
  const router = useRouter()
  const adicionar = useCarrinho((s) => s.adicionar)
  const [qtd, setQtd] = useState(1)
  const indisponivel = disponivel === 0

  function onAdicionar() {
    const limitado = adicionar({ ...produto, maximo: disponivel }, qtd)
    const acao = {
      label: "Ver carrinho",
      onClick: () => router.push("/carrinho"),
    }
    if (limitado) {
      // US-07 CA#3 / RN#14
      toast.warning(
        `Só temos ${disponivel} unidade(s) de ${produto.nome} hoje.`,
        {
          description: "Ajustamos a quantidade no seu carrinho.",
          action: acao,
        }
      )
    } else {
      toast.success(`${qtd}× ${produto.nome} no carrinho`, { action: acao })
    }
    setQtd(1)
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
          <Button size="touch" className="flex-1" onClick={onAdicionar}>
            Adicionar · {formatBRL(produto.precoCentavos * qtd)}
          </Button>
        </div>
      )}
    </div>
  )
}
