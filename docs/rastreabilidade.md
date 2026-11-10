# Matriz de rastreabilidade

Liga cada história/critério de aceite (PIT I) e regra de negócio ao código e ao teste que os comprovam.
Atualizada ao fim de cada feature.

| História · CA / Regra | Descrição | Implementação | Teste |
|---|---|---|---|
| US-03 · CA#1 / RN#08 | Vitrine lista só produtos ativos | `models/repositories/produto.repository.ts → listarProdutosAtivos` | E2E `admin-produto.spec.ts` (inativo não aparece) |
| US-03 · CA#2 / RN#07 | "Indisponível hoje" quando a capacidade é 0 | `components/loja/product-card.tsx` | `tests/unit/capacidade.test.ts` |
| US-03 · CA#3 | Coleção sazonal em destaque | `components/loja/colecao-carousel.tsx` | Checklist manual |
| US-03 · CA#4 | Erro com "Tentar novamente" | `app/(loja)/error.tsx` | Checklist manual |
| RN#09 | Selos de restrição | `models/domain/catalogo.ts → selosDoProduto` | `tests/unit/catalogo.test.ts` |
| RN#14 | Capacidade = limite − vendidos (cancelados não contam) | `models/domain/capacidade.ts`, `vendidosNoDia` | `tests/unit/capacidade.test.ts` |
| US-05 · CA#1 / RN#12 | Busca ignora acentos e maiúsculas | `models/domain/catalogo.ts → filtrarCatalogo` | `tests/unit/catalogo.test.ts` |
| US-05 · CA#2 | "Nenhum produto encontrado" + limpar | `app/(loja)/page.tsx` | E2E `admin-produto.spec.ts` |
| US-06 · CA#1 / RN#13 | Alergênicos sempre visíveis no detalhe | `app/(loja)/produto/[slug]/page.tsx` | Checklist manual |
| US-06 · CA#3 | Botão desabilitado se indisponível | `components/loja/adicionar-ao-carrinho.tsx` | Checklist manual |
| US-06 · CA#4 | Produto inativo/inexistente → mensagem amigável | `app/(loja)/produto/[slug]/not-found.tsx` | Checklist manual |
| US-04 · CA#2 | Login com mensagem genérica | `controllers/auth.actions.ts → entrar` | E2E `admin-produto.spec.ts` |
| RN#34 | Papéis ADMIN/ATENDENTE | `lib/auth.ts → exigirSessao` | E2E "atendente não acessa produtos" |
| US-16 · CA#2 | Campos obrigatórios destacados | `models/schemas/produto.schema.ts`, `produto-form.tsx` | `tests/unit/schemas.test.ts`, E2E |
| US-16 · CA#3 / RN#33 | Preço ≤ 0 rejeitado | `produtoSchema.precoCentavos` | `tests/unit/schemas.test.ts`, E2E |
| RN#13 | Alergênicos obrigatórios no cadastro | `produtoSchema.alergenicos` | `tests/unit/schemas.test.ts`, E2E |
| RN#35 | Produto novo nasce inativo | `controllers/admin-produto.actions.ts → salvarProduto` | E2E `admin-produto.spec.ts` |
| RNF#31 | Log de auditoria das ações da equipe | `registrarAuditoria` (login, criar, editar, ativar/pausar) | — (integração na Fase 4) |
