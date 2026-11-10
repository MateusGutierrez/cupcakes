"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { consultarPedido } from "@/controllers/pedido.actions"
import { useFormAction } from "@/hooks/use-form-action"

export function AcompanharForm({ numero }: { numero?: string }) {
  const { estado, onSubmit, pendente } = useFormAction(consultarPedido)
  const erro = (c: string) => estado.erros?.[c]?.[0]

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        {estado.mensagem && !estado.erros && (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          >
            {estado.mensagem}
          </p>
        )}
        <Field data-invalid={Boolean(erro("numero"))}>
          <FieldLabel htmlFor="numero">Número do pedido</FieldLabel>
          <Input
            id="numero"
            name="numero"
            placeholder="CG-000123"
            autoCapitalize="characters"
            autoComplete="off"
            defaultValue={numero}
            aria-invalid={Boolean(erro("numero"))}
          />
          <FieldError>{erro("numero")}</FieldError>
        </Field>
        <Field data-invalid={Boolean(erro("email"))}>
          <FieldLabel htmlFor="email">E-mail usado no pedido</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={Boolean(erro("email"))}
          />
          <FieldError>{erro("email")}</FieldError>
        </Field>
        <Button
          type="submit"
          size="touch"
          disabled={pendente}
          className="w-full"
        >
          {pendente && <Spinner />}
          Acompanhar
        </Button>
      </FieldGroup>
    </form>
  )
}
