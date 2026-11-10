import { expect, type Page, test } from "@playwright/test"

async function prepararCheckout(page: Page) {
  await page.goto("/produto/doce-de-leite")
  await page.getByRole("button", { name: /^Adicionar/ }).click()
  await expect(page.getByText(/no carrinho/).first()).toBeVisible()
  await page.goto("/checkout")
  await page.getByLabel("Nome completo").fill("Maria Silva")
  await page.getByLabel("E-mail").fill("maria@email.com")
  await page.getByLabel("Telefone (WhatsApp)").fill("11987654321")
  await page.getByText("Retirar na loja", { exact: true }).click()
  await page.getByRole("button", { name: "Data", exact: true }).click()
  // Amanhã sempre tem horários livres
  await page.locator("button[data-day]:not([disabled])").nth(1).click()
  await page
    .getByRole("radiogroup", { name: "Horário" })
    .getByRole("radio")
    .first()
    .click()
}

async function preencherCartao(page: Page, numero: string) {
  await page.getByText("Cartão de crédito", { exact: true }).click()
  await page.getByLabel("Número do cartão").fill(numero)
  await page.getByLabel("Nome impresso no cartão").fill("MARIA SILVA")
  await page.getByLabel("Validade").fill("1230")
  await page.getByLabel("CVV").fill("123")
}

const confirmar = (page: Page) =>
  page.getByRole("button", { name: /^Confirmar pedido/ }).click()

test("cartão aprovado cria o pedido e mostra a confirmação (US-11, US-12)", async ({
  page,
}) => {
  await prepararCheckout(page)
  await preencherCartao(page, "4111111111111111")
  await confirmar(page)

  await expect(page).toHaveURL(/\/pedido\/CG-\d{6}$/)
  await expect(
    page.getByRole("heading", { name: "Pedido confirmado!" })
  ).toBeVisible()
  await expect(page.getByText(/CG-\d{6}/).first()).toBeVisible()
  await expect(page.getByText("Cartão de crédito •••• 1111")).toBeVisible()
  await expect(page.getByText("Retirada na loja")).toBeVisible()
  // Carrinho foi limpo
  await expect(
    page.getByRole("navigation").getByLabel(/no carrinho/)
  ).toHaveCount(0)
})

test("cartão recusado preserva o carrinho e permite trocar para PIX (RN#23)", async ({
  page,
}) => {
  await prepararCheckout(page)
  await preencherCartao(page, "4000 0000 0000 0002")
  await confirmar(page)

  await expect(
    page.getByRole("alert").filter({ hasText: "recusado" })
  ).toBeVisible()
  await expect(page).toHaveURL(/\/checkout$/)
  await expect(
    page
      .getByRole("navigation")
      .getByLabel(/no carrinho/)
      .first()
  ).toHaveText("1")

  // Troca o método: PIX
  await page.getByText("PIX", { exact: true }).click()
  await confirmar(page)
  await expect(page).toHaveURL(/\/pedido\/CG-\d{6}$/)
  await expect(
    page.getByRole("heading", { name: "Falta pagar o PIX" })
  ).toBeVisible()
  await expect(page.getByAltText(/QR Code PIX/)).toBeVisible()

  // Simula o banco confirmando o PIX
  await page.getByRole("button", { name: "Simular pagamento recebido" }).click()
  await expect(
    page.getByRole("heading", { name: "Pedido confirmado!" })
  ).toBeVisible()
  await expect(page.getByText("Pedido recebido").first()).toBeVisible()
})

test("dinheiro valida o troco e fica para pagar na entrega (RN#22)", async ({
  page,
}) => {
  await prepararCheckout(page)
  await page.getByText("Dinheiro", { exact: true }).click()
  await page.getByLabel("Troco para (opcional)").fill("5,00") // menor que o total
  await confirmar(page)
  await expect(
    page
      .getByText("O valor para troco deve ser maior ou igual ao total.")
      .first()
  ).toBeVisible()

  await page.getByLabel("Troco para (opcional)").fill("50,00")
  await confirmar(page)
  await expect(page).toHaveURL(/\/pedido\/CG-\d{6}$/)
  await expect(page.getByText("Pagar na entrega/retirada")).toBeVisible()
  await expect(page.getByText("R$ 50,00")).toBeVisible()
})

test("pedido de outra pessoa não é exibido sem o e-mail", async ({
  page,
  browser,
}) => {
  await prepararCheckout(page)
  await page.getByText("PIX", { exact: true }).click()
  await confirmar(page)
  await expect(page).toHaveURL(/\/pedido\/CG-\d{6}$/)
  const url = page.url()

  // Outro navegador (sem o cookie de acesso)
  const outro = await browser.newContext()
  const pagina = await outro.newPage()
  await pagina.goto(url)
  await expect(
    pagina.getByRole("heading", { name: "Confirme seu e-mail" })
  ).toBeVisible()
  await expect(pagina.getByText("Maria Silva")).toHaveCount(0)
  await outro.close()
})
