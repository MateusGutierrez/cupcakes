"use client"

import { useEffect } from "react"

import { useCarrinho } from "@/stores/carrinho.store"

/** Lê o carrinho salvo no navegador depois da primeira renderização. */
export function HidratarCarrinho() {
  useEffect(() => {
    void useCarrinho.persist.rehydrate()
  }, [])
  return null
}
