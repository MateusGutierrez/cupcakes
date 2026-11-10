// Recria o banco dos testes E2E (prisma/e2e.db) do zero: aplica as migrações e roda o seed.
// Assim cada execução começa com o mesmo estado e não mexe no banco de desenvolvimento.
import { execSync } from "node:child_process"
import { readdirSync, readFileSync, rmSync } from "node:fs"
import path from "node:path"

import Database from "better-sqlite3"

const arquivo = path.join(process.cwd(), "prisma", "e2e.db")
rmSync(arquivo, { force: true })
rmSync(`${arquivo}-journal`, { force: true })

const sqlite = new Database(arquivo)
const pasta = path.join(process.cwd(), "prisma", "migrations")
for (const m of readdirSync(pasta, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()) {
  sqlite.exec(readFileSync(path.join(pasta, m, "migration.sql"), "utf8"))
}
sqlite.close()

execSync("tsx prisma/seed.ts", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: "file:./prisma/e2e.db" },
})
