"use client"

import { useSyncExternalStore } from "react"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import {
  adicionarItem,
  alterarQuantidade,
  type ItemCarrinho,
  removerItem,
} from "@/models/domain/carrinho"

type EstadoCarrinho = {
  itens: ItemCarrinho[]
  /** Retorna true se a quantidade foi limitada pela capacidade. */
  adicionar: (
    item: Omit<ItemCarrinho, "quantidade">,
    quantidade: number
  ) => boolean
  alterarQtd: (produtoId: number, quantidade: number) => boolean
  remover: (produtoId: number) => void
  limpar: () => void
  /** Substitui os itens pela versão revalidada no servidor. */
  substituir: (itens: ItemCarrinho[]) => void
}

// RN#15: carrinho do visitante fica no navegador (localStorage)
export const useCarrinho = create<EstadoCarrinho>()(
  persist(
    (set, get) => ({
      itens: [],
      adicionar: (item, quantidade) => {
        const r = adicionarItem(get().itens, item, quantidade)
        set({ itens: r.itens })
        return r.limitado
      },
      alterarQtd: (produtoId, quantidade) => {
        const r = alterarQuantidade(get().itens, produtoId, quantidade)
        set({ itens: r.itens })
        return r.limitado
      },
      remover: (produtoId) =>
        set({ itens: removerItem(get().itens, produtoId) }),
      limpar: () => set({ itens: [] }),
      substituir: (itens) => set({ itens }),
    }),
    {
      name: "cupcakes-carrinho",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ itens: s.itens }),
      // Hidratação manual (HidratarCarrinho) para o HTML do servidor bater com o do cliente
      skipHydration: true,
    }
  )
)

/** true depois que o carrinho salvo foi lido do localStorage. */
export function useCarrinhoHidratado() {
  return useSyncExternalStore(
    (avisar) => useCarrinho.persist.onFinishHydration(avisar),
    () => useCarrinho.persist.hasHydrated(),
    () => false
  )
}
