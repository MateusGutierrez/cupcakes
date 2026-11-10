"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { StoreIcon, TruckIcon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import type { ResultadoCEP } from "@/controllers/entrega.actions"
import { useRevalidarCarrinho } from "@/hooks/use-revalidar-carrinho"
import { formatBRL, formatTelefone } from "@/lib/format"
import { LOJA } from "@/lib/loja"
import { calcularTotais, maiorAntecedencia } from "@/models/domain/carrinho"
import {
  type CheckoutDados,
  type CheckoutEntrada,
  checkoutSchema,
} from "@/models/schemas/checkout.schema"
import { useCarrinho } from "@/stores/carrinho.store"

import { CarrinhoVazio } from "../carrinho-vazio"
import { CampoCEP } from "./campo-cep"
import { ResumoPedido } from "./resumo-pedido"
import { SeletorData } from "./seletor-data"

const SECAO = "rounded-xl border bg-card p-4"

// US-02, US-10 — checkout como convidado, em página única (RNF#05)
export function CheckoutForm() {
  const carregando = useRevalidarCarrinho()
  const itens = useCarrinho((s) => s.itens)
  const [cep, setCep] = useState<ResultadoCEP | null>(null)

  const form = useForm<CheckoutEntrada, unknown, CheckoutDados>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: {
      modalidade: "ENTREGA",
      nome: "",
      email: "",
      telefone: "",
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      data: "",
      observacao: "",
    },
  })
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState,
  } = form
  // Os campos de entrega só existem num dos lados da união; acesso genérico às mensagens
  const erro = (campo: string) =>
    (formState.errors as Record<string, { message?: string } | undefined>)[
      campo
    ]?.message

  const [modalidade, data, horario] = useWatch({
    control,
    name: ["modalidade", "data", "horario"],
  })
  const retirada = modalidade === "RETIRADA"
  // RN#20: retirada zera o frete
  const frete = retirada ? 0 : cep?.ok ? cep.freteCentavos : null
  const totais = calcularTotais(itens, frete ?? 0)

  if (carregando && itens.length === 0) {
    return <Skeleton className="h-96 w-full rounded-xl" aria-busy="true" />
  }
  if (itens.length === 0) return <CarrinhoVazio />

  function onValido(dados: CheckoutDados) {
    if (dados.modalidade === "ENTREGA" && !cep?.ok) {
      setError(
        "cep",
        { message: "Informe um CEP dentro da área de entrega" },
        { shouldFocus: true }
      )
      return
    }
    // TODO(Fase 3): pagamento simulado + finalizarPedido
    toast.success("Dados conferidos!", {
      description: "O pagamento é a próxima etapa.",
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onValido)}
      noValidate
      className="flex flex-col gap-4 pb-24 lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-8 lg:pb-0"
    >
      {/* Celular: no topo; desktop: coluna lateral ocupando todas as linhas */}
      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-stretch">
        <ResumoPedido itens={itens} freteCentavos={frete} retirada={retirada} />
      </div>

      <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1">
        {/* 1. Contato */}
        <FieldSet className={SECAO}>
          <FieldLegend>1. Seus dados</FieldLegend>
          <FieldGroup>
            <Field data-invalid={Boolean(erro("nome"))}>
              <FieldLabel htmlFor="nome">Nome completo</FieldLabel>
              <Input
                id="nome"
                autoComplete="name"
                aria-invalid={Boolean(erro("nome"))}
                {...register("nome")}
              />
              <FieldError>{erro("nome")}</FieldError>
            </Field>
            <Field data-invalid={Boolean(erro("email"))}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-invalid={Boolean(erro("email"))}
                {...register("email")}
              />
              <FieldDescription>
                Para enviar a confirmação e acompanhar o pedido.
              </FieldDescription>
              <FieldError>{erro("email")}</FieldError>
            </Field>
            <Controller
              control={control}
              name="telefone"
              render={({ field }) => (
                <Field data-invalid={Boolean(erro("telefone"))}>
                  <FieldLabel htmlFor="telefone">
                    Telefone (WhatsApp)
                  </FieldLabel>
                  <Input
                    id="telefone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="(11) 98765-4321"
                    aria-invalid={Boolean(erro("telefone"))}
                    {...field}
                    onChange={(e) =>
                      field.onChange(formatTelefone(e.target.value))
                    }
                  />
                  <FieldError>{erro("telefone")}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        {/* 2. Entrega ou retirada */}
        <FieldSet className={SECAO}>
          <FieldLegend>2. Como quer receber?</FieldLegend>
          <Controller
            control={control}
            name="modalidade"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={(v) => field.onChange(v)}
                className="grid gap-2 sm:grid-cols-2"
                aria-label="Modalidade"
              >
                <FieldLabel htmlFor="mod-entrega">
                  <Field orientation="horizontal" className="min-h-11">
                    <RadioGroupItem id="mod-entrega" value="ENTREGA" />
                    <FieldContent>
                      <FieldTitle>
                        <TruckIcon className="size-4" aria-hidden /> Entrega
                      </FieldTitle>
                      <FieldDescription>
                        Frete conforme o bairro
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="mod-retirada">
                  <Field orientation="horizontal" className="min-h-11">
                    <RadioGroupItem id="mod-retirada" value="RETIRADA" />
                    <FieldContent>
                      <FieldTitle>
                        <StoreIcon className="size-4" aria-hidden /> Retirar na
                        loja
                      </FieldTitle>
                      <FieldDescription>Sem frete</FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldLabel>
              </RadioGroup>
            )}
          />

          {retirada ? (
            <p className="rounded-lg bg-muted p-3 text-sm">
              <strong>{LOJA.endereco}</strong>
              <br />
              {LOJA.horarioRetirada}
            </p>
          ) : (
            <FieldGroup className="mt-2">
              <Controller
                control={control}
                name="cep"
                render={({ field }) => (
                  <CampoCEP
                    valor={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    erro={erro("cep")}
                    resultado={cep}
                    onResultado={setCep}
                    onEndereco={({ rua, bairro }) => {
                      if (rua && !getValues("rua"))
                        setValue("rua", rua, { shouldValidate: true })
                      if (bairro && !getValues("bairro"))
                        setValue("bairro", bairro, { shouldValidate: true })
                    }}
                    onEscolherRetirada={() =>
                      setValue("modalidade", "RETIRADA")
                    }
                  />
                )}
              />
              <Field data-invalid={Boolean(erro("rua"))}>
                <FieldLabel htmlFor="rua">Rua</FieldLabel>
                <Input
                  id="rua"
                  autoComplete="address-line1"
                  aria-invalid={Boolean(erro("rua"))}
                  {...register("rua")}
                />
                <FieldError>{erro("rua")}</FieldError>
              </Field>
              <div className="grid grid-cols-[7rem_1fr] gap-3">
                <Field data-invalid={Boolean(erro("numero"))}>
                  <FieldLabel htmlFor="numero">Número</FieldLabel>
                  <Input
                    id="numero"
                    inputMode="numeric"
                    aria-invalid={Boolean(erro("numero"))}
                    {...register("numero")}
                  />
                  <FieldError>{erro("numero")}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="complemento">Complemento</FieldLabel>
                  <Input
                    id="complemento"
                    autoComplete="address-line2"
                    placeholder="Opcional"
                    {...register("complemento")}
                  />
                </Field>
              </div>
              <Field data-invalid={Boolean(erro("bairro"))}>
                <FieldLabel htmlFor="bairro">Bairro</FieldLabel>
                <Input
                  id="bairro"
                  autoComplete="address-level3"
                  aria-invalid={Boolean(erro("bairro"))}
                  {...register("bairro")}
                />
                <FieldError>{erro("bairro")}</FieldError>
              </Field>
            </FieldGroup>
          )}
        </FieldSet>

        {/* 3. Data e horário */}
        <FieldSet className={SECAO}>
          <FieldLegend>3. Quando?</FieldLegend>
          <SeletorData
            data={data ?? ""}
            horario={horario}
            onData={(d) => setValue("data", d, { shouldValidate: true })}
            onHorario={(h) =>
              setValue("horario", h as CheckoutEntrada["horario"], {
                shouldValidate: Boolean(h),
              })
            }
            antecedenciaHoras={maiorAntecedencia(itens)}
            erroData={erro("data")}
            erroHorario={erro("horario")}
          />
          <Field className="mt-2">
            <FieldLabel htmlFor="observacao">Observações</FieldLabel>
            <Textarea
              id="observacao"
              rows={2}
              placeholder="Ex.: interfone 12, mensagem no cartão…"
              {...register("observacao")}
            />
            <FieldError>{erro("observacao")}</FieldError>
          </Field>
        </FieldSet>

        {/* 4. Pagamento — Fase 3 */}
        <FieldSet className={SECAO}>
          <FieldLegend>4. Pagamento</FieldLegend>
          <p className="text-sm text-muted-foreground">
            Cartão, PIX ou dinheiro na entrega.
          </p>
        </FieldSet>
      </div>

      {/* Ação principal fixa no rodapé (celular) */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur lg:static lg:col-start-1 lg:row-start-2 lg:border-0 lg:bg-transparent lg:p-0">
        <div className="flex flex-col lg:hidden">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="font-bold tabular-nums">
            {formatBRL(totais.totalCentavos)}
          </span>
        </div>
        <Button type="submit" size="touch" className="flex-1 lg:w-full">
          Continuar
        </Button>
      </div>
    </form>
  )
}
