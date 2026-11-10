"use client"

import { SearchIcon } from "lucide-react"
import Form from "next/form"
import { useEffect, useRef } from "react"

import { Input } from "@/components/ui/input"
import type { Selo } from "@/models/domain/catalogo"

type Props = {
  busca?: string
  selo?: Selo
  /** Foca o campo ao abrir (quando o usuário toca em "Buscar" na navegação). */
  focar?: boolean
}

export function BuscaForm({ busca, selo, focar }: Props) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focar) ref.current?.focus()
  }, [focar])

  return (
    <Form action="/" role="search" className="relative">
      <label htmlFor="busca" className="sr-only">
        Buscar cupcakes
      </label>
      <SearchIcon
        className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={ref}
        id="busca"
        name="busca"
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder="Buscar por nome ou sabor"
        defaultValue={busca}
        className="pl-10"
      />
      {selo && <input type="hidden" name="selo" value={selo} />}
    </Form>
  )
}
