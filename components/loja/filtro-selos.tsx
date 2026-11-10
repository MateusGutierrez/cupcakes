import Link from "next/link"

import { cn } from "@/lib/utils"
import { SELOS, type Selo } from "@/models/domain/catalogo"

type Props = { seloAtivo?: Selo; busca?: string }

function hrefCom(selo: Selo | undefined, busca: string | undefined) {
  const params = new URLSearchParams()
  if (busca) params.set("busca", busca)
  if (selo) params.set("selo", selo)
  const qs = params.toString()
  return qs ? `/?${qs}` : "/"
}

/** Chips de filtro por selo; rolam na horizontal no celular. */
export function FiltroSelos({ seloAtivo, busca }: Props) {
  const opcoes = [{ chave: undefined, rotulo: "Todos" }, ...SELOS]
  return (
    <nav
      aria-label="Filtrar por restrição"
      className="-mx-4 [scrollbar-width:none] overflow-x-auto px-4"
    >
      <ul className="flex w-max gap-2">
        {opcoes.map(({ chave, rotulo }) => {
          const ativo = seloAtivo === chave
          return (
            <li key={rotulo}>
              <Link
                href={hrefCom(chave, busca)}
                scroll={false}
                aria-current={ativo ? "true" : undefined}
                className={cn(
                  "flex h-11 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
                  ativo
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                )}
              >
                {rotulo}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
