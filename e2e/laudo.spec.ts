// Defeitos e melhorias apontados no teste com usuários (docs/laudo-qualidade.md)
import { expect, test } from "@playwright/test"

test("D1: Limpar filtros esvazia o campo de busca; voltar restaura", async ({
  page,
}) => {
  await page.goto("/?busca=")
  const campo = page.getByRole("searchbox")
  await campo.fill("Bolo de Fubá")
  await expect(page.getByText("Nenhum produto encontrado")).toBeVisible()

  await page.getByRole("link", { name: "Limpar filtros" }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(campo).toHaveValue("")
  await expect(
    page.getByRole("heading", { name: "Nossos cupcakes" })
  ).toBeVisible()

  await page.goBack()
  await expect(campo).toHaveValue("Bolo de Fubá")
})

test("D2: domingos ficam bloqueados no calendário", async ({ page }) => {
  await page.goto("/produto/red-velvet")
  await page.getByRole("button", { name: /^Adicionar/ }).click()
  await expect(page.getByText(/no carrinho/).first()).toBeVisible()

  await page.goto("/checkout")
  await page.getByText("Retirar na loja", { exact: true }).click()
  await expect(page.getByText("Abrimos de segunda a sábado.")).toBeVisible()
  await page.getByRole("button", { name: "Data", exact: true }).click()

  const dias = page.locator("button[data-day]")
  await expect(dias.first()).toBeVisible()
  const domingos = await dias.evaluateAll((botoes) =>
    botoes
      .map((b) => b.getAttribute("data-day") ?? "")
      .filter((d) => {
        const [dia, mes, ano] = d.split("/")
        return new Date(`${ano}-${mes}-${dia}T12:00:00Z`).getUTCDay() === 0
      })
  )
  expect(domingos.length).toBeGreaterThan(0)
  for (const d of domingos) {
    await expect(page.locator(`button[data-day="${d}"]`)).toBeDisabled()
  }
})

for (const largura of [1280, 320]) {
  test(`D3: busca enorme não cria rolagem horizontal (${largura}px)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: largura, height: 800 })
    await page.goto(`/?busca=${"a".repeat(5000)}`)
    await expect(page.getByText("Nenhum produto encontrado")).toBeVisible()

    const campo = page.getByRole("searchbox")
    await expect(campo).toHaveAttribute("maxlength", "60")
    // O servidor também corta o termo
    expect((await campo.inputValue()).length).toBe(60)

    const larguraPagina = await page.evaluate(
      () => document.documentElement.scrollWidth
    )
    expect(larguraPagina).toBeLessThanOrEqual(largura)
  })
}

test("M1: busca sem resultado sugere produtos parecidos", async ({ page }) => {
  await page.goto("/?busca=pistaxio")
  const sugestoes = page.getByRole("navigation", { name: "Sugestões" })
  await expect(sugestoes).toContainText("Você quis dizer:")
  await sugestoes.getByRole("link", { name: "Pistache" }).click()
  await expect(page).toHaveURL(/\/produto\/pistache$/)
})
