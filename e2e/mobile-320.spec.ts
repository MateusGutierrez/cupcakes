import { expect, type Page, test } from "@playwright/test"

// Definition of Done (plan.md, seção 9): sem rolagem horizontal em 320px e 360px.

async function semRolagemHorizontal(page: Page, rota: string) {
  await page.goto(rota)
  await page.waitForLoadState("networkidle")
  // Compara com a largura configurada: no modo celular o navegador alarga
  // clientWidth junto com o conteúdo e esconderia o estouro.
  const visivel = page.viewportSize()!.width
  const largura = await page.evaluate(
    () => document.documentElement.scrollWidth
  )
  expect(
    largura,
    `${rota} tem rolagem horizontal (${largura}px > ${visivel}px)`
  ).toBeLessThanOrEqual(visivel)
}

for (const largura of [320, 360]) {
  test.describe(`${largura}px`, () => {
    test.use({ viewport: { width: largura, height: 700 } })

    test("páginas da loja", async ({ page }) => {
      for (const rota of [
        "/",
        "/?busca=chocolate",
        "/?busca=xyz",
        "/produto/morango-champagne",
        "/acompanhar",
      ]) {
        await semRolagemHorizontal(page, rota)
      }
      // Carrinho e checkout com item
      await page.goto("/produto/nozes-caramelo")
      await page.getByRole("button", { name: /^Adicionar/ }).click()
      await expect(page.getByText(/no carrinho/).first()).toBeVisible()
      await semRolagemHorizontal(page, "/carrinho")
      await semRolagemHorizontal(page, "/checkout")
    })

    test("páginas da equipe", async ({ page }) => {
      await semRolagemHorizontal(page, "/admin/login")
      await page.getByLabel("E-mail").fill("admin@cupcakes.dev")
      await page.getByLabel("Senha").fill("admin123")
      await page.getByRole("button", { name: "Entrar" }).click()
      await expect(page).toHaveURL(/\/admin\/produtos/)
      for (const rota of [
        "/admin/produtos",
        "/admin/produtos/novo",
        "/admin/pedidos",
        "/admin/pedidos?status=ENTREGUE",
      ]) {
        await semRolagemHorizontal(page, rota)
      }
    })
  })
}
