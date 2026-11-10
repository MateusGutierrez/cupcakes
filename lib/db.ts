import "server-only"

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

import { PrismaClient } from "@/generated/prisma/client"

function criarCliente() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL não definida (veja .env.example)")
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) })
}

// Reaproveita a conexão entre os hot reloads do `next dev`
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db = globalParaPrisma.prisma ?? criarCliente()

if (process.env.NODE_ENV !== "production") globalParaPrisma.prisma = db
