import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    // lib/db.ts exige estas variáveis; os testes de integração usam um banco próprio
    env: {
      DATABASE_URL: "file:./prisma/nao-usado-nos-testes.db",
      SESSION_SECRET: "segredo-apenas-para-testes-com-32-caracteres",
    },
    // "server-only" lança erro fora do Next; nos testes vira um módulo vazio
    alias: {
      "server-only": new URL("./tests/stubs/vazio.ts", import.meta.url)
        .pathname,
    },
  },
})
