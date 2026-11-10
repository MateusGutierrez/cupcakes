"use client"

import { LoaderCircleIcon, SearchIcon } from "lucide-react"
import Form from "next/form"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useTransition } from "react"

import { Input } from "@/components/ui/input"
import type { Selo } from "@/models/domain/catalogo"

type Props = {
  busca?: string
  selo?: Selo
  /** Foca o campo ao abrir (quando o usuário toca em "Buscar" na navegação). */
  focar?: boolean
}

/** Espera entre teclas antes de buscar (RNF#12). */
const ESPERA_MS = 300

function urlDaBusca(busca: string, selo?: Selo) {
  const params = new URLSearchParams()
  // Mantém "?busca=" (mesmo vazio) para continuar no modo busca da navegação
  params.set("busca", busca)
  if (selo) params.set("selo", selo)
  return `/?${params}`
}

// US-05 — busca enquanto digita; o <Form> continua funcionando sem JavaScript
export function BuscaForm({ busca, selo, focar }: Props) {
  const router = useRouter()
  const ref = useRef<HTMLInputElement>(null)
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [buscando, iniciar] = useTransition()

  useEffect(() => {
    if (focar) ref.current?.focus()
  }, [focar])

  useEffect(() => () => clearTimeout(espera.current), [])

  function aoDigitar(valor: string) {
    clearTimeout(espera.current)
    espera.current = setTimeout(() => {
      iniciar(() =>
        router.replace(urlDaBusca(valor.trim(), selo), { scroll: false })
      )
    }, ESPERA_MS)
  }

  const Icone = buscando ? LoaderCircleIcon : SearchIcon

  return (
    <Form action="/" role="search" className="relative">
      <label htmlFor="busca" className="sr-only">
        Buscar cupcakes
      </label>
      <Icone
        className={`pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-muted-foreground ${buscando ? "animate-spin" : ""}`}
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
        onChange={(e) => aoDigitar(e.target.value)}
        aria-busy={buscando}
        className="pr-10 [&::-webkit-search-cancel-button]:hidden"
      />
      {selo && <input type="hidden" name="selo" value={selo} />}
    </Form>
  )
}
