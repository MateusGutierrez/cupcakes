"use client"

import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { ptBR } from "react-day-picker/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatData } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  horariosDisponiveis,
  janelaDeDatas,
  type Horario,
} from "@/models/domain/agenda"

// O calendário trabalha com Date local; o formulário guarda "AAAA-MM-DD"
const paraDate = (dia: string) => {
  const [a, m, d] = dia.split("-").map(Number)
  return new Date(a, m - 1, d)
}
const paraDia = (data: Date) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`

type Props = {
  data: string
  horario: Horario | undefined
  onData: (dia: string) => void
  onHorario: (h: Horario | undefined) => void
  antecedenciaHoras: number
  erroData?: string
  erroHorario?: string
}

/** Data e horário (RN#19): bloqueia datas antes da maior antecedência do carrinho. */
export function SeletorData({
  data,
  horario,
  onData,
  onHorario,
  antecedenciaHoras,
  erroData,
  erroHorario,
}: Props) {
  const [agora] = useState(() => new Date())
  const [aberto, setAberto] = useState(false)
  const { primeiro, ultimo } = janelaDeDatas(agora, antecedenciaHoras)
  const horarios = data
    ? horariosDisponiveis(data, agora, antecedenciaHoras)
    : []

  function escolherData(d: Date | undefined) {
    if (!d) return
    const dia = paraDia(d)
    onData(dia)
    // Se o horário escolhido não existe no novo dia, limpa
    if (
      horario &&
      !horariosDisponiveis(dia, agora, antecedenciaHoras).includes(horario)
    )
      onHorario(undefined)
    setAberto(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {antecedenciaHoras > 0 && (
        <p className="text-sm text-muted-foreground">
          Seu carrinho tem item sob encomenda: a primeira data disponível é{" "}
          <strong>
            {formatData(new Date(`${primeiro}T12:00:00-03:00`), "longa")}
          </strong>
          .
        </p>
      )}
      <Field data-invalid={Boolean(erroData)}>
        <FieldLabel htmlFor="data">Data</FieldLabel>
        <Popover open={aberto} onOpenChange={setAberto}>
          <PopoverTrigger
            render={
              <Button
                id="data"
                type="button"
                variant="outline"
                size="touch"
                className={cn(
                  "w-full justify-start font-normal",
                  !data && "text-muted-foreground"
                )}
                aria-invalid={Boolean(erroData)}
              />
            }
          >
            <CalendarIcon />
            {data
              ? formatData(new Date(`${data}T12:00:00-03:00`), "longa")
              : "Escolher data"}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              locale={ptBR}
              selected={data ? paraDate(data) : undefined}
              onSelect={escolherData}
              defaultMonth={paraDate(data || primeiro)}
              disabled={[
                { before: paraDate(primeiro) },
                { after: paraDate(ultimo) },
              ]}
              startMonth={paraDate(primeiro)}
              endMonth={paraDate(ultimo)}
            />
          </PopoverContent>
        </Popover>
        <FieldError>{erroData}</FieldError>
      </Field>

      {data && (
        <FieldSet data-invalid={Boolean(erroHorario)}>
          <FieldLegend variant="label">Horário</FieldLegend>
          <div
            role="radiogroup"
            aria-label="Horário"
            className="grid grid-cols-3 gap-2 sm:grid-cols-5"
          >
            {horarios.map((h) => (
              <Button
                key={h}
                type="button"
                role="radio"
                aria-checked={horario === h}
                variant={horario === h ? "default" : "outline"}
                size="touch"
                onClick={() => onHorario(h)}
              >
                {h}
              </Button>
            ))}
          </div>
          <FieldError>{erroHorario}</FieldError>
        </FieldSet>
      )}
    </div>
  )
}
