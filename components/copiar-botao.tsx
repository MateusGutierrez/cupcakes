"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

type Props = {
  texto: string
  rotulo: string
  mensagem?: string
  className?: string
}

/** Copia um texto para a área de transferência, com confirmação visual. */
export function CopiarBotao({
  texto,
  rotulo,
  mensagem = "Copiado!",
  className,
}: Props) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      toast.success(mensagem)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast.error("Não foi possível copiar. Selecione e copie manualmente.")
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="touch"
      onClick={copiar}
      className={className}
    >
      {copiado ? <CheckIcon /> : <CopyIcon />}
      {rotulo}
    </Button>
  )
}
