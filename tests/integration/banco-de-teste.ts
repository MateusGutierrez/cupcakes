// Cria um banco SQLite temporário com o schema atual (aplicando as migrações),
// isolado do banco de desenvolvimento.
import { randomUUID } from "node:crypto"
import { readdirSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import Database from "better-sqlite3"

import { PrismaClient } from "@/generated/prisma/client"

const PASTA_MIGRACOES = path.join(process.cwd(), "prisma", "migrations")

export function criarBancoDeTeste() {
  const arquivo = path.join(tmpdir(), `cupcakes-teste-${randomUUID()}.db`)
  const sqlite = new Database(arquivo)
  for (const pasta of readdirSync(PASTA_MIGRACOES, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()) {
    sqlite.exec(
      readFileSync(path.join(PASTA_MIGRACOES, pasta, "migration.sql"), "utf8")
    )
  }
  sqlite.close()

  const db = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: `file:${arquivo}` }),
  })
  return {
    db,
    async remover() {
      await db.$disconnect()
      rmSync(arquivo, { force: true })
    },
  }
}
