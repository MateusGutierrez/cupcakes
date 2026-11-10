# 🧁 Cupcakes Gourmet — Plano de Desenvolvimento (PIT II · SP2)

> Webapp mobile-first da loja de cupcakes, implementando o MVP especificado no PIT I
> (histórias US-xx, regras RN#xx e requisitos RNF#xx citados abaixo vêm daquele documento).

---

## 1. Decisões técnicas

| Decisão | Escolha | Justificativa (para o relatório) |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Front e back no mesmo projeto, sem API REST separada |
| UI | shadcn/ui + Tailwind | Componentes acessíveis, consistentes (princípio de IHC do material) |
| Back-end | Server Components + **Server Actions** | Processamento no servidor sem expor endpoints |
| Banco | SQLite via Prisma (trocável por PostgreSQL) | SGBD popular, zero configuração para avaliação |
| Validação | Zod | Mesmo schema valida no cliente e no servidor |
| Carrinho | Zustand + persist (localStorage) | Atende RN#15 (carrinho local do visitante) |
| Formulários | react-hook-form + Zod | Validação imediata, feedback ao usuário |
| Testes | Vitest (unit/integração) + Playwright (E2E opcional) | Equivalente ao JUnit/pytest citados no material |
| Pagamento | **Simulado** (mock) | Projeto acadêmico; nenhum dado de cartão real (RNF#20) |

### Princípios do projeto
1. **Mobile-first sempre** (seção 4).
2. **MVC explícito**: regra de negócio nunca fica em componente React.
3. **Rastreabilidade**: cada critério de aceite (CA) do PIT I vira um teste ou item de checklist.
4. Preços sempre em **centavos (inteiro)**; formatar só na View.

---

## 2. Arquitetura MVC no Next.js

```
src/
├── app/                         # VIEW — rotas e páginas
│   ├── (loja)/
│   │   ├── page.tsx                     # Vitrine
│   │   ├── produto/[slug]/page.tsx      # Detalhe
│   │   ├── carrinho/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── pedido/[numero]/page.tsx     # Confirmação + acompanhamento
│   │   └── acompanhar/page.tsx          # Consulta por número + e-mail
│   └── admin/
│       ├── login/page.tsx
│       └── (painel)/
│           ├── produtos/page.tsx
│           ├── produtos/novo/page.tsx
│           ├── produtos/[id]/page.tsx
│           └── pedidos/page.tsx
├── components/
│   ├── ui/                      # gerado pelo shadcn (não editar à mão)
│   ├── loja/                    # ProductCard, CartDrawer, BottomNav, StatusTimeline...
│   └── admin/
├── controllers/                 # CONTROLLER — Server Actions ("use server")
│   ├── checkout.actions.ts
│   ├── pagamento.actions.ts
│   ├── pedido.actions.ts
│   ├── auth.actions.ts
│   ├── admin-produto.actions.ts
│   └── admin-pedido.actions.ts
├── models/                      # MODEL
│   ├── domain/                  # regras puras, 100% testáveis, sem I/O
│   │   ├── status.ts            # máquina de estados (RN#26, RN#28)
│   │   ├── capacidade.ts        # limite diário (RN#14)
│   │   ├── entrega.ts           # CEP/área/frete (RN#04, RN#17, RN#20)
│   │   ├── carrinho.ts          # totais (RN#16)
│   │   └── pagamento.ts         # simulador (RN#21, RN#22)
│   ├── repositories/            # acesso ao banco via Prisma
│   └── schemas/                 # schemas Zod
├── stores/carrinho.store.ts     # Zustand (estado do cliente)
├── lib/                         # db.ts, session.ts, format.ts, utils
└── proxy.ts                     # protege /admin (middleware.ts em versões antigas do Next)
prisma/  schema.prisma · seed.ts
tests/   unit/ · integration/
e2e/     (Playwright, opcional)
docs/    PLANO.md · modelo-dados.md · manual.md
```

**Regra de ouro:** `app/` chama `controllers/`, que chama `models/`. Nunca o contrário.
Se o template não criou `src/`, use a mesma estrutura na raiz.

---

## 3. Modelo de dados

| Entidade | Campos principais | Regras |
|---|---|---|
| **Produto** | id, slug, nome, descricao, ingredientes, precoCentavos, imagemUrl, alergenicos (texto), semGluten, semLactose, vegano, limiteDiario, antecedenciaHoras, ativo, destaque, colecao?, createdAt | RN#13 alergênicos obrigatório · RN#33 preço > 0 · RN#35 nasce inativo |
| **AreaEntrega** | id, nome, cepInicio, cepFim, freteCentavos | RN#04, RN#17 |
| **Pedido** | id, numero (único), nomeCliente, email, telefone, modalidade (ENTREGA/RETIRADA), cep?, endereco?, dataAgendada, subtotalCentavos, freteCentavos, totalCentavos, formaPagamento, statusPagamento, trocoParaCentavos?, status, observacao?, createdAt | RN#24 número único |
| **ItemPedido** | id, pedidoId, produtoId, nomeProduto*, precoUnitarioCentavos*, quantidade, mensagem? | *snapshot: preço não muda se o produto mudar |
| **HistoricoStatus** | id, pedidoId, de, para, responsavel, createdAt | RN#27 |
| **Usuario** (staff) | id, nome, email, senhaHash, papel (ADMIN/ATENDENTE) | RN#34 |
| **LogAuditoria** | id, usuarioId, acao, entidade, entidadeId, createdAt | RNF#31 |

**Status do pedido** (`models/domain/status.ts`):

```
AGUARDANDO_PAGAMENTO → RECEBIDO → EM_PREPARO → PRONTO → SAIU_PARA_ENTREGA → ENTREGUE
                                                  └─(retirada)──────────────→ ENTREGUE
RECEBIDO → CANCELADO   (estado terminal)
```

> Ajuste em relação ao PIT I: pedidos de **retirada** pulam "Saiu para entrega", e foi
> criado `AGUARDANDO_PAGAMENTO` para cumprir a RN#21. Registre esses ajustes no relatório.

**Capacidade (RN#14)**: `disponivel(produto, data) = limiteDiario − soma(quantidades de itens em pedidos
daquela data, exceto CANCELADO)`. É calculada na hora; não precisa de tabela de estoque.

Se usar SQLite e o Prisma não aceitar `enum`, guarde status como `String` e valide com union type + Zod.

---

## 4. Diretrizes mobile-first (obrigatórias em toda feature)

- [ ] **Estilo base = celular** (320–390px). Prefixos `sm:` `md:` `lg:` só **expandem** o layout.
- [ ] Testar sempre no DevTools em **360×740** e **320px** de largura (RNF#08).
- [ ] Alvos de toque ≥ **44px** (`h-11`, `size-11`); espaçamento mínimo de 8px entre eles.
- [ ] Inputs com fonte ≥ 16px (`text-base`), para evitar o zoom do iOS.
- [ ] Usar `type`, `inputMode` e `autoComplete` certos (`tel`, `email`, `numeric`, `postal-code`).
- [ ] **Navegação inferior fixa** na loja (Vitrine · Buscar · Carrinho · Pedido); header no `md:`.
- [ ] Ações principais em **barra fixa no rodapé** (`sticky bottom-0`), com `pb-[env(safe-area-inset-bottom)]`.
- [ ] Overlays: **Drawer** no mobile, Dialog/Sheet no desktop (padrão "responsive dialog" com `useMediaQuery`).
- [ ] Grids: `grid-cols-2` → `md:grid-cols-3` → `lg:grid-cols-4`.
- [ ] Imagens com `next/image`, `sizes` correto e lazy loading (RNF#07).
- [ ] Admin também é mobile-first: **tabela vira lista de cards** abaixo de `md:`.
- [ ] Todo estado tem tela: carregando (Skeleton), vazio, erro com "tentar novamente".

---

## 5. Setup (Fase 0)

- [ ] Instalar dependências:
  `pnpm add prisma @prisma/client zod react-hook-form @hookform/resolvers zustand bcryptjs jose qrcode`
  `pnpm add -D vitest @vitejs/plugin-react @testing-library/react jsdom tsx @types/qrcode @types/bcryptjs`
- [ ] Adicionar componentes shadcn:
  `pnpm dlx shadcn@latest add button card badge input label textarea select radio-group checkbox switch sheet drawer dialog alert-dialog calendar popover tabs table skeleton sonner separator scroll-area carousel form`
- [ ] `prisma init --datasource-provider sqlite`; criar o schema da seção 3; rodar a migração inicial.
- [ ] Criar `prisma/seed.ts` com:
  - 10–12 cupcakes, com variedade de selos (sem glúten, sem lactose, vegano)
  - 1 coleção sazonal ativa
  - 1 produto com `limiteDiario = 0` (testa o "indisponível hoje")
  - 1 produto inativo (não deve aparecer na vitrine)
  - 1 produto com `antecedenciaHoras = 48` (pré-encomenda)
  - 3 áreas de entrega com fretes diferentes (faixas de CEP de exemplo)
  - 1 ADMIN e 1 ATENDENTE
- [ ] Scripts no `package.json`: `dev`, `build`, `test`, `test:watch`, `db:migrate`, `db:seed`, `db:reset`.
- [ ] `.env.example`: `DATABASE_URL`, `SESSION_SECRET`.
- [ ] Criar `lib/format.ts` (`formatBRL(centavos)`, `formatCEP`, `formatData`).
- [ ] Layout da loja: header + `BottomNav` + `<Toaster />` (sonner).

---

## 6. Features

Legenda: **[A]** obrigatória · **[B]** se houver tempo · **[C]** fora do MVP

### F1 · Vitrine — US-03 [A]
**Rota:** `/` · **Regras:** RN#07, RN#08, RN#09 · **shadcn:** Card, Badge, Carousel, Skeleton

- [ ] Repository `listarProdutosAtivos()` (apenas `ativo = true`, RN#08)
- [ ] Carrossel da coleção sazonal no topo (CA#3)
- [ ] `ProductCard`: foto, nome, preço, selos de restrição
- [ ] Badge "Indisponível hoje" + card esmaecido quando a capacidade é 0 (CA#2, RN#07)
- [ ] `loading.tsx` com Skeleton e `error.tsx` com botão "Tentar novamente" (CA#4)
- [ ] Filtro por selo (chips roláveis na horizontal no mobile)

### F2 · Detalhe do produto — US-06 [A]
**Rota:** `/produto/[slug]` · **Regras:** RN#07, RN#09, RN#13 · **shadcn:** Badge, Button, Separator

- [ ] Foto grande, descrição, ingredientes e **alergênicos sempre visíveis** (RN#13)
- [ ] Seletor de quantidade + "Adicionar ao carrinho" em barra fixa no rodapé
- [ ] Botão desabilitado com aviso "indisponível hoje" (CA#3)
- [ ] Produto inativo ou inexistente → `notFound()` com mensagem amigável (CA#4)
- [ ] Aviso de pré-encomenda quando `antecedenciaHoras > 0`

### F3 · Busca — US-05 [B]
**Local:** campo na vitrine · **Regras:** RN#08, RN#12

- [ ] Filtro por nome/sabor **ignorando acentos e maiúsculas** (`normalize("NFD")`)
- [ ] Debounce de ~300ms (RNF#12); estado "Nenhum produto encontrado" com atalho para limpar (CA#2)
- [ ] Tolerância a erro de digitação é opcional (ex.: distância de Levenshtein ≤ 1)

### F4 · Carrinho — US-07, US-08 [A]
**Local:** Drawer global + `/carrinho` · **Regras:** RN#14, RN#15, RN#16 · **shadcn:** Drawer, Button, Separator

- [ ] `carrinho.store.ts` (Zustand + persist): `adicionar`, `alterarQtd`, `remover`, `limpar`
- [ ] Produto repetido **soma a quantidade** em vez de duplicar o item (CA#4 da US-07)
- [ ] Teto de quantidade = capacidade disponível, com toast avisando (CA#3, RN#14)
- [ ] Quantidade 0 remove o item (CA#3 da US-08)
- [ ] Subtotal e total recalculados sem recarregar a página (RN#16, RNF#16)
- [ ] Carrinho vazio → ilustração + "Ver vitrine" (CA#4)
- [ ] Contador no ícone do `BottomNav`
- [ ] Revalidar preço e capacidade no servidor ao abrir o checkout (o carrinho local pode estar desatualizado)

### F5 · CEP e área de entrega — US-09 [A]
**Local:** etapa do checkout · **Regras:** RN#04, RN#17, RN#18

- [ ] Input com máscara `00000-000` e `inputMode="numeric"`
- [ ] Formato inválido → erro **sem consultar** o banco (CA#3)
- [ ] `models/domain/entrega.ts`: `buscarArea(cep, areas)` e `calcularFrete()`
- [ ] Dentro da área → mostra frete (CA#1); fora → mensagem + sugestão de **retirada** (CA#2, RN#18)
- [ ] *(Opcional)* autopreencher endereço via ViaCEP; se falhar, permitir digitação manual (CA#4, RNF#18)

### F6 · Checkout como convidado + modalidade — US-02, US-10 [A]
**Rota:** `/checkout` · **Regras:** RN#04, RN#05, RN#19, RN#20 · **shadcn:** Form, Input, RadioGroup, Calendar, Popover, Select

- [ ] **Formulário em página única** (RNF#05), em seções: Contato → Entrega/Retirada → Data e horário → Pagamento
- [ ] Schema Zod `checkoutSchema` compartilhado entre cliente e servidor
- [ ] Nome, e-mail e telefone obrigatórios (RN#05); erro destacado no campo (CA#2)
- [ ] RadioGroup Entrega × Retirada; retirada zera o frete (RN#20)
- [ ] Calendar bloqueando datas antes de `agora + maior antecedência do carrinho` (RN#19, RNF#19)
- [ ] Horários fixos (ex.: 10h–18h, de 2 em 2h) em `Select`
- [ ] Resumo do pedido colapsável no topo (mobile) / coluna lateral (`lg:`)

### F7 · Pagamento simulado — US-11 [A]
**Local:** última seção do checkout · **Regras:** RN#21, RN#22, RN#23 · **shadcn:** RadioGroup, Dialog/Drawer

- [ ] `models/domain/pagamento.ts` (simulador):
  - **Cartão:** valida Luhn; final `0002` = **recusado**; demais = aprovado. Guardar só os 4 últimos dígitos (RNF#20)
  - **PIX:** gera QR fictício (`qrcode`) + "copia e cola"; pedido fica `AGUARDANDO_PAGAMENTO`; botão "Simular pagamento recebido"
  - **Dinheiro:** campo "troco para"; status de pagamento `NA_ENTREGA` (RN#22)
- [ ] Recusa → mensagem clara, **carrinho preservado**, permite trocar o método (CA#4, RN#23)
- [ ] Estado "Processando…" com botão desabilitado (evita duplo clique e cobrança dupla)
- [ ] Faixa visível "Ambiente de demonstração — nenhum pagamento real"

### F8 · Finalizar pedido — US-12 [A]
**Controller:** `checkout.actions.ts → finalizarPedido()` · **Regras:** RN#06, RN#14, RN#21, RN#24

- [ ] Em **uma transação** (`prisma.$transaction`): revalidar capacidade (RN#14), preços e área → criar Pedido + Itens com snapshot → criar HistoricoStatus
- [ ] Gerar número legível e único: `CG-000123` (RN#24)
- [ ] Limpar carrinho e redirecionar para `/pedido/[numero]`
- [ ] Tela de confirmação: número em destaque, itens, total, pagamento e modalidade (CA#1)
- [ ] Botão "Copiar número do pedido"
- [ ] *(Opcional)* e-mail de comprovante (CA#2) — pode ficar como "fora do escopo" documentado

### F9 · Acompanhar pedido — US-13 [A]
**Rotas:** `/acompanhar` e `/pedido/[numero]` · **Regras:** RN#06, RN#26, RN#27

- [ ] Formulário número + e-mail (convidado sem login, CA#3); não revelar se o número existe em caso de e-mail errado
- [ ] `StatusTimeline` vertical com data/hora de cada etapa (CA#1)
- [ ] Atualização por **polling** (`router.refresh()` a cada 15–30s), substituindo o push da RNF#24
- [ ] Pedido entregue → estado concluído (CA#4)

### F10 · Cancelar pedido — US-14 [B]
**Regras:** RN#27, RN#28, RN#29 · **shadcn:** AlertDialog

- [ ] Botão visível só em `RECEBIDO` (RN#28); servidor revalida
- [ ] Confirmação explícita com AlertDialog (RNF#27)
- [ ] Cartão/PIX → `statusPagamento = ESTORNADO` (simulado, RN#29); dinheiro → só cancela

### F11 · Login da equipe — RN#34 [A]
**Rota:** `/admin/login` · **Lib:** bcryptjs + jose

- [ ] Senha com hash bcrypt (RNF#01); sessão JWT assinada em cookie **HttpOnly/SameSite** (adaptação da RNF#10)
- [ ] Mensagem genérica "e-mail ou senha inválidos" (CA#2 da US-04)
- [ ] `proxy.ts` redireciona `/admin/*` sem sessão para o login
- [ ] Toda Server Action de admin **revalida a sessão e o papel** (o proxy sozinho não basta)

### F12 · Gestão de produtos — US-16 [A]
**Rotas:** `/admin/produtos`, `/novo`, `/[id]` · **Regras:** RN#13, RN#33, RN#34, RN#35 · **shadcn:** Form, Switch, Table/Card

- [ ] Lista: tabela no `md:`, cards no mobile; busca por nome
- [ ] Formulário: nome, descrição, ingredientes, preço, **alergênicos (obrigatório)**, selos, limite diário, antecedência, destaque, coleção
- [ ] Imagem: campo de URL (versão simples) **ou** upload salvo em `public/uploads` (só em dev)
- [ ] Preço ≤ 0 rejeitado (CA#3); campos obrigatórios destacados (CA#2)
- [ ] Novo produto nasce **inativo** (RN#35); Switch para ativar/pausar
- [ ] Registrar em LogAuditoria (RNF#31)

### F13 · Gestão de pedidos — US-17 (+ impressão da US-18) [A]
**Rota:** `/admin/pedidos` · **Regras:** RN#26, RN#27, RN#34, RN#36 · **shadcn:** Tabs, Card, Button, Badge

- [ ] Tabs por status, ordenados por data/horário agendado (RNF#32)
- [ ] Card do pedido: número, horário, modalidade, itens, pagamento
- [ ] Botão único **"Avançar para: {próximo status}"**: a UI só oferece transições válidas (CA#2)
- [ ] Servidor valida com `podeTransicionar()`; CANCELADO/ENTREGUE bloqueados (CA#4)
- [ ] Gravar HistoricoStatus com responsável (CA#3, RN#27) e LogAuditoria
- [ ] Botão "Imprimir para a cozinha": rota `/admin/pedidos/[id]/imprimir` com CSS `@media print`

### Fora do escopo do MVP [C] — documentar no relatório
- US-01 / US-04 (conta e login do cliente)
- US-15 (avaliação de pedido)
- US-18 (faturamento com NFC-e/SEFAZ)
- E-mail transacional, push notification, gateway de pagamento real

---

## 7. Testes

### Unitários — `tests/unit/` (prioridade máxima: todo `models/domain/`)

| Arquivo | Casos mínimos | Origem |
|---|---|---|
| `status.test.ts` | transição válida; pular etapa bloqueado; retirada pula "saiu p/ entrega"; terminal não muda; cancelar só em RECEBIDO | US-17 CA#2/CA#4 · US-14 CA#2 |
| `capacidade.test.ts` | disponível = limite − vendidos; cancelados não contam; limite 0 = indisponível | RN#14 · US-07 CA#3 |
| `carrinho.test.ts` | soma item repetido; qtd 0 remove; total = Σ subtotais; teto pela capacidade | US-07 CA#4 · US-08 |
| `entrega.test.ts` | CEP dentro/fora; formato inválido; frete por área; retirada = 0 | US-09 · RN#20 |
| `pagamento.test.ts` | Luhn; final 0002 recusa; PIX pendente; dinheiro NA_ENTREGA | US-11 |
| `schemas.test.ts` | preço ≤ 0; alergênicos vazio; telefone/e-mail inválidos | RN#33 · RN#13 · RN#05 |

### Integração — `tests/integration/` (banco SQLite de teste, resetado a cada suíte)
- [ ] `finalizarPedido`: cria pedido + itens + histórico; recusa se capacidade estourou entre o carrinho e a finalização
- [ ] `avancarStatus`: grava histórico com responsável; nega sem sessão de admin
- [ ] `consultarPedido`: número + e-mail corretos retorna; e-mail errado não vaza dados

### E2E — `e2e/` (opcional, Playwright com **viewport mobile**)
- [ ] Compra completa como convidado com PIX simulado
- [ ] Admin avança o pedido até ENTREGUE e o cliente vê a timeline atualizada

**Matriz de rastreabilidade:** manter em `docs/rastreabilidade.md` a tabela `US · CA → arquivo de teste`.

---

## 8. Ordem de desenvolvimento

| Fase | Conteúdo | Pronto quando |
|---|---|---|
| 0 | Setup, schema, seed, layout, BottomNav | `pnpm dev` mostra o layout e `pnpm test` roda |
| 1 | F1, F2, F11, F12 | Admin cadastra/ativa produto e ele aparece na vitrine |
| 2 | F4, F5, F6 | Carrinho completo e checkout validando CEP e datas |
| 3 | F7, F8 | Pedido criado com número para os 3 métodos de pagamento |
| 4 | F13, F9 | Admin avança status e cliente acompanha |
| 5 | F3, F10, testes faltantes, polimento | Checklist da seção 9 completo |

---

## 9. Definition of Done (por feature)
- [ ] Funciona em 320px e 360px, sem scroll horizontal
- [ ] Regras no `models/`, com teste unitário
- [ ] Estados de carregando, vazio e erro tratados
- [ ] Validação no servidor (nunca confiar só no cliente)
- [ ] Sem `any`; `pnpm lint` e `pnpm test` passando
- [ ] Commit com referência à história (ex.: `feat(US-07): soma itens repetidos no carrinho`)

## 10. Entregáveis da SP2
- [ ] Repositório público no GitHub com histórico de commits
- [ ] `README.md`: descrição, stack, como rodar (`pnpm i && pnpm db:migrate && pnpm db:seed && pnpm dev`), usuários de teste, prints mobile
- [ ] `docs/modelo-dados.md` com diagrama e dicionário de dados
- [ ] `docs/manual.md`: manual de uso (cliente e admin)
- [ ] `docs/rastreabilidade.md`
- [ ] Testes passando, com print do resultado no README
- [ ] Vídeo narrado de **no mínimo 5 minutos** demonstrando o funcionamento
- [ ] *(Opcional)* deploy público para facilitar a avaliação