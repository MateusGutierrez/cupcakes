"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { revalidarCarrinho } from "@/controllers/carrinho.actions"
import { useCarrinho, useCarrinhoHidratado } from "@/stores/carrinho.store"

/**
 * Ao montar, confere o carrinho local com o servidor (preço, capacidade, produtos
 * removidos) e mostra os avisos. Retorna true enquanto a conferência não terminou.
 */
export function useRevalidarCarrinho() {
  const hidratado = useCarrinhoHidratado()
  const [conferindo, setConferindo] = useState(true)
  const feito = useRef(false)

  useEffect(() => {
    if (!hidratado || feito.current) return
    feito.current = true
    async function conferir() {
      const enviados = useCarrinho.getState().itens
      if (enviados.length === 0) return
      const r = await revalidarCarrinho(enviados)
      // Se a pessoa mexeu no carrinho enquanto esperava, a resposta está
      // desatualizada: confere de novo com o estado atual em vez de sobrescrever.
      if (useCarrinho.getState().itens !== enviados) return conferir()
      useCarrinho.getState().substituir(r.itens)
      r.avisos.forEach((a) => toast.warning(a))
    }
    conferir()
      .catch(() => toast.error("Não foi possível conferir o carrinho agora."))
      .finally(() => setConferindo(false))
  }, [hidratado])

  const vazio = useCarrinho((s) => s.itens.length === 0)
  return !hidratado || (conferindo && !vazio)
}
