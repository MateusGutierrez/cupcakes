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
| US-07 · CA#3 / RN#14 | Teto de quantidade pela capacidade, com aviso | `models/domain/carrinho.ts → adicionarItem` | `tests/unit/carrinho.test.ts` |
| US-07 · CA#4 | Produto repetido soma a quantidade | `adicionarItem` | `tests/unit/carrinho.test.ts`, E2E `carrinho-checkout.spec.ts` |
| US-07 · CA#4 (vazio) | Carrinho vazio com "Ver vitrine" | `components/loja/carrinho-vazio.tsx` | E2E `carrinho-checkout.spec.ts` |
| US-08 · CA#3 | Quantidade 0 remove o item | `alterarQuantidade` | `tests/unit/carrinho.test.ts`, E2E |
| RN#15 | Carrinho do visitante salvo no navegador | `stores/carrinho.store.ts` | E2E "carrinho persiste ao recarregar" |
| RN#16 | Totais recalculados sem recarregar | `calcularTotais` | `tests/unit/carrinho.test.ts`, E2E |
| F4 (revalidação) | Preço/capacidade/inativos conferidos no servidor | `reconciliarCarrinho`, `controllers/carrinho.actions.ts` | `tests/unit/carrinho.test.ts` |
| US-09 · CA#1 / RN#04, RN#17 | CEP na área mostra o frete | `models/domain/entrega.ts`, `controllers/entrega.actions.ts` | `tests/unit/entrega.test.ts`, E2E |
| US-09 · CA#2 / RN#18 | Fora da área sugere retirada | `components/loja/checkout/campo-cep.tsx` | `tests/unit/entrega.test.ts`, E2E |
| US-09 · CA#3 | Formato inválido sem consultar o banco | `campo-cep.tsx`, `cepValido` | `tests/unit/entrega.test.ts`, E2E |
| US-09 · CA#4 | ViaCEP opcional com digitação manual | `campo-cep.tsx → buscarViaCEP` | Checklist manual |
| US-02 · CA#2 / RN#05 | Nome, e-mail e telefone obrigatórios | `models/schemas/checkout.schema.ts` | `tests/unit/checkout-schema.test.ts`, E2E |
| RN#20 | Retirada zera o frete | `calcularFrete`, `checkout-form.tsx` | `tests/unit/entrega.test.ts`, E2E |
| RN#19 / RNF#19 | Datas antes da maior antecedência bloqueadas | `models/domain/agenda.ts`, `seletor-data.tsx` | `tests/unit/agenda.test.ts`, E2E |
| US-11 · CA#1 / RNF#20 | Cartão válido (Luhn) aprovado; só 4 últimos dígitos guardados | `models/domain/pagamento.ts`, `checkout.schema.ts` | `tests/unit/pagamento.test.ts`, integração, E2E `compra.spec.ts` |
| US-11 · CA#4 / RN#23 | Recusa preserva o carrinho e permite trocar o método | `processarPagamento`, `checkout-form.tsx` | `tests/unit/pagamento.test.ts`, integração, E2E |
| RN#21 | PIX deixa o pedido aguardando pagamento | `processarPagamento`, `controllers/pagamento.actions.ts → confirmarPix` | `tests/unit/pagamento.test.ts`, integração, E2E |
| RN#22 | Dinheiro na entrega com troco | `processarPagamento`, `secao-pagamento.tsx` | `tests/unit/pagamento.test.ts`, E2E |
| US-12 · CA#1 | Confirmação com número, itens, total, pagamento e modalidade | `app/(loja)/pedido/[numero]/page.tsx` | E2E `compra.spec.ts` |
| RN#24 | Número legível e único (CG-000123) | `models/domain/status.ts → gerarNumeroPedido`, `criarPedido` | `tests/unit/status.test.ts`, integração |
| RN#14 (finalização) | Capacidade revalidada na transação | `models/services/finalizar-pedido.ts` | `tests/integration/finalizar-pedido.test.ts` |
| ItemPedido (snapshot) | Preço do item não muda se o produto mudar | `criarPedido` | `tests/integration/finalizar-pedido.test.ts` |
| RN#26 / RN#28 | Máquina de estados; cancelar só antes do preparo | `models/domain/status.ts` | `tests/unit/status.test.ts` |
| RN#06 (privacidade) | Pedido só visível para quem o fez | `lib/acesso-pedido.ts` | E2E "pedido de outra pessoa não é exibido" |
| US-13 · CA#1 / RN#27 | Linha do tempo com data/hora de cada etapa | `models/domain/status.ts → linhaDoTempo`, `status-timeline.tsx` | `tests/unit/status.test.ts`, E2E `acompanhar.spec.ts` |
| US-13 · CA#3 | Convidado consulta com número + e-mail; e-mail errado não vaza dados | `controllers/pedido.actions.ts`, `buscarPedidoDoCliente` | `tests/integration/consultar-pedido.test.ts`, E2E |
| US-13 · CA#4 | Pedido entregue aparece concluído | `linhaDoTempo` | `tests/unit/status.test.ts` |
| RNF#24 (adaptada) | Atualização por polling a cada 20s | `components/loja/atualizacao-automatica.tsx` | Checklist manual |
| US-17 · CA#1 / RNF#32 | Pedidos por status, ordenados pelo horário agendado | `app/admin/(painel)/pedidos/page.tsx`, `listarPedidosPorStatus` | E2E `admin-pedidos.spec.ts` |
| US-17 · CA#2 | UI só oferece a próxima transição válida | `components/admin/acoes-pedido.tsx`, `proximoStatus` | `tests/unit/status.test.ts`, E2E |
| US-17 · CA#3 / RN#27 | Histórico com responsável | `models/services/mudar-status.ts` | `tests/integration/mudar-status.test.ts`, E2E |
| US-17 · CA#4 | Entregue/cancelado bloqueados | `mudarStatusService`, `podeTransicionar` | `tests/integration/mudar-status.test.ts`, E2E |
| RN#29 | Cancelar pedido pago estorna (simulado) | `mudarStatusService` | `tests/integration/mudar-status.test.ts`, E2E |
| RNF#31 | Auditoria das mudanças de status | `mudarStatusService → registrarAuditoria` | `tests/integration/mudar-status.test.ts` |
| US-18 (impressão) | Comanda para a cozinha com `@media print` | `app/admin/(painel)/pedidos/[id]/imprimir/page.tsx` | E2E "comanda de impressão" |

