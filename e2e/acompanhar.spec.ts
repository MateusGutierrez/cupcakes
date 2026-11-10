import { expect, test } from "@playwright/test"

test("acompanhar: lista pedidos do aparelho e consulta por número + e-mail (US-13)", async ({
  page,
  browser,
}) => {
  // Faz um pedido com PIX (retirada)
  await page.goto("/produto/limao-siciliano")
  await page.getByRole("button", { name: /^Adicionar/ }).click()
  await expect(page.getByText(/no carrinho/).first()).toBeVisible()
  await page.goto("/checkout")
  await page.getByLabel("Nome completo").fill("João Souza")
  await page.getByLabel("E-mail").fill("joao@email.com")
  await page.getByLabel("Telefone (WhatsApp)").fill("11912345678")
  await page.getByText("Retirar na loja", { exact: true }).click()
  await page.getByRole("button", { name: "Data", exact: true }).click()
  await page.locator("button[data-day]:not([disabled])").nth(1).click()
  await page
    .getByRole("radiogroup", { name: "Horário" })
    .getByRole("radio")
    .first()
    .click()
  await page.getByText("PIX", { exact: true }).click()
  await page.getByRole("button", { name: /^Confirmar pedido/ }).click()
  await expect(page).toHaveURL(/\/pedido\/CG-\d{6}$/)
  const numero = page.url().split("/").pop()!

  // Linha do tempo com a etapa atual
  await expect(
    page.getByRole("list", { name: "Andamento do pedido" })
  ).toContainText("Aguardando pagamento")

  // "Pedido" na navegação mostra o pedido recente
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Pedido" })
    .click()
  await expect(page).toHaveURL(/\/acompanhar$/)
  await expect(
    page.getByRole("link", { name: new RegExp(numero) })
  ).toBeVisible()

  // Outro aparelho: precisa de número + e-mail
  const outro = await browser.newContext()
  const p2 = await outro.newPage()
  await p2.goto("/acompanhar")
  await expect(p2.getByText("Seus pedidos")).toHaveCount(0)

  // E-mail errado: mensagem genérica, sem revelar se o número existe
  await p2.getByLabel("Número do pedido").fill(numero)
  await p2.getByLabel("E-mail usado no pedido").fill("outro@email.com")
  await p2.getByRole("button", { name: "Acompanhar" }).click()
  await expect(
    p2.getByText("Não encontramos um pedido com esse número e e-mail.")
  ).toBeVisible()

  // Número digitado de forma simplificada + e-mail certo
  await p2.getByLabel("Número do pedido").fill(String(Number(numero.slice(3))))
  await p2.getByLabel("E-mail usado no pedido").fill("JOAO@email.com")
  await p2.getByRole("button", { name: "Acompanhar" }).click()
  await expect(p2).toHaveURL(new RegExp(`/pedido/${numero}$`))
  await expect(p2.getByText("João Souza")).toBeVisible()
  await outro.close()
})
