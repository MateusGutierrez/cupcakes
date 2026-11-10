import "server-only"

import type { Prisma } from "@/generated/prisma/client"
import { db } from "@/lib/db"

export function buscarUsuarioPorEmail(email: string) {
  return db.usuario.findUnique({ where: { email } })
}

export function buscarUsuarioPorId(id: number) {
  return db.usuario.findUnique({
    where: { id },
    select: { id: true, nome: true, email: true, papel: true },
  })
}

/** RNF#31 — trilha de auditoria das ações da equipe. */
export function registrarAuditoria(
  dados: {
    usuarioId: number
    acao: string
    entidade: string
    entidadeId: string | number
  },
  tx: Prisma.TransactionClient = db
) {
  return tx.logAuditoria.create({
    data: { ...dados, entidadeId: String(dados.entidadeId) },
  })
}
