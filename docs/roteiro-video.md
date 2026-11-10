# Roteiro do vídeo de demonstração (≈ 7 minutos)

**Preparação:** rode `pnpm db:reset` (dados limpos) e `pnpm dev`. Abra o Chrome com o DevTools no modo celular (390×844) e uma segunda janela anônima para a equipe. Deixe um terminal pronto para os testes.

| Tempo | Tela | O que mostrar / falar |
|---|---|---|
| 0:00–0:30 | Slide ou README | Apresentação: loja de cupcakes, MVP do PIT I, stack (Next.js + Server Actions, Prisma/SQLite, shadcn/ui), mobile-first e arquitetura MVC. |
| 0:30–1:30 | Vitrine | Coleção sazonal, selos, filtro "Vegano", busca com erro de digitação ("pistace"), card **"Indisponível hoje"** (Pistache) e **"Sob encomenda"** (Morango). Mostrar a navegação inferior. |
| 1:30–2:00 | Detalhe do produto | Alergênicos sempre visíveis, aviso de pré-encomenda, barra fixa de quantidade. Adicionar 2× Red Velvet e 1× Morango. |
| 2:00–2:40 | Carrinho | Somar item repetido, ajustar quantidade, total recalculando, recarregar a página (carrinho persiste). |
| 2:40–4:00 | Checkout | Erros de campos obrigatórios; CEP inválido (`123`), fora da área (`20040-020` → sugestão de retirada), dentro (`01310-100` → frete). Calendário bloqueando hoje/amanhã por causa da encomenda. Cartão **recusado** (`…0002`) com carrinho preservado → trocar para **PIX**. |
| 4:00–4:40 | Confirmação | Número do pedido, copiar, QR Code fictício, **Simular pagamento recebido**, linha do tempo mudando para "Pedido recebido". |
| 4:40–5:50 | Painel (janela anônima) | Login com senha errada (mensagem genérica) e com o atendente. Aba "Pedido recebido", **Avançar para: Em preparo → Pronto → Saiu para entrega → Entregue**, histórico com o responsável, comanda de impressão. Voltar ao cliente: linha do tempo atualizada sozinha. |
| 5:50–6:30 | Produtos (admin) | Entrar como admin, criar produto com preço 0 (erro) e sem alergênicos (erro), salvar; nasce **pausado**; ativar e mostrar na vitrine. Mostrar que o atendente não acessa Produtos. |
| 6:30–7:00 | Terminal | `pnpm test` (unitários + integração) e `pnpm test:e2e` (navegador em modo celular). Mostrar a matriz de rastreabilidade. Encerrar com o que ficou fora do escopo. |

**Dicas:** fale o código da regra/história quando ela aparecer ("aqui está a RN#14, capacidade diária"). Grave em 1080p; aumente o zoom do navegador se o texto ficar pequeno.
