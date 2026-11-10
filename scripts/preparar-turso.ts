// Prepara o banco do Turso usado no deploy: cria as tabelas (migrações) e carrega o seed.
// Uso: TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... pnpm db:turso
// O Prisma Migrate não fala com o Turso, então o SQL das migrações é aplicado direto.
import "dotenv/config"

import { execSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import { createClient } from "@libsql/client"

const url = process.env.TURSO_DATABASE_URL
if (!url) {
  console.error("Defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN (veja o README).")
  process.exit(1)
}

const turso = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })

const existe = await turso.execute(
  "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Produto'"
)

if (existe.rows.length > 0) {
  console.log("Tabelas já existem; migrações puladas.")
} else {
  const pasta = path.join(process.cwd(), "prisma", "migrations")
  const migracoes = readdirSync(pasta, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
  for (const m of migracoes) {
    await turso.executeMultiple(
      readFileSync(path.join(pasta, m, "migration.sql"), "utf8")
    )
    console.log(`Migração aplicada: ${m}`)
  }
}
turso.close()

// O seed apaga e recria os dados de exemplo (usa o Turso por causa da variável acima)
execSync("tsx prisma/seed.ts", { stdio: "inherit" })
