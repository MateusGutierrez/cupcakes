import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaLibSql } from "@prisma/adapter-libsql"

/**
 * Escolhe onde o Prisma grava:
 * - com TURSO_DATABASE_URL (deploy na Vercel): SQLite na nuvem via Turso/libSQL;
 * - sem ela (desenvolvimento e testes): arquivo SQLite local de DATABASE_URL.
 * O schema e as migrações são os mesmos nos dois casos.
 */
export function criarAdapter() {
  const turso = process.env.TURSO_DATABASE_URL
  if (turso) {
    return new PrismaLibSql({
      url: turso,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL não definida (veja .env.example)")
  return new PrismaBetterSqlite3({ url })
}
