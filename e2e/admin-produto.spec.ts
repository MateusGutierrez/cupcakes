import { expect, test } from "@playwright/test"

// Marco da Fase 1: admin cadastra/ativa um produto e ele aparece na vitrine.
// Roda contra o banco de desenvolvimento; usa um nome único a cada execução.
test("admin cadastra, ativa e o produto aparece na vitrine", async ({
  page,
}) => {
  const nome = `Cupcake Teste ${Date.now()}`

  // Rota protegida redireciona para o login
  await page.goto("/admin/produtos")
  await expect(page).toHaveURL(/\/admin\/login/)

  // Senha errada → mensagem genérica (US-04 CA#2)
  await page.getByLabel("E-mail").fill("admin@cupcakes.dev")
  await page.getByLabel("Senha").fill("errada")
  await page.getByRole("button", { name: "Entrar" }).click()
  await expect(
    page.getByRole("alert").filter({ hasText: "inválidos" })
  ).toHaveText("E-mail ou senha inválidos.")
  await expect(page.getByLabel("E-mail")).toHaveValue("admin@cupcakes.dev")

  await page.getByLabel("Senha").fill("admin123")
  await page.getByRole("button", { name: "Entrar" }).click()
  await expect(page).toHaveURL(/\/admin\/produtos$/)

  // Novo produto: validação no servidor (preço 0 e alergênicos vazios)
  await page.getByRole("link", { name: "Novo" }).click()
  await expect(page).toHaveURL(/\/admin\/produtos\/novo$/)
  await page.getByLabel("Nome", { exact: true }).fill(nome)
  await page
    .getByLabel("Descrição")
    .fill("Cupcake criado pelo teste automatizado")
  await page.getByLabel("Ingredientes").fill("Farinha, açúcar")
  await page.getByLabel("Preço (R$)").fill("0")
  await page.getByRole("button", { name: "Salvar" }).click()
  await expect(page.getByText("O preço deve ser maior que zero")).toBeVisible()
  await expect(page.getByText(/Informe os alergênicos/)).toBeVisible()
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue(nome) // campos preservados

  await page.getByLabel("Preço (R$)").fill("9,90")
  await page.getByLabel("Alergênicos (obrigatório)").fill("Contém glúten")
  await page.getByText("Vegano", { exact: true }).click()
  await page.getByRole("button", { name: "Salvar" }).click()
  await expect(page).toHaveURL(/salvo=novo/)

  // Nasce inativo (RN#35): ainda não está na vitrine
  await page.goto(`/?busca=${encodeURIComponent(nome)}`)
  await expect(page.getByText("Nenhum resultado")).toBeVisible()

  // Ativa pela lista
  await page.goto(`/admin/produtos?busca=${encodeURIComponent(nome)}`)
  await page
    .getByRole("switch", { name: `Ativar ${nome}` })
    .first()
    .click()
  await expect(page.getByText(`${nome} está na vitrine.`)).toBeVisible()

  // Agora aparece na vitrine com selo e preço
  await page.goto(`/?busca=${encodeURIComponent(nome)}`)
  const card = page.getByRole("link", { name: new RegExp(nome) })
  await expect(card).toBeVisible()
  await expect(card).toContainText("R$ 9,90")
  await expect(card).toContainText("Vegano")
})

test("atendente não acessa a gestão de produtos (RN#34)", async ({ page }) => {
  await page.goto("/admin/login")
  await page.getByLabel("E-mail").fill("atendente@cupcakes.dev")
  await page.getByLabel("Senha").fill("atendente123")
  await page.getByRole("button", { name: "Entrar" }).click()
  await expect(page).toHaveURL(/\/admin\/pedidos/)
  await expect(page.getByRole("link", { name: "Produtos" })).toHaveCount(0)

  await page.goto("/admin/produtos")
  await expect(page).toHaveURL(/\/admin\/pedidos\?negado=1/)
  await expect(page.getByText(/não tem permissão/)).toBeVisible()
})
