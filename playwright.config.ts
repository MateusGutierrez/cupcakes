import { defineConfig, devices } from "@playwright/test"

const PORTA = 3123

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORTA}`,
    // Usa o Chrome instalado na máquina (sem baixar navegadores)
    channel: "chrome",
    trace: "retain-on-failure",
  },
  // Viewport de celular, coerente com o mobile-first
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: {
    // Banco próprio recriado a cada execução + pasta de build separada:
    // não interfere no banco de desenvolvimento nem no `next dev` aberto
    command: `tsx scripts/preparar-banco-e2e.ts && next dev --port ${PORTA}`,
    env: { DATABASE_URL: "file:./prisma/e2e.db", NEXT_DIST_DIR: ".next-e2e" },
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
