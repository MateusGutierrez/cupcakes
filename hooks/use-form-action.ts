"use client"

import { type FormEvent, startTransition, useActionState } from "react"

import { ESTADO_INICIAL, type EstadoAcao } from "@/lib/estado-acao"

/**
 * useActionState sem o reset automático do React 19: em caso de erro de validação
 * os campos continuam preenchidos.
 */
export function useFormAction(
  acao: (anterior: EstadoAcao, dados: FormData) => Promise<EstadoAcao>
) {
  const [estado, despachar, pendente] = useActionState(acao, ESTADO_INICIAL)

  function onSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    startTransition(() => despachar(dados))
  }

  return { estado, onSubmit, pendente }
}
