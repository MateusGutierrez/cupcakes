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
import { entrar } from "@/controllers/auth.actions"
import { useFormAction } from "@/hooks/use-form-action"

export function LoginForm({ de }: { de?: string }) {
  const { estado, onSubmit, pendente: enviando } = useFormAction(entrar)

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
        {de && <input type="hidden" name="de" value={de} />}
        <Field data-invalid={Boolean(estado.erros?.email)}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            required
            aria-invalid={Boolean(estado.erros?.email)}
          />
          <FieldError>{estado.erros?.email?.[0]}</FieldError>
        </Field>
        <Field data-invalid={Boolean(estado.erros?.senha)}>
          <FieldLabel htmlFor="senha">Senha</FieldLabel>
          <Input
            id="senha"
            name="senha"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(estado.erros?.senha)}
          />
          <FieldError>{estado.erros?.senha?.[0]}</FieldError>
        </Field>
        <Button
          type="submit"
          size="touch"
          disabled={enviando}
          className="w-full"
        >
          {enviando && <Spinner />}
          {enviando ? "Entrando…" : "Entrar"}
        </Button>
      </FieldGroup>
    </form>
  )
}
