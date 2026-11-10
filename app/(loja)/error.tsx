"use client"

import { TriangleAlertIcon } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

// US-03 CA#4 — falha ao carregar com opção de tentar novamente
export default function ErroLoja({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>Não foi possível carregar</EmptyTitle>
        <EmptyDescription>
          Verifique sua conexão e tente de novo.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="touch" onClick={() => retry()}>
          Tentar novamente
        </Button>
      </EmptyContent>
    </Empty>
  )
}
