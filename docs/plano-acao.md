# 🧁 Plano de Ação — Cupcakes Gourmet

> Como executar o [plan.md](../plan.md), passo a passo.
> O `plan.md` diz **o quê** construir; este arquivo diz **em que ordem**, **como verificar** e **onde mora o risco**.
> Cada etapa termina com algo que dá para ver funcionando e com um commit.

---

## 0. Estado atual do repositório (10/11/2026)

| Item | Situação | Consequência |
|---|---|---|
| Next.js | **16.4.4** + React 19.3 | `middleware.ts` virou `proxy.ts`; `params`/`searchParams`/`cookies()` são assíncronos. Ler `node_modules/next/dist/docs/` antes de cada assunto novo (exigência do `AGENTS.md`) |
| Estrutura | **Sem `src/`** (`app/`, `components/`, `lib/`, `hooks/` na raiz) | Seguir a regra do plano: mesma estrutura, só que na raiz (`controllers/`, `models/`, `stores/` na raiz) |
| shadcn | Estilo `base-mira`, sobre **Base UI** (não Radix) | Alguns componentes têm API diferente dos exemplos da internet (ex.: `render` em vez de `asChild`). Conferir cada componente após o `add` |
| Componentes instalados | Só `button` | O `add` em lote da Fase 0 ainda precisa rodar |
| Botão padrão | `text-xs`, altura pequena | Criar tamanho de toque (`h-11`) ou usar `size="lg"` na loja — exigência mobile-first de 44px |
| `button.tsx` | importa `cn` do pacote npm `cn`, não de `@/lib/utils` | Verificar se funciona; se não, trocar para `@/lib/utils` |
| `app/layout.tsx` | `lang="en"` | Trocar para `pt-BR` e ajustar `metadata` |
| Banco, testes, libs | Nada instalado | Tudo da Fase 0 |

---

## 1. Decisões que precisam ser fechadas antes de codar

Pequenas lacunas do `plan.md`. Recomendação ao lado; registrar no relatório.

1. **PIX aguardando pagamento ocupa capacidade?** → **Sim.** Conta como vendido para não vender além do limite. Só `CANCELADO` libera.
2. **Fuso horário das datas** → Guardar `dataAgendada` em UTC e tratar o "dia" sempre em `America/Sao_Paulo` (uma função `diaLocal()` em `lib/format.ts`). Evita o pedido "pular" de dia na capacidade.
3. **PIX não pago pode ser cancelado?** → Permitir cancelar em `AGUARDANDO_PAGAMENTO` também (sem estorno). Caso contrário, a capacidade fica presa. Atualizar a máquina de estados e o relatório.
4. **Número do pedido (`CG-000123`)** → Derivar do `id` autoincremento dentro da mesma transação (cria → atualiza `numero`). Simples e único no SQLite.
5. **"Buscar" no BottomNav** com a busca sendo [B] → No MVP, o item foca o campo de busca da vitrine (`/?busca=`). A busca completa (acentos, debounce) entra na Fase 5.
6. **Imagens dos produtos** → Campo de URL + imagens de exemplo em `public/produtos/`. Upload fica fora.
7. **Formulários com shadcn Base UI** → Se o componente `form` não existir no estilo base, usar `field` + `react-hook-form` (ou `useActionState` puro com Zod no servidor). Decidir na Etapa 0.3.

---

## 2. Etapas

Legenda: ⏱ estimativa · ✅ pronto quando · 🧪 testes da etapa · 💬 commit sugerido

### Fase 0 — Fundação

> ✅ **Concluída em 10/11/2026.** Desvios em relação ao planejado:
> - Prisma fixado em **7.10.1** (o `latest` instalava um 8.0-rc). Client gerado em `generated/prisma` (fora do git; `postinstall` regera).
> - O SQLite aceitou **`enum`** do Prisma, então status/papéis são enums de verdade (não `String`).
> - `form` do shadcn vem vazio no estilo Base UI → formulários usarão **`field`** + react-hook-form.
> - Componentes `input`, `textarea` e `select` ajustados para 44px / 16px no celular (voltam ao compacto no `md:`); `button` ganhou os tamanhos `touch` e `icon-touch`.
> - Regra `react-hooks/set-state-in-effect` desligada só em `components/ui/` (código gerado do carousel).
> - Imagens dos produtos: ilustrações SVG locais em `public/produtos/`.
> - A tela `/dev/ui` da etapa 0.3 não foi criada; a verificação foi feita por prints em 320/360/1280px.

#### 0.1 Ajustes do template
- [x] `lang="pt-BR"`, `metadata` (título, descrição), `viewport` com `viewportFit: "cover"` (necessário para `safe-area-inset`)
- [x] Conferir o import de `cn` no `button.tsx`
- [x] Definir paleta da marca em `globals.css` (tokens `--primary` etc.)
- [x] Renomear `package.json` → `"name": "cupcakes-gourmet"`
- ✅ `pnpm dev`, `pnpm lint` e `pnpm typecheck` sem erros · ⏱ 1h
- 💬 `chore: ajusta template (pt-BR, metadata, tema)`

#### 0.2 Dependências e testes
- [x] Instalar libs do plano (seção 5 do `plan.md`)
- [x] Atenção às versões novas — ler a doc antes:
  - **Prisma 7+**: usa `prisma.config.ts`, gerador `prisma-client` com `output` e *driver adapter* para SQLite (`@prisma/adapter-better-sqlite3`). O `prisma init` atual já gera nesse formato.
  - **Zod 4**: algumas APIs mudaram (`z.email()`, mensagens de erro com `error`).
- [x] `vitest.config.ts` com alias `@/` e ambiente `node` (jsdom só onde precisar)
- [x] Um teste trivial para provar que roda
- [x] Scripts: `test`, `test:watch`, `db:migrate`, `db:seed`, `db:reset`
- ✅ `pnpm test` verde · ⏱ 1–2h
- 💬 `chore: configura vitest, prisma e dependências`

#### 0.3 Componentes shadcn
- [x] Rodar o `add` da seção 5 (remover da lista o que não existir no estilo base, ex.: trocar `form` por `field`)
- [x] Criar `components/responsive-dialog.tsx` (Drawer < `md`, Dialog ≥ `md`) e `hooks/use-media-query.ts` — vários fluxos dependem disso
- ✅ Página de rascunho `/dev/ui` mostrando os componentes no celular (apagar depois) · ⏱ 1–2h
- 💬 `chore: adiciona componentes shadcn e responsive dialog`

#### 0.4 Modelo de dados + seed
- [x] `prisma/schema.prisma` com as 7 entidades da seção 3 (status como `String`)
- [x] `lib/db.ts` com singleton do Prisma (evita múltiplas conexões no hot reload)
- [x] `models/schemas/` com unions de status, modalidade, forma e status de pagamento
- [x] `prisma/seed.ts` com todos os casos da seção 5 (inclusive os "casos de teste": limite 0, inativo, 48h)
- [x] `.env.example` e `.env` (no `.gitignore`)
- ✅ `pnpm db:reset` recria tudo; `npx prisma studio` mostra os dados · ⏱ 3h
- 💬 `feat: schema do banco e seed`

#### 0.5 Utilitários e layout da loja
- [x] `lib/format.ts`: `formatBRL`, `formatCEP`, `formatData`, `diaLocal` + testes
- [x] `app/(loja)/layout.tsx`: header (≥ `md`) + `BottomNav` (< `md`) + `<Toaster />`
- [x] Faixa "Ambiente de demonstração" (pode ficar no layout desde já)
- ✅ Layout correto em 320px e 360px, sem scroll horizontal · ⏱ 2–3h
- 💬 `feat: layout mobile-first da loja com BottomNav`

> **Marco Fase 0:** `pnpm dev` mostra o layout e `pnpm test` roda.

---

### Fase 1 — Catálogo e administração de produtos

> ✅ **Concluída em 10/11/2026.** Marco comprovado pelo teste E2E `e2e/admin-produto.spec.ts`. Observações:
> - A busca simples (sem acento, por nome/descrição/ingredientes) já entrou na vitrine; na Fase 5 falta só o debounce (busca enquanto digita).
> - Produto inativo/inexistente mostra a página amigável, mas com status HTTP 200 + `noindex` (comportamento do Next com streaming/`loading.tsx`).
> - O slug não muda ao editar o nome, para não quebrar links já compartilhados.
> - Playwright configurado com o Chrome do sistema (`pnpm test:e2e`). Os testes criam produtos no banco de dev → rodar `pnpm db:reset` depois. Pendente: banco separado para E2E.
> - `useFormAction` (hooks/) evita que o React 19 limpe o formulário quando a validação falha.

Ordem pensada para que cada passo possa ser testado com o anterior.

#### 1.1 Domínio de capacidade (RN#14)
- [x] `models/domain/capacidade.ts`: função pura `disponivel(limite, vendidos)` + regra de quais status contam
- [x] `models/repositories/produto.repository.ts`: `listarProdutosAtivos()`, `buscarPorSlug()`, `vendidosNoDia(produtoIds, dia)` (um `groupBy`, não uma consulta por produto)
- 🧪 `capacidade.test.ts` · ⏱ 2h
- 💬 `feat(US-07): cálculo de capacidade diária`

#### 1.2 F1 · Vitrine
- [x] `app/(loja)/page.tsx` (Server Component) + `ProductCard` + selos
- [x] Carrossel da coleção sazonal, filtro por selo (chips com `?selo=`)
- [x] `loading.tsx` e `error.tsx`
- ✅ Produto inativo não aparece; limite 0 aparece esmaecido · ⏱ 4h
- 💬 `feat(US-03): vitrine com selos e indisponibilidade`

#### 1.3 F2 · Detalhe do produto
- [x] `app/(loja)/produto/[slug]/page.tsx` (lembrar: `params` é `Promise`)
- [x] Alergênicos sempre visíveis, aviso de pré-encomenda, `notFound()` + `not-found.tsx`
- [x] Barra fixa com quantidade + "Adicionar" (o botão pode só mostrar toast até a Fase 2)
- ⏱ 3h · 💬 `feat(US-06): página de detalhe do produto`

#### 1.4 F11 · Login da equipe
- [x] `lib/session.ts`: criar/ler/apagar sessão JWT (jose) em cookie HttpOnly + SameSite=Lax
- [x] `lib/auth.ts`: `exigirSessao(papeis?)` — **chamar no início de toda action/página de admin**
- [x] `controllers/auth.actions.ts`: `entrar`, `sair` (mensagem genérica no erro)
- [x] `proxy.ts` na raiz: só checagem otimista do cookie em `/admin/:path*` (exceto `/admin/login`)
- [x] Ler antes: `docs/01-app/02-guides/authentication.md` e `data-security.md`
- ⏱ 4h · 💬 `feat(RN#34): login da equipe com sessão JWT`

#### 1.5 F12 · Gestão de produtos
- [x] `models/schemas/produto.schema.ts` (preço > 0, alergênicos obrigatório) 🧪 `schemas.test.ts`
- [x] `controllers/admin-produto.actions.ts`: criar (nasce inativo), editar, alternar ativo — cada um com `exigirSessao` + LogAuditoria + `revalidatePath`
- [x] Lista (tabela ≥ `md`, cards < `md`) com busca; formulário compartilhado entre novo/editar
- [x] Preço digitado em reais, convertido para centavos **no schema**
- ⏱ 6h · 💬 `feat(US-16): cadastro e ativação de produtos`

> **Marco Fase 1:** admin cadastra um produto, ativa, e ele aparece na vitrine.

---

### Fase 2 — Carrinho e checkout (sem pagamento)

> ✅ **Concluída em 10/11/2026.** Comprovada por `e2e/carrinho-checkout.spec.ts`. Observações:
> - Carrinho em página própria (`/carrinho`) + toast com atalho "Ver carrinho"; o drawer global foi dispensado (menos código, mesma função).
> - Horário escolhido por botões (chips) em vez de `Select`: mais fácil de tocar no celular.
> - Preparo mínimo de 2h mesmo para pronta entrega; agendamento até 30 dias à frente.
> - Produto sob encomenda usa o limite diário como teto no carrinho (a produção de hoje não importa para ele); a capacidade da data escolhida é conferida ao finalizar (Fase 3).
> - ViaCEP preenche rua e bairro quando responde; se falhar, o cliente digita (US-09 CA#4).
> - O botão "Continuar" só valida os dados por enquanto; pagamento e criação do pedido entram na Fase 3.

#### 2.1 Domínio do carrinho
- [x] `models/domain/carrinho.ts`: `adicionar`, `alterarQtd`, `remover`, `totais` — funções puras usadas pelo store
- 🧪 `carrinho.test.ts` · ⏱ 2h

#### 2.2 F4 · Store + UI do carrinho
- [x] `stores/carrinho.store.ts` (Zustand + persist) guardando `produtoId`, nome, preço, imagem, `capacidade` e `antecedenciaHoras` do momento da adição
- [x] Cuidado com **hidratação**: o contador só aparece depois de montar no cliente (evita erro de SSR × localStorage)
- [x] Drawer do carrinho, página `/carrinho`, estado vazio, contador no BottomNav
- [x] Ligar o botão "Adicionar" da Fase 1
- [x] `controllers/carrinho.actions.ts → revalidarCarrinho(itens)`: devolve preços e capacidade atuais; chamado ao abrir o checkout
- ⏱ 5h · 💬 `feat(US-07, US-08): carrinho persistente com teto de capacidade`

#### 2.3 F5 · CEP e frete
- [x] `models/domain/entrega.ts`: `validarCEP`, `buscarArea`, `calcularFrete` 🧪 `entrega.test.ts`
- [x] Componente de CEP com máscara; fora da área → sugere retirada
- [x] (Opcional) ViaCEP com timeout e fallback manual
- ⏱ 3h · 💬 `feat(US-09): validação de CEP e cálculo de frete`

#### 2.4 F6 · Checkout
- [x] `models/schemas/checkout.schema.ts` (com `discriminatedUnion` por modalidade: endereço só obrigatório em ENTREGA)
- [x] `models/domain/agenda.ts`: `primeiraDataPermitida(agora, maiorAntecedencia)` e horários fixos 🧪
- [x] Página única com as 4 seções; resumo colapsável (mobile) / coluna lateral (`lg:`)
- [x] Barra fixa "Finalizar pedido" no rodapé
- ⏱ 6h · 💬 `feat(US-02, US-10): checkout como convidado`

> **Marco Fase 2:** carrinho completo e checkout validando CEP e datas.

---

### Fase 3 — Pagamento e criação do pedido

> ✅ **Concluída em 10/11/2026.** Comprovada por `e2e/compra.spec.ts` e `tests/integration/finalizar-pedido.test.ts`. Observações:
> - A regra de finalização fica em `models/services/finalizar-pedido.ts` (recebe o banco como parâmetro → testável com SQLite temporário); a action só valida, chama o serviço e libera o acesso.
> - Acesso do convidado ao pedido: cookie assinado (`cg_pedidos`) com os números que ele criou/consultou. Sem o cookie, a página pede o e-mail (formulário vem na Fase 4).
> - Cartões de teste: `4111 1111 1111 1111` (aprovado) e `4000 0000 0000 0002` (recusado). O QR Code do PIX é fictício.
> - Concorrência: a transação do SQLite serializa as escritas; em PostgreSQL seria preciso `SELECT … FOR UPDATE` ou isolamento serializável para a checagem de capacidade.
> - Correção: no Prisma 7 o `migrate reset` não roda mais o seed; o script `db:reset` agora chama `prisma db seed` em seguida.

#### 3.1 Domínio de pagamento e status
- [x] `models/domain/pagamento.ts`: Luhn, regra do final `0002`, resultado por método 🧪 `pagamento.test.ts`
- [x] `models/domain/status.ts`: máquina de estados completa (incluindo decisão 1.3) 🧪 `status.test.ts`
- ⏱ 3h · 💬 `feat(US-11): simulador de pagamento e máquina de estados`

#### 3.2 F8 · `finalizarPedido` (a peça mais crítica)
- [x] Fluxo dentro de `prisma.$transaction`:
  1. validar o input com `checkoutSchema`
  2. buscar produtos atuais (preço, ativo, antecedência) — **nunca usar preço vindo do cliente**
  3. revalidar capacidade do dia, área/frete e data mínima
  4. processar pagamento simulado → se recusado, **não cria pedido** e devolve erro
  5. criar Pedido + Itens (snapshot) + HistoricoStatus inicial
  6. gerar `numero`
- [x] Retorno tipado `{ ok: true, numero } | { ok: false, erro, campo? }`
- [x] No cliente: limpar carrinho **só** em sucesso, depois `router.push('/pedido/...')`
- 🧪 Integração: cria tudo; recusa por capacidade; cartão recusado não cria pedido
- ⏱ 6h · 💬 `feat(US-12): finalização de pedido em transação`

#### 3.3 F7 · UI de pagamento
- [x] Cartão (só últimos 4 dígitos vão ao banco), PIX (QR + copia e cola + "Simular pagamento recebido"), dinheiro (troco)
- [x] Botão com estado "Processando…" (`useActionState`/`useTransition`)
- [x] `controllers/pagamento.actions.ts → confirmarPix(numero)`: `AGUARDANDO_PAGAMENTO → RECEBIDO`
- ⏱ 4h

#### 3.4 Tela de confirmação
- [x] `app/(loja)/pedido/[numero]/page.tsx`: número em destaque, copiar, itens, total
- [x] Acesso: logo após a compra, guardar o e-mail num cookie curto para abrir sem pedir de novo; fora isso, exigir número + e-mail (evita que qualquer um veja o pedido só com o número)
- ⏱ 3h · 💬 `feat(US-11, US-12): pagamento simulado e confirmação`

> **Marco Fase 3:** pedido criado com número para os 3 métodos.

---

### Fase 4 — Operação

#### 4.1 F13 · Gestão de pedidos

> ✅ **Concluída em 10/11/2026** — Fase 4 completa. Comprovada por `e2e/admin-pedidos.spec.ts` e `tests/integration/mudar-status.test.ts`. Observações:
> - Abas por status são links (`?status=`), não o componente Tabs: funcionam sem JS e a aba fica na URL.
> - A action recebe o status que o atendente estava vendo; se o pedido já mudou (outro atendente, clique duplo), a mudança é recusada.
> - A equipe já pode cancelar (com confirmação e estorno simulado, RN#29). O cancelamento pelo cliente (F10) continua na Fase 5.
> - PIX aguardando pode ser confirmado manualmente pela equipe ("Confirmar pagamento").
> - A lista se atualiza a cada 30s para mostrar novos pedidos.
- [x] `controllers/admin-pedido.actions.ts → avancarStatus(pedidoId)`: `exigirSessao` → `podeTransicionar` → atualiza + Historico (responsável) + LogAuditoria, em transação
- [x] Tabs por status, ordenadas por data agendada; botão "Avançar para: …"
- [x] `/admin/pedidos/[id]/imprimir` com `@media print`
- 🧪 Integração `avancarStatus` (com e sem sessão)
- ⏱ 6h · 💬 `feat(US-17): painel de pedidos com avanço de status`

#### 4.2 F9 · Acompanhar pedido

> ✅ **Adiantada em 10/11/2026** (o link "Pedido" da navegação dava 404). `/acompanhar` lista os pedidos deste aparelho e consulta outros por número + e-mail; o número aceita "123", "cg123" ou "CG-000123".
- [x] `controllers/pedido.actions.ts → consultarPedido(numero, email)` — mesma resposta para "não existe" e "e-mail errado"
- [x] `/acompanhar` + `StatusTimeline` com data/hora
- [x] Polling com `router.refresh()` a cada 20s, parando quando `ENTREGUE`/`CANCELADO`
- 🧪 Integração `consultarPedido`
- ⏱ 4h · 💬 `feat(US-13): acompanhamento do pedido`

> **Marco Fase 4:** admin avança status e cliente acompanha.

---

### Fase 5 — Complementos, qualidade e entrega

> ✅ **Concluída em 10/11/2026** (exceto deploy opcional e a gravação do vídeo, que dependem de você).
> - Busca com debounce de 300ms e tolerância a 1 erro por palavra (Levenshtein).
> - Cancelamento pelo cliente reaproveita o serviço de mudança de status; o histórico registra "Cliente" (auditoria é só da equipe).
> - DoD em 320/360px virou teste automatizado (`e2e/mobile-320.spec.ts`) — achou e corrigiu 2px de sobra no carrinho.
> - Testes E2E com banco próprio (`prisma/e2e.db`, recriado a cada execução) e pasta de build `.next-e2e`.

| # | Tarefa | ⏱ |
|---|---|---|
| 5.1 | ✅  F3 Busca: `normalizar()` em `models/domain/busca.ts` + debounce + estado vazio 🧪 | 3h |
| 5.2 | ✅  F10 Cancelar: AlertDialog, revalidação no servidor, estorno simulado 🧪 | 3h |
| 5.3 | ✅  Passar a **Definition of Done** (seção 9) em todas as telas: 320px, 360px, estados de carregando/vazio/erro | 4h |
| 5.4 | ✅  (Opcional) 2 testes E2E Playwright com viewport mobile | 4h |
| 5.5 | ✅  `docs/modelo-dados.md` (diagrama Mermaid gerado do schema), `docs/manual.md`, `docs/rastreabilidade.md` | 4h |
| 5.6 | ✅  README: como rodar, usuários de teste, prints mobile, print dos testes | 2h |
| 5.7 | (Opcional) Deploy. **Atenção:** SQLite não persiste em hospedagem serverless (Vercel); usar Turso/PostgreSQL ou um host com disco (Railway, Fly) | 3h |
| 5.8 | ✅ roteiro pronto; gravação: você ·  Roteiro e gravação do vídeo (≥ 5 min) | 3h |

---

## 3. Resumo de esforço

| Fase | Horas estimadas |
|---|---|
| 0 · Fundação | 8–11h |
| 1 · Catálogo + admin produtos | 19h |
| 2 · Carrinho + checkout | 16h |
| 3 · Pagamento + pedido | 16h |
| 4 · Operação | 10h |
| 5 · Complementos + entrega | 23–26h |
| **Total** | **~90–100h** |

Se faltar tempo, cortar nesta ordem: E2E → deploy → ViaCEP → busca tolerante a erro → F10 → F3.
**Nunca cortar:** testes do `models/domain/`, validação no servidor, `finalizarPedido` em transação.

---

## 4. Riscos e como evitar

| Risco | Prevenção |
|---|---|
| Código de exemplo antigo (Next 14/15, Radix, Prisma 5) quebrando | Ler a doc local do Next e a do shadcn Base UI antes de cada assunto |
| Regra de negócio vazando para componentes | Revisar a cada PR/commit: componente só chama action e formata |
| Venda acima da capacidade | Revalidar dentro da transação, não só no carrinho |
| Rota admin desprotegida | `exigirSessao()` em toda action/página; o `proxy.ts` é só a primeira barreira |
| Erro de hidratação no carrinho | Ler o store só após montar no cliente |
| Datas trocando de dia | Fuso fixo `America/Sao_Paulo` em um único helper |
| Deixar documentação para o fim | Atualizar `rastreabilidade.md` ao fechar cada feature |

---

## 5. Rotina por feature

1. Ler a doc do Next/shadcn do assunto
2. Escrever o domínio (`models/domain`) **com teste primeiro**
3. Repository → schema Zod → controller (com validação e sessão)
4. View no celular (360px); depois expandir com `md:`/`lg:`
5. Estados de carregando, vazio e erro
6. Conferir a Definition of Done → atualizar `rastreabilidade.md` → commit com o ID da história

---

## 6. Fase 6 — Correções do teste com usuários

Origem: [`laudo-qualidade.md`](laudo-qualidade.md) (testes de 10 e 11/11/2026). A ordem segue a severidade. Cada item fecha com teste automatizado, captura "depois" no laudo e um commit próprio.

| # | Item | O que fazer | Teste | Estimativa |
|---|---|---|---|---|
| 6.1 | **D2** Domingo aceito (alta) | Regra `DIAS_FECHADOS` (domingo) em `models/domain/agenda.ts`, aplicada em `horariosDisponiveis` e `janelaDeDatas`, e portanto em `dataPermitida` no servidor. O calendário desabilita os domingos. O aviso da loja (`lib/loja.ts`) passa a ler a mesma regra. Vale para entrega e retirada (a cozinha não abre). | Unitário: domingo rejeitado e primeira data pula o domingo. Integração: `finalizarPedidoService` recusa domingo. E2E: domingo desabilitado. | 1,5h |
| 6.2 | **D1** Limpar filtros | Em `busca-form.tsx`, sincronizar o campo com o termo da URL sempre que ele mudar por navegação externa ("Limpar filtros", "Vitrine", voltar), sem atrapalhar quem está digitando | E2E: buscar → Limpar filtros → campo vazio; voltar restaura o termo | 1h |
| 6.3 | **D3** Busca longa | `BUSCA_MAX = 60` em `catalogo.ts`. Campo com `maxLength`. A página corta o parâmetro antes de filtrar. A mensagem mostra o termo com reticências e `break-words`. | Unitário: corte do termo. E2E: `?busca=` com 5.000 letras sem rolagem horizontal em 1.280 px e 320 px. | 1h |
| 6.4 | **M1** Sugestões na busca | `sugerirProdutos(termo, produtos)` no domínio, com os 3 nomes mais próximos. Busca por início de palavra ("cho" → Chocolate). Tolerância de 2 erros em palavras com 8+ letras. Bloco "Você quis dizer…" no estado vazio. | Unitário: casos com erro, prefixo e termo sem relação. E2E: sugestão clicável. | 2h |
| 6.5 | **M2** Fotos | Fotos com licença livre (Unsplash/Pexels), crédito em `docs/creditos-imagens.md`, WebP em `public/produtos/`, seed atualizado | Prints atualizados | 1,5h |
| 6.6 | Evidências | Prints de responsividade (390, 768 e 1.280 px). Lighthouse mobile e desktop na URL da Vercel. Capturas "depois" de D1 a D3. Status final no laudo. | — | 1h |

**Total estimado:** ~8h.
**Critério de pronto:** typecheck, lint, `pnpm test` e `pnpm test:e2e` passando; laudo com todos os itens "Corrigido" e as evidências anexadas.
