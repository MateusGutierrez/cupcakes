import { expect, type Page, test } from "@playwright/test"

async function adicionar(page: Page, slug: string, vezes = 1) {
  await page.goto(`/produto/${slug}`)
  for (let i = 1; i < vezes; i++) {
    await page.getByRole("button", { name: "Aumentar quantidade" }).click()
  }
  await page.getByRole("button", { name: /^Adicionar/ }).click()
  await expect(page.getByText(/no carrinho/).first()).toBeVisible()
}

const contador = (page: Page) =>
  page.getByRole("navigation").getByLabel(/no carrinho/)

test("carrinho: soma itens repetidos, altera e remove (US-07, US-08)", async ({
  page,
}) => {
  await adicionar(page, "red-velvet", 2)
  await adicionar(page, "red-velvet") // repetido soma (CA#4)
  await expect(contador(page).first()).toHaveText("3")

  await page.goto("/carrinho")
  const item = page.getByRole("listitem").filter({ hasText: "Red Velvet" })
  await expect(item.getByRole("group", { name: /Quantidade/ })).toContainText(
    "3"
  )
  await expect(page.getByLabel("Resumo")).toContainText("R$ 36,00") // RN#16

  await item.getByRole("button", { name: "Diminuir quantidade" }).click()
  await expect(page.getByLabel("Resumo")).toContainText("R$ 24,00")

  // Quantidade 0 remove (US-08 CA#3) → carrinho vazio (US-07 CA#4)
  await item.getByRole("button", { name: "Diminuir quantidade" }).click()
  await item.getByRole("button", { name: "Diminuir quantidade" }).click()
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible()
  await expect(contador(page)).toHaveCount(0)
})

test("carrinho persiste ao recarregar (RN#15)", async ({ page }) => {
  await adicionar(page, "doce-de-leite")
  await page.reload()
  await expect(contador(page).first()).toHaveText("1")
})

test("checkout valida contato, CEP e data (US-02, US-09, US-10)", async ({
  page,
}) => {
  await adicionar(page, "chocolate-belga", 2)
  await adicionar(page, "morango-champagne") // sob encomenda (48h)
  await page.goto("/checkout")

  // Campos obrigatórios destacados (US-02 CA#2)
  await page.getByRole("button", { name: /^Confirmar pedido/ }).click()
  await expect(page.getByText("Informe seu nome completo")).toBeVisible()
  await expect(page.getByText("Informe um e-mail válido")).toBeVisible()
  await expect(page.getByText("Informe um telefone com DDD")).toBeVisible()

  await page.getByLabel("Nome completo").fill("Maria Silva")
  await page.getByLabel("E-mail").fill("maria@email.com")
  await page.getByLabel("Telefone (WhatsApp)").fill("11987654321")
  await expect(page.getByLabel("Telefone (WhatsApp)")).toHaveValue(
    "(11) 98765-4321"
  )

  // CEP com formato inválido: erro sem consultar (US-09 CA#3)
  const cep = page.getByLabel("CEP", { exact: true })
  await cep.fill("123")
  await cep.blur()
  await expect(page.getByText("CEP inválido (use 00000-000)")).toBeVisible()

  // Fora da área → sugere retirada (CA#2, RN#18)
  await cep.fill("20040020")
  await expect(page.getByText("Ainda não entregamos nesse CEP")).toBeVisible()

  // Dentro da área → mostra frete (CA#1)
  await cep.fill("01310100")
  await expect(cep).toHaveValue("01310-100")
  await expect(page.getByText(/Entregamos em .*Centro/)).toBeVisible()
  await page.getByText("Resumo do pedido").first().click()
  await expect(page.locator("details")).toContainText("R$ 8,00")
  await expect(page.locator("details")).toContainText("R$ 44,00") // 2×11 + 14 + 8

  await page.getByLabel("Rua", { exact: true }).fill("Av. Paulista")
  await page.getByLabel("Número", { exact: true }).fill("1000")
  await page.getByLabel("Bairro", { exact: true }).fill("Bela Vista")

  // Sob encomenda: o aviso aparece e hoje/amanhã ficam bloqueados (RN#19)
  await expect(page.getByText(/item sob encomenda/)).toBeVisible()
  await page.getByRole("button", { name: "Data", exact: true }).click()
  const hoje = new Date()
  const diaHoje = page.locator(
    `button[data-day="${hoje.toLocaleDateString("pt-BR")}"]`
  )
  if (await diaHoje.count()) await expect(diaHoje).toBeDisabled()
  await page.locator("button[data-day]:not([disabled])").first().click()
  // Os horários livres dependem da hora em que o teste roda; escolhe o primeiro
  await page
    .getByRole("radiogroup", { name: "Horário" })
    .getByRole("radio")
    .first()
    .click()

  // Retirada zera o frete (RN#20)
  await page.getByText("Retirar na loja", { exact: true }).click()
  await expect(page.locator("details")).toContainText("Grátis (retirada)")
  await expect(page.locator("details")).toContainText("R$ 36,00")

  await page.getByRole("button", { name: /^Confirmar pedido/ }).click()
  // Sem forma de pagamento escolhida o pedido não é enviado
  await expect(page.getByText("Escolha a forma de pagamento")).toBeVisible()
  await expect(page).toHaveURL(/\/checkout$/)
})
