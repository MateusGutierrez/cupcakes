# Manual de uso

O sistema tem duas partes: a **loja** (para clientes, sem cadastro) e o **painel da equipe** (em `/admin`). Tudo foi pensado primeiro para o celular.

> **Ambiente de demonstração:** nenhum pagamento é real. Os dados de cartão abaixo são fictícios.

---

## Parte 1 — Cliente

### 1. Escolher os cupcakes
- A **vitrine** (página inicial) mostra a coleção da estação em destaque e todos os sabores.
- Use os **filtros** (Sem glúten, Sem lactose, Vegano) ou a **busca**. A busca ignora acentos e aceita um pequeno erro de digitação ("pistace" encontra Pistache).
- Cupcakes com o selo **"Indisponível hoje"** esgotaram a produção do dia. **"Sob encomenda"** precisa de antecedência.
- Toque em um cupcake para ver descrição, ingredientes e **alergênicos**.

### 2. Montar o carrinho
- Na página do produto, escolha a quantidade e toque em **Adicionar**.
- O ícone do carrinho mostra quantos itens você tem. O carrinho fica salvo no seu aparelho.
- No **Carrinho** você pode mudar quantidades ou remover itens. Se a quantidade passar do que a loja consegue produzir, ela é ajustada e você é avisado.

### 3. Finalizar o pedido
Toque em **Finalizar pedido** e preencha, na mesma página:
1. **Seus dados:** nome, e-mail e telefone.
2. **Entrega ou retirada:** na entrega, digite o CEP. Se for atendido, aparece o frete e o endereço é preenchido automaticamente quando possível. Se não for, a loja sugere **retirar na loja** (sem frete).
3. **Data e horário:** o calendário só libera datas possíveis. Itens sob encomenda empurram a primeira data.
4. **Pagamento:**
   - **Cartão** — use `4111 1111 1111 1111` (aprovado) ou `4000 0000 0000 0002` (recusado), validade futura e qualquer CVV. Se for recusado, seu carrinho continua lá e você pode tentar outra forma.
   - **PIX** — depois de confirmar aparece um QR Code (fictício) e o código copia e cola. Use **Simular pagamento recebido** para fazer o papel do banco.
   - **Dinheiro** — paga na entrega/retirada; informe se precisa de troco.

### 4. Acompanhar
- A tela de confirmação mostra o **número do pedido** (ex.: `CG-000123`) — use **Copiar número** para guardar.
- A **linha do tempo** mostra cada etapa com data e hora e se atualiza sozinha.
- Em **Pedido** (menu inferior) você vê os pedidos feitos neste aparelho. Em outro aparelho, informe o **número e o e-mail** usados na compra.

### 5. Cancelar
Enquanto o pedido estiver como **Pedido recebido** (ou aguardando o PIX), aparece **Cancelar pedido** na página do pedido. É preciso confirmar. Pagamentos com cartão ou PIX são estornados (simulação). Depois que a cozinha começa, não dá mais para cancelar.

---

## Parte 2 — Equipe da loja

Acesse **`/admin`** e entre com seu e-mail e senha.

| Perfil | Pode |
|---|---|
| **Admin** | gerenciar produtos e pedidos |
| **Atendente** | gerenciar pedidos |

Usuários de teste: `admin@cupcakes.dev` / `admin123` e `atendente@cupcakes.dev` / `atendente123`.

### Produtos (somente Admin)
- **Lista:** cards no celular, tabela no computador. Busque pelo nome.
- **Novo:** preencha nome, descrição, ingredientes, preço (ex.: `12,50`), **alergênicos (obrigatório)**, limite diário, antecedência, selos e coleção. Campos com problema ficam destacados.
- Todo produto novo nasce **pausado**. Ligue a chave **Ativo** na lista para ele aparecer na vitrine — e desligue para pausar.
- **Editar:** toque no lápis. O endereço (link) do produto não muda.

### Pedidos
- As **abas** separam os pedidos por situação, com a quantidade em cada uma. Dentro da aba, o próximo horário aparece primeiro. A lista se atualiza sozinha.
- Cada pedido mostra horário, entrega/retirada, cliente (toque no telefone para ligar), endereço, itens, observações e pagamento.
- Use o botão **"Avançar para: …"** — ele sempre mostra só a próxima etapa possível. Retiradas pulam "Saiu para entrega".
- Pedido PIX que ficou aguardando pode ser confirmado em **Confirmar pagamento**.
- **Cancelar** só aparece antes do preparo e pede confirmação.
- **Imprimir** abre a comanda da cozinha (letras grandes, só o essencial).
- **Histórico** mostra quem mudou cada etapa e quando.
- Se outra pessoa atualizar o mesmo pedido antes de você, o sistema avisa em vez de pular etapas.
