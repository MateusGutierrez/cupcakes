"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

/** Mostra um toast uma única vez ao montar (ex.: "Produto salvo" após redirect). */
export function ToastAoCarregar({ mensagem }: { mensagem?: string }) {
  const mostrado = useRef(false)
  useEffect(() => {
    if (mensagem && !mostrado.current) {
      mostrado.current = true
      toast.success(mensagem)
    }
  }, [mensagem])
  return null
}
