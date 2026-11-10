import { type Browser, expect, type Page, test } from "@playwright/test"

async function comprar(page: Page, pagamento: "CARTAO" | "PIX") {
  await page.goto("/produto/cenoura-brigadeiro")
  await page.getByRole("button", { name: /^Adicionar/ }).click()
  await expect(page.getByText(/no carrinho/).first()).toBeVisible()
  await page.goto("/checkout")
  await page.getByLabel("Nome completo").fill("Cliente Teste")
  await page.getByLabel("E-mail").fill("cliente@email.com")
  await page.getByLabel("Telefone (WhatsApp)").fill("11955554444")
  await page.getByText("Retirar na loja", { exact: true }).click()
  await page.getByRole("button", { name: "Data", exact: true }).click()
  await page.locator("button[data-day]:not([disabled])").nth(1).click()
  await page
    .getByRole("radiogroup", { name: "Horário" })
    .getByRole("radio")
    .first()
    .click()
  if (pagamento === "CARTAO") {
    await page.getByText("Cartão de crédito", { exact: true }).click()
    await page.getByLabel("Número do cartão").fill("4111111111111111")
    await page.getByLabel("Nome impresso no cartão").fill("CLIENTE TESTE")
    await page.getByLabel("Validade").fill("1230")
    await page.getByLabel("CVV").fill("123")
  } else {
    await page.getByText("PIX", { exact: true }).click()
  }
  await page.getByRole("button", { name: /^Confirmar pedido/ }).click()
  await expect(page).toHaveURL(/\/pedido\/CG-\d{6}$/)
  return page.url().split("/").pop()!
}

async function entrarComoAtendente(browser: Browser) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  const page = await ctx.newPage()
  await page.goto("/admin/login")
  await page.getByLabel("E-mail").fill("atendente@cupcakes.dev")
  await page.getByLabel("Senha").fill("atendente123")
  await page.getByRole("button", { name: "Entrar" }).click()
  await expect(page).toHaveURL(/\/admin\/pedidos/)
  return { ctx, page }
}

test("equipe avança o pedido até ENTREGUE e o cliente vê a linha do tempo (US-17, US-13)", async ({
  page,
  browser,
}) => {
  const numero = await comprar(page, "CARTAO")
  const { ctx, page: admin } = await entrarComoAtendente(browser)

  const card = admin.getByRole("article", { name: `Pedido ${numero}` })
  await admin.goto("/admin/pedidos?status=RECEBIDO")
  await expect(card).toBeVisible()

  // Retirada: Recebido → Em preparo → Pronto → Entregue (sem "Saiu para entrega")
  for (const [proximo, aba] of [
    ["Em preparo", "EM_PREPARO"],
    ["Pronto", "PRONTO"],
    ["Entregue", "ENTREGUE"],
  ] as const) {
    await card.getByRole("button", { name: `Avançar para: ${proximo}` }).click()
    await expect(admin.getByText(`${numero}: ${proximo}`)).toBeVisible()
    await admin.goto(`/admin/pedidos?status=${aba}`)
    await expect(card).toBeVisible()
  }
  // Entregue: nenhuma ação de avançar ou cancelar (US-17 CA#4)
  await expect(card.getByRole("button", { name: /Avançar/ })).toHaveCount(0)
  await expect(card.getByRole("button", { name: "Cancelar" })).toHaveCount(0)
  // Histórico com o responsável (CA#3)
  await card.getByText(/Histórico/).click()
  await expect(card).toContainText("Beto Atendente")

  // Cliente vê a linha do tempo concluída
  await page.reload()
  await expect(
    page.getByRole("heading", { name: /Pedido entregue/ })
  ).toBeVisible()
  const linha = page.getByRole("list", { name: "Andamento do pedido" })
  await expect(linha).toContainText("Em preparo")
  await expect(linha).not.toContainText("Saiu para entrega")
  await ctx.close()
})

test("cancelar pede confirmação e estorna o cartão (RN#28, RN#29)", async ({
  page,
  browser,
}) => {
  const numero = await comprar(page, "CARTAO")
  const { ctx, page: admin } = await entrarComoAtendente(browser)
  await admin.goto("/admin/pedidos?status=RECEBIDO")
  const card = admin.getByRole("article", { name: `Pedido ${numero}` })

  await card.getByRole("button", { name: "Cancelar" }).click()
  const dialogo = admin.getByRole("alertdialog")
  await expect(dialogo).toContainText("estornado")
  await dialogo.getByRole("button", { name: "Cancelar pedido" }).click()
  await expect(admin.getByText(`${numero}: Cancelado`)).toBeVisible()

  await admin.goto("/admin/pedidos?status=CANCELADO")
  await expect(card).toContainText("Estornado")

  await page.reload()
  await expect(
    page.getByRole("heading", { name: "Pedido cancelado" })
  ).toBeVisible()
  await ctx.close()
})

test("comanda de impressão mostra os itens", async ({ page, browser }) => {
  const numero = await comprar(page, "PIX")
  const { ctx, page: admin } = await entrarComoAtendente(browser)
  await admin.goto("/admin/pedidos?status=AGUARDANDO_PAGAMENTO")
  const card = admin.getByRole("article", { name: `Pedido ${numero}` })
  await expect(
    card.getByRole("button", { name: "Confirmar pagamento" })
  ).toBeVisible()

  await card.getByRole("link", { name: "Imprimir" }).click()
  await expect(admin).toHaveURL(/\/imprimir$/)
  await expect(admin.getByText(numero)).toBeVisible()
  await expect(admin.getByText("Cenoura com Brigadeiro")).toBeVisible()
  await ctx.close()
})
