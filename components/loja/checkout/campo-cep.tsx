"use client"

import { LoaderCircleIcon } from "lucide-react"
import { useRef, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { consultarCEP, type ResultadoCEP } from "@/controllers/entrega.actions"
import { formatBRL, formatCEP } from "@/lib/format"
import { cepValido, normalizarCEP } from "@/models/domain/entrega"

type Props = {
  valor: string
  onChange: (valor: string) => void
  onBlur: () => void
  erro?: string
  resultado: ResultadoCEP | null
  onResultado: (r: ResultadoCEP | null) => void
  /** Endereço encontrado no ViaCEP, para preencher rua e bairro. */
  onEndereco: (e: { rua: string; bairro: string }) => void
  onEscolherRetirada: () => void
}

/** Autopreenchimento opcional (US-09 CA#4): se falhar, o cliente digita o endereço. */
async function buscarViaCEP(cep: string) {
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(4000),
    })
    const dados: { logradouro?: string; bairro?: string; erro?: boolean } =
      await r.json()
    return dados.erro
      ? null
      : { rua: dados.logradouro ?? "", bairro: dados.bairro ?? "" }
  } catch {
    return null
  }
}

export function CampoCEP({
  valor,
  onChange,
  onBlur,
  erro,
  resultado,
  onResultado,
  onEndereco,
  onEscolherRetirada,
}: Props) {
  const [consultando, iniciar] = useTransition()
  const [erroFormato, setErroFormato] = useState<string>()
  const ultimo = useRef<string | null>(null)

  function consultar(cep: string) {
    const digitos = normalizarCEP(cep)
    if (!digitos || digitos === ultimo.current) return
    ultimo.current = digitos
    iniciar(async () => {
      const [r, endereco] = await Promise.all([
        consultarCEP(digitos),
        buscarViaCEP(digitos),
      ])
      onResultado(r)
      if (r.ok && endereco) onEndereco(endereco)
    })
  }

  function alterar(texto: string) {
    const formatado = formatCEP(texto)
    onChange(formatado)
    setErroFormato(undefined)
    if (normalizarCEP(formatado) !== ultimo.current) {
      ultimo.current = null
      onResultado(null)
    }
    // Consulta assim que os 8 dígitos são digitados
    if (cepValido(formatado)) consultar(formatado)
  }

  function sair() {
    onBlur()
    // US-09 CA#3: formato inválido mostra erro sem consultar o banco
    if (valor && !cepValido(valor))
      setErroFormato("CEP inválido (use 00000-000)")
  }

  const mensagemErro = erroFormato ?? erro

  return (
    <Field data-invalid={Boolean(mensagemErro)}>
      <FieldLabel htmlFor="cep">CEP</FieldLabel>
      <div className="relative">
        <Input
          id="cep"
          name="cep"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={valor}
          onChange={(e) => alterar(e.target.value)}
          onBlur={sair}
          aria-invalid={Boolean(mensagemErro)}
          aria-describedby="cep-resultado"
        />
        {consultando && (
          <LoaderCircleIcon
            className="absolute top-1/2 right-3 size-5 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-label="Consultando CEP"
          />
        )}
      </div>
      <FieldError>{mensagemErro}</FieldError>
      <div id="cep-resultado" aria-live="polite">
        {resultado?.ok && (
          // CA#1
          <FieldDescription className="text-foreground">
            Entregamos em <strong>{resultado.area}</strong> · frete{" "}
            {formatBRL(resultado.freteCentavos)}
          </FieldDescription>
        )}
        {resultado && !resultado.ok && resultado.motivo === "fora" && (
          // CA#2 / RN#18: fora da área → sugere retirada
          <div className="flex flex-col gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <p>
              Ainda não entregamos nesse CEP. Você pode retirar seu pedido na
              loja, sem frete.
            </p>
            <Button
              type="button"
              variant="outline"
              size="touch"
              onClick={onEscolherRetirada}
            >
              Retirar na loja
            </Button>
          </div>
        )}
      </div>
    </Field>
  )
}
