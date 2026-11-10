"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Recarrega os dados do servidor periodicamente (polling), substituindo o push
 * da RNF#24. Pausa com a aba em segundo plano e atualiza ao voltar.
 */
export function AtualizacaoAutomatica({
  segundos = 20,
}: {
  segundos?: number
}) {
  const router = useRouter()

  useEffect(() => {
    const atualizar = () => {
      if (document.visibilityState === "visible") router.refresh()
    }
    const id = setInterval(atualizar, segundos * 1000)
    document.addEventListener("visibilitychange", atualizar)
    return () => {
      clearInterval(id)
      document.removeEventListener("visibilitychange", atualizar)
    }
  }, [router, segundos])

  return null
}
