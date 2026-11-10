"use client"

import { MinusIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = {
  valor: number
  onChange: (valor: number) => void
  min?: number
  max: number
  disabled?: boolean
  rotulo?: string
}

/** Seletor de quantidade com botões de 44px. */
export function QuantidadeStepper({
  valor,
  onChange,
  min = 1,
  max,
  disabled,
  rotulo = "Quantidade",
}: Props) {
  return (
    <div
      role="group"
      aria-label={rotulo}
      className="flex items-center rounded-md border"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-touch"
        aria-label="Diminuir quantidade"
        disabled={disabled || valor <= min}
        onClick={() => onChange(valor - 1)}
      >
        <MinusIcon />
      </Button>
      <output
        aria-live="polite"
        className="w-8 text-center text-base font-semibold tabular-nums"
      >
        {valor}
      </output>
      <Button
        type="button"
        variant="ghost"
        size="icon-touch"
        aria-label="Aumentar quantidade"
        disabled={disabled || valor >= max}
        onClick={() => onChange(valor + 1)}
      >
        <PlusIcon />
      </Button>
    </div>
  )
}
