import "server-only"

import { PrismaClient } from "@/generated/prisma/client"
import { criarAdapter } from "@/lib/adapter"

function criarCliente() {
  return new PrismaClient({ adapter: criarAdapter() })
}

// Reaproveita a conexão entre os hot reloads do `next dev`
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db = globalParaPrisma.prisma ?? criarCliente()

if (process.env.NODE_ENV !== "production") globalParaPrisma.prisma = db
