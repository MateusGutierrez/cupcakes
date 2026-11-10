import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    // "server-only" lança erro fora do Next; nos testes vira um módulo vazio
    alias: { "server-only": new URL("./tests/stubs/vazio.ts", import.meta.url).pathname },
  },
})
