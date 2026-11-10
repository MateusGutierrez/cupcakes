"use client"

import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
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
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { salvarProduto } from "@/controllers/admin-produto.actions"
import type { Produto } from "@/generated/prisma/browser"
import { useFormAction } from "@/hooks/use-form-action"
import { centavosParaCampo } from "@/models/domain/dinheiro"

type Props = { produto?: Produto }

const OPCOES = [
  { name: "semGluten", titulo: "Sem glúten", desc: "Exibe o selo na vitrine" },
  {
    name: "semLactose",
    titulo: "Sem lactose",
    desc: "Exibe o selo na vitrine",
  },
  { name: "vegano", titulo: "Vegano", desc: "Exibe o selo na vitrine" },
  { name: "destaque", titulo: "Destaque", desc: "Aparece primeiro na vitrine" },
] as const

/** Campo com label, erro destacado (US-16 CA#2) e descrição opcional. */
function Campo({
  name,
  label,
  descricao,
  erro,
  children,
}: {
  name: string
  label: string
  descricao?: string
  erro?: string
  children: React.ReactNode
}) {
  return (
    <Field data-invalid={Boolean(erro)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {children}
      {descricao && !erro && <FieldDescription>{descricao}</FieldDescription>}
      <FieldError>{erro}</FieldError>
    </Field>
  )
}

export function ProdutoForm({ produto }: Props) {
  const { estado, onSubmit, pendente } = useFormAction(
    salvarProduto.bind(null, produto?.id ?? null)
  )
  const erro = (campo: string) => estado.erros?.[campo]?.[0]

  const inv = (campo: string) => ({ "aria-invalid": Boolean(erro(campo)) })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {estado.mensagem && !estado.ok && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {estado.mensagem}
        </p>
      )}

      <FieldSet className="rounded-lg border bg-background p-4">
        <FieldLegend>Informações</FieldLegend>
        <FieldGroup>
          <Campo name="nome" erro={erro("nome")} label="Nome">
            <Input
              id="nome"
              name="nome"
              defaultValue={produto?.nome}
              required
              {...inv("nome")}
            />
          </Campo>
          <Campo name="descricao" erro={erro("descricao")} label="Descrição">
            <Textarea
              id="descricao"
              name="descricao"
              defaultValue={produto?.descricao}
              rows={3}
              {...inv("descricao")}
            />
          </Campo>
          <Campo
            name="ingredientes"
            erro={erro("ingredientes")}
            label="Ingredientes"
          >
            <Textarea
              id="ingredientes"
              name="ingredientes"
              defaultValue={produto?.ingredientes}
              rows={2}
              {...inv("ingredientes")}
            />
          </Campo>
          <Campo
            name="alergenicos"
            erro={erro("alergenicos")}
            label="Alergênicos (obrigatório)"
            descricao="Ex.: Contém glúten, ovos e leite. Se não houver, escreva “Não contém alergênicos”."
          >
            <Input
              id="alergenicos"
              name="alergenicos"
              defaultValue={produto?.alergenicos}
              required
              {...inv("alergenicos")}
            />
          </Campo>
          <Campo
            name="imagemUrl"
            erro={erro("imagemUrl")}
            label="Imagem (URL)"
            descricao="Caminho local (/produtos/...) ou URL https://. Vazio usa uma imagem padrão."
          >
            <Input
              id="imagemUrl"
              name="imagemUrl"
              type="url"
              inputMode="url"
              defaultValue={produto?.imagemUrl}
              {...inv("imagemUrl")}
            />
          </Campo>
        </FieldGroup>
      </FieldSet>

      <FieldSet className="rounded-lg border bg-background p-4">
        <FieldLegend>Preço e produção</FieldLegend>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Campo
            name="precoCentavos"
            erro={erro("precoCentavos")}
            label="Preço (R$)"
          >
            <Input
              id="precoCentavos"
              name="precoCentavos"
              inputMode="decimal"
              placeholder="12,50"
              defaultValue={
                produto ? centavosParaCampo(produto.precoCentavos) : ""
              }
              required
              {...inv("precoCentavos")}
            />
          </Campo>
          <Campo
            name="limiteDiario"
            erro={erro("limiteDiario")}
            label="Limite diário (unidades)"
            descricao="0 = indisponível"
          >
            <Input
              id="limiteDiario"
              name="limiteDiario"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={produto?.limiteDiario ?? 20}
              {...inv("limiteDiario")}
            />
          </Campo>
          <Campo
            name="antecedenciaHoras"
            erro={erro("antecedenciaHoras")}
            label="Antecedência (horas)"
            descricao="0 = pronta entrega; 48 = pré-encomenda"
          >
            <Input
              id="antecedenciaHoras"
              name="antecedenciaHoras"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={produto?.antecedenciaHoras ?? 0}
              {...inv("antecedenciaHoras")}
            />
          </Campo>
          <Campo
            name="colecao"
            erro={erro("colecao")}
            label="Coleção (opcional)"
            descricao="Ex.: Natal 2026"
          >
            <Input
              id="colecao"
              name="colecao"
              defaultValue={produto?.colecao ?? ""}
              {...inv("colecao")}
            />
          </Campo>
        </FieldGroup>
      </FieldSet>

      <FieldSet className="rounded-lg border bg-background p-4">
        <FieldLegend>Selos e destaque</FieldLegend>
        <FieldGroup className="grid gap-2 sm:grid-cols-2">
          {OPCOES.map((o) => (
            <FieldLabel key={o.name} htmlFor={o.name}>
              <Field orientation="horizontal" className="min-h-11">
                <FieldContent>
                  <FieldTitle>{o.titulo}</FieldTitle>
                  <FieldDescription>{o.desc}</FieldDescription>
                </FieldContent>
                <Switch
                  id={o.name}
                  name={o.name}
                  defaultChecked={produto?.[o.name] ?? false}
                />
              </Field>
            </FieldLabel>
          ))}
        </FieldGroup>
      </FieldSet>

      {!produto && (
        <p className="text-sm text-muted-foreground">
          O produto é criado <strong>inativo</strong>. Ative na lista quando
          quiser que apareça na vitrine.
        </p>
      )}

      {/* Barra de ações fixa no rodapé */}
      <div className="sticky bottom-0 -mx-4 flex gap-2 border-t bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:mx-0 md:justify-end md:border-0 md:bg-transparent md:p-0">
        <Link
          href="/admin/produtos"
          className={buttonVariants({
            variant: "outline",
            size: "touch",
            className: "flex-1 md:flex-none",
          })}
        >
          Cancelar
        </Link>
        <Button
          type="submit"
          size="touch"
          disabled={pendente}
          className="flex-1 md:flex-none"
        >
          {pendente && <Spinner />}
          {pendente ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
