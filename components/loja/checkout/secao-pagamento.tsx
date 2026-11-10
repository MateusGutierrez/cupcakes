"use client"

import { BanknoteIcon, CreditCardIcon, QrCodeIcon } from "lucide-react"
import { type Control, Controller, type UseFormRegister } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  CARTAO_APROVADO_EXEMPLO,
  CARTAO_RECUSADO_EXEMPLO,
} from "@/models/domain/pagamento"
import type {
  PedidoDados,
  PedidoEntrada,
} from "@/models/schemas/checkout.schema"

const OPCOES = [
  {
    valor: "CARTAO",
    titulo: "Cartão de crédito",
    desc: "Aprovação na hora",
    icone: CreditCardIcon,
  },
  {
    valor: "PIX",
    titulo: "PIX",
    desc: "QR Code após confirmar",
    icone: QrCodeIcon,
  },
  {
    valor: "DINHEIRO",
    titulo: "Dinheiro",
    desc: "Pague na entrega ou retirada",
    icone: BanknoteIcon,
  },
] as const

const mascaraCartao = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
const mascaraValidade = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

type Props = {
  control: Control<PedidoEntrada, unknown, PedidoDados>
  register: UseFormRegister<PedidoEntrada>
  forma: PedidoEntrada["formaPagamento"] | undefined
  erro: (campo: string) => string | undefined
  /** Mensagem de recusa vinda do servidor (RN#23) */
  recusa?: string
}

// US-11 — pagamento simulado
export function SecaoPagamento({
  control,
  register,
  forma,
  erro,
  recusa,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {recusa && (
        // CA#4: mensagem clara; carrinho preservado e método pode ser trocado
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {recusa}
        </p>
      )}

      <Controller
        control={control}
        name="formaPagamento"
        render={({ field }) => (
          <RadioGroup
            value={field.value ?? null}
            onValueChange={(v) => field.onChange(v)}
            className="grid gap-2 sm:grid-cols-3"
            aria-label="Forma de pagamento"
          >
            {OPCOES.map(({ valor, titulo, desc, icone: Icone }) => (
              <FieldLabel key={valor} htmlFor={`pag-${valor}`}>
                <Field orientation="horizontal" className="min-h-11">
                  <RadioGroupItem id={`pag-${valor}`} value={valor} />
                  <FieldContent>
                    <FieldTitle>
                      <Icone className="size-4" aria-hidden /> {titulo}
                    </FieldTitle>
                    <FieldDescription>{desc}</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        )}
      />
      <FieldError>{erro("formaPagamento")}</FieldError>

      {forma === "CARTAO" && (
        <FieldGroup>
          <p className="rounded-lg bg-muted p-3 text-xs">
            Demonstração: use{" "}
            <strong className="font-mono">{CARTAO_APROVADO_EXEMPLO}</strong>{" "}
            (aprovado) ou{" "}
            <strong className="font-mono">{CARTAO_RECUSADO_EXEMPLO}</strong>{" "}
            (recusado), com qualquer validade futura e CVV.
          </p>
          <Controller
            control={control}
            name="cartaoNumero"
            render={({ field }) => (
              <Field data-invalid={Boolean(erro("cartaoNumero"))}>
                <FieldLabel htmlFor="cartaoNumero">Número do cartão</FieldLabel>
                <Input
                  id="cartaoNumero"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  aria-invalid={Boolean(erro("cartaoNumero"))}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(mascaraCartao(e.target.value))
                  }
                />
                <FieldError>{erro("cartaoNumero")}</FieldError>
              </Field>
            )}
          />
          <Field data-invalid={Boolean(erro("cartaoNome"))}>
            <FieldLabel htmlFor="cartaoNome">
              Nome impresso no cartão
            </FieldLabel>
            <Input
              id="cartaoNome"
              autoComplete="cc-name"
              autoCapitalize="characters"
              aria-invalid={Boolean(erro("cartaoNome"))}
              {...register("cartaoNome")}
            />
            <FieldError>{erro("cartaoNome")}</FieldError>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Controller
              control={control}
              name="cartaoValidade"
              render={({ field }) => (
                <Field data-invalid={Boolean(erro("cartaoValidade"))}>
                  <FieldLabel htmlFor="cartaoValidade">Validade</FieldLabel>
                  <Input
                    id="cartaoValidade"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/AA"
                    aria-invalid={Boolean(erro("cartaoValidade"))}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(mascaraValidade(e.target.value))
                    }
                  />
                  <FieldError>{erro("cartaoValidade")}</FieldError>
                </Field>
              )}
            />
            <Field data-invalid={Boolean(erro("cartaoCvv"))}>
              <FieldLabel htmlFor="cartaoCvv">CVV</FieldLabel>
              <Input
                id="cartaoCvv"
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={4}
                aria-invalid={Boolean(erro("cartaoCvv"))}
                {...register("cartaoCvv")}
              />
              <FieldError>{erro("cartaoCvv")}</FieldError>
            </Field>
          </div>
          <FieldDescription>
            Só guardamos os 4 últimos dígitos do cartão.
          </FieldDescription>
        </FieldGroup>
      )}

      {forma === "PIX" && (
        <p className="rounded-lg bg-muted p-3 text-sm">
          Ao confirmar, mostramos o QR Code e o código copia e cola. O pedido
          vai para a cozinha assim que o pagamento for confirmado.
        </p>
      )}

      {forma === "DINHEIRO" && (
        <Field data-invalid={Boolean(erro("trocoPara"))}>
          <FieldLabel htmlFor="trocoPara">Troco para (opcional)</FieldLabel>
          <Input
            id="trocoPara"
            inputMode="decimal"
            placeholder="Ex.: 100,00"
            aria-invalid={Boolean(erro("trocoPara"))}
            {...register("trocoPara")}
          />
          <FieldDescription>
            Deixe em branco se não precisar de troco.
          </FieldDescription>
          <FieldError>{erro("trocoPara")}</FieldError>
        </Field>
      )}
    </div>
  )
}
