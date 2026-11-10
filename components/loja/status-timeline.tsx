import { CheckIcon, XIcon } from "lucide-react"

import { formatDataHora } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { EtapaLinhaDoTempo } from "@/models/domain/status"

/** Linha do tempo vertical com data/hora de cada etapa (US-13 CA#1). */
export function StatusTimeline({ etapas }: { etapas: EtapaLinhaDoTempo[] }) {
  return (
    <ol className="flex flex-col" aria-label="Andamento do pedido">
      {etapas.map((e, i) => {
        const ultima = i === etapas.length - 1
        const cancelado = e.status === "CANCELADO"
        return (
          <li
            key={e.status}
            className="flex gap-3"
            aria-current={e.estado === "atual" ? "step" : undefined}
          >
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2",
                  e.estado === "feito" &&
                    "border-primary bg-primary text-primary-foreground",
                  e.estado === "atual" &&
                    !cancelado &&
                    "border-primary bg-background text-primary",
                  e.estado === "pendente" &&
                    "border-muted-foreground/30 bg-background",
                  cancelado && "border-destructive bg-destructive text-white"
                )}
              >
                {e.estado === "feito" && (
                  <CheckIcon className="size-4" aria-hidden />
                )}
                {e.estado === "atual" && !cancelado && (
                  <span className="size-2.5 animate-pulse rounded-full bg-primary" />
                )}
                {cancelado && <XIcon className="size-4" aria-hidden />}
              </span>
              {!ultima && (
                <span
                  className={cn(
                    "min-h-6 w-0.5 flex-1",
                    e.estado === "feito"
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
            <div className={cn("flex flex-col pb-5", ultima && "pb-0")}>
              <span
                className={cn(
                  "leading-7 font-medium",
                  e.estado === "pendente" && "text-muted-foreground",
                  cancelado && "text-destructive"
                )}
              >
                {e.rotulo}
                <span className="sr-only">
                  {e.estado === "feito"
                    ? " (concluído)"
                    : e.estado === "atual"
                      ? " (etapa atual)"
                      : " (aguardando)"}
                </span>
              </span>
              {e.quando && (
                <span className="text-xs text-muted-foreground">
                  {formatDataHora(e.quando)}
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
