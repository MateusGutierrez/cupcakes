# Laudo de Qualidade — Cupcakes Gourmet

**Versão avaliada:** commit `fcf0f44` (10/11/2026)
**Período dos testes:** 10 e 11/11/2026
**Testadores:** Luiz Matheus Soares da Silva, Lorena Bornatowski, Peterson Bornatowski, Luis Henrique Shelbauer e Gabriel Maia Gutierrez
**Método:** teste exploratório feito pelos colegas no navegador. O autor reproduziu cada falha relatada, identificou a causa no código e registrou evidências (capturas de tela e medições automatizadas com Playwright).

## 1. Resumo

| Item | Resultado |
|---|---|
| Fluxos testados com sucesso | Vitrine, filtros por selo, busca, detalhe do produto, carrinho, checkout (validações, máscaras, CEP, frete, retirada e antecedência de 48 h), pagamento PIX e em dinheiro, acompanhamento e cancelamento do pedido |
| Testes de segurança aprovados | Injeção de `<script>` na busca, adulteração de preço e quantidade no carrinho, produto inexistente ou indisponível e consulta de pedido sem e-mail |
| Defeitos encontrados | **3**: 1 de severidade alta e 2 de severidade média |
| Sugestões de melhoria | **2**: busca com sugestões e imagens dos produtos |
| Itens não testados pelos colegas | Responsividade, desempenho (PageSpeed) e pedido (por 1 testador) |

**Classificação de severidade**
- **Alta:** viola uma regra de negócio ou permite uma operação indevida.
- **Média:** prejudica o uso ou o layout, mas existe contorno.
- **Baixa / melhoria:** é estética ou uma sugestão.

## 2. Consolidação dos testes

| Testador | Data | Funcionou | Não funcionou | Não testado |
|---|---|---|---|---|
| Luiz Matheus S. da Silva | 10/11 | Vitrine, carrinho, pedido | Busca "precisa ser melhorada" (M1) | Responsividade |
| Lorena Bornatowski | 10/11 | Vitrine, carrinho, pedido | "Limpar filtros" não limpa a busca (D1) | Responsividade |
| Peterson Bornatowski | 10/11 | Teste completo, inclusive segurança (ver item 1) | D1, D2, D3 | Desempenho (PageSpeed) |
| Luis Henrique Shelbauer | 11/11 | Vitrine, carrinho | Imagens poderiam ser melhores (M2) | Pedido |
| Gabriel Maia Gutierrez | 10/11 | Vitrine, carrinho, itens repetidos, pedido | D1 e busca sem sugestões (M1) | Responsividade |

## 3. Defeitos

### D1 — "Limpar filtros" não limpa o campo de busca
| | |
|---|---|
| **Severidade** | Média |
| **Relatado por** | Lorena, Peterson, Gabriel (e, de forma genérica, Luiz) |
| **Passos** | 1. Buscar "Bolo de Fubá". 2. Tocar em **Limpar filtros**. |
| **Esperado** | Campo de busca vazio e vitrine completa |
| **Obtido** | A vitrine volta a mostrar todos os produtos, mas o campo continua com "Bolo de Fubá". Se o usuário digitar mais uma letra, a busca antiga volta. |
| **Causa** | O campo (`components/loja/busca-form.tsx`) é não controlado (`defaultValue`). Quando o link leva para `/`, o componente continua montado e o React não reaplica o valor inicial. |
| **Correção** | Sincronizar o campo com a URL: quando o termo da URL mudar por navegação externa (como "Limpar filtros", "Vitrine" ou o botão voltar), o campo recebe o novo valor. Incluir um teste E2E com esse passo a passo. |

| Antes: busca sem resultado | Antes: após "Limpar filtros" |
|---|---|
| <img src="laudo/antes-01a-busca-sem-resultado.png" width="220"> | <img src="laudo/antes-01b-limpar-filtros-campo-preenchido.png" width="220"> |

### D2 — Pedido para domingo é aceito, embora a loja não abra
| | |
|---|---|
| **Severidade** | **Alta** (o servidor aceita um pedido que viola o horário de funcionamento) |
| **Relatado por** | Peterson |
| **Passos** | 1. Abrir o checkout e escolher **Retirar na loja**. 2. Abrir o calendário. |
| **Esperado** | Domingos bloqueados, como diz o aviso "Retiradas de segunda a sábado, das 10h às 18h" |
| **Obtido** | Domingos ficam liberados, com horários de 10:00 a 18:00. O pedido CG-000004 (domingo, 15/11, às 18:00) foi confirmado pelo servidor e depois cancelado pelo testador. |
| **Causa** | A regra de agenda (`models/domain/agenda.ts`) só considera antecedência e janela de 30 dias, sem dias de funcionamento. O aviso existe apenas como texto em `lib/loja.ts`. |
| **Correção** | Criar a regra `DIAS_FECHADOS = [domingo]` no domínio de agenda e usá-la no calendário (dias desabilitados), no cálculo da primeira data disponível e na validação do servidor (`dataPermitida`). Assim a rejeição acontece também numa requisição forjada. Incluir testes unitários e um teste E2E. |

<img src="laudo/antes-03-domingo-liberado-retirada.png" width="220">

### D3 — Busca muito longa quebra o layout e não tem limite
| | |
|---|---|
| **Severidade** | Média |
| **Relatado por** | Peterson |
| **Passos** | Buscar uma palavra muito longa sem espaços (por exemplo, 5.000 letras "a"), pelo campo ou pela URL `/?busca=…`. |
| **Esperado** | Campo com limite de caracteres e mensagem que quebra a linha dentro do card |
| **Obtido** | O campo não tem `maxlength`. A mensagem "Não achamos nada para “aaaa…”" não quebra a linha, e a página chegou a **17.492 px de largura numa tela de 1.280 px**, com rolagem horizontal. O servidor aceita termos de cerca de 20 mil caracteres pela URL. |
| **Causa** | Falta limite no campo e na leitura do parâmetro `busca` (`app/(loja)/page.tsx`). Falta quebra de palavras longas (`break-words`) na mensagem. |
| **Correção** | Limitar o termo a 60 caracteres no campo (`maxLength`) **e no servidor** (o termo é cortado antes de filtrar e de exibir). Encurtar o termo na mensagem e aplicar `break-words`. Incluir teste unitário do corte e teste E2E que mede a largura da página. |

<img src="laudo/antes-02-busca-longa-estoura-layout.png" width="480">

## 4. Sugestões de melhoria

### M1 — Busca sem sugestões quando não encontra nada
Luiz e Gabriel relataram que a busca "precisa ser melhorada" e "não busca possíveis opções". Hoje ela ignora acentos e aceita um erro de digitação por palavra, mas, quando não encontra nada, só mostra "Nenhum produto encontrado".
**Melhoria:**
- quando não houver resultado, mostrar **"Você quis dizer…"** com até 3 produtos de nome mais parecido;
- aumentar a tolerância para 2 erros em palavras com 8 letras ou mais;
- encontrar o produto a partir do início de qualquer palavra do nome ("cho" encontra "Chocolate Belga").

### M2 — Imagens dos produtos
Luis sugeriu imagens melhores. Hoje os produtos usam ilustrações vetoriais (SVG) genéricas, todas com o mesmo desenho e cores diferentes.
**Melhoria:** trocar por fotos de cupcakes com licença livre (Unsplash/Pexels, com crédito), otimizadas pelo `next/image`.

## 5. Itens não testados pelos colegas

| Item | Situação | Ação |
|---|---|---|
| Responsividade (Luiz, Lorena, Gabriel) | Já coberta por teste automatizado: `e2e/mobile-320.spec.ts` verifica que não há rolagem horizontal em 320 px e 360 px em todas as telas, e a suíte E2E roda num Pixel 7 | Anexar capturas em celular (390 px), tablet (768 px) e desktop (1.280 px) |
| Desempenho / PageSpeed (Peterson) | Não medido | Rodar o Lighthouse (o mesmo motor do PageSpeed Insights) na versão publicada na Vercel, nos modos mobile e desktop, e anexar as notas |
| Pedido (Luis) | Testado pelos outros quatro colegas e pela suíte E2E (`e2e/compra.spec.ts`: cartão, PIX, dinheiro e cartão recusado) | Nenhuma |

## 6. Situação das correções

| ID | Descrição | Severidade | Situação |
|---|---|---|---|
| D2 | Pedido aceito em dia fechado (domingo) | Alta | Pendente |
| D1 | "Limpar filtros" não limpa o campo | Média | Pendente |
| D3 | Busca longa quebra o layout e não tem limite | Média | Pendente |
| M1 | Sugestões na busca | Melhoria | Pendente |
| M2 | Fotos dos produtos | Melhoria | Pendente |

O plano de correção está em [`plano-acao.md`](plano-acao.md), na Fase 6. Depois de cada correção, esta tabela recebe o status **Corrigido**, o commit e a captura "depois".
