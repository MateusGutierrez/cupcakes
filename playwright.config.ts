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
  projects: [{ name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" } }],
  webServer: {
    command: `pnpm dev --port ${PORTA}`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
