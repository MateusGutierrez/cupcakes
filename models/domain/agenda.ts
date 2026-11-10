// Datas e horários de entrega/retirada (RN#19, RNF#19).
// Os dias são strings "AAAA-MM-DD" no fuso da loja (America/Sao_Paulo, -03:00).
import { diaLocal } from "@/lib/format"

export const HORARIOS = ["10:00", "12:00", "14:00", "16:00", "18:00"] as const
export type Horario = (typeof HORARIOS)[number]

/** Tempo mínimo de preparo, mesmo para produtos de pronta entrega. */
export const PREPARO_MINIMO_HORAS = 2
/** Até quantos dias à frente é possível agendar. */
export const JANELA_DIAS = 30

const HORA_MS = 60 * 60 * 1000
const DIA_MS = 24 * HORA_MS

export function isHorario(valor: unknown): valor is Horario {
  return HORARIOS.includes(valor as Horario)
}

/** Instante do horário agendado. */
export function instanteAgendado(dia: string, horario: Horario): Date {
  return new Date(`${dia}T${horario}:00-03:00`)
}

/** Antes deste instante nenhum horário pode ser escolhido. */
export function limiteMinimo(agora: Date, antecedenciaHoras: number): Date {
  return new Date(
    agora.getTime() +
      Math.max(antecedenciaHoras, PREPARO_MINIMO_HORAS) * HORA_MS
  )
}

export function horariosDisponiveis(
  dia: string,
  agora: Date,
  antecedenciaHoras: number
): Horario[] {
  const limite = limiteMinimo(agora, antecedenciaHoras)
  return HORARIOS.filter((h) => instanteAgendado(dia, h) >= limite)
}

/** Some `n` dias a um dia "AAAA-MM-DD". */
export function somarDias(dia: string, n: number): string {
  return diaLocal(
    new Date(new Date(`${dia}T12:00:00-03:00`).getTime() + n * DIA_MS)
  )
}

/** Primeiro e último dia que têm pelo menos um horário livre. */
export function janelaDeDatas(agora: Date, antecedenciaHoras: number) {
  let primeiro = diaLocal(agora)
  while (horariosDisponiveis(primeiro, agora, antecedenciaHoras).length === 0) {
    primeiro = somarDias(primeiro, 1)
  }
  return { primeiro, ultimo: somarDias(diaLocal(agora), JANELA_DIAS) }
}

export function dataPermitida(
  dia: string,
  horario: Horario,
  agora: Date,
  antecedenciaHoras: number
): boolean {
  const { ultimo } = janelaDeDatas(agora, antecedenciaHoras)
  return (
    dia <= ultimo &&
    horariosDisponiveis(dia, agora, antecedenciaHoras).includes(horario)
  )
}
