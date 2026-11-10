"use client"

import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"

import { Switch } from "@/components/ui/switch"
import { alterarAtivo } from "@/controllers/admin-produto.actions"

type Props = { id: number; nome: string; ativo: boolean }

/** Ativa/pausa o produto direto da lista (RN#35). Área de toque de 44px. */
export function SwitchAtivo({ id, nome, ativo }: Props) {
  const [pendente, iniciar] = useTransition()
  const [otimista, setOtimista] = useOptimistic(ativo)

  function alternar(novo: boolean) {
    iniciar(async () => {
      setOtimista(novo)
      const r = await alterarAtivo(id, novo)
      if (r.ok) toast.success(r.mensagem)
      else toast.error(r.mensagem ?? "Não foi possível alterar.")
    })
  }

  return (
    <label className="flex h-11 cursor-pointer items-center gap-2 text-sm">
      <Switch
        checked={otimista}
        onCheckedChange={alternar}
        disabled={pendente}
        aria-label={`${otimista ? "Pausar" : "Ativar"} ${nome}`}
      />
      <span
        className={
          otimista ? "font-medium text-foreground" : "text-muted-foreground"
        }
      >
        {otimista ? "Ativo" : "Pausado"}
      </span>
    </label>
  )
}
