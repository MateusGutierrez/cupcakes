-- CreateTable
CREATE TABLE "Produto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ingredientes" TEXT NOT NULL,
    "precoCentavos" INTEGER NOT NULL,
    "imagemUrl" TEXT NOT NULL,
    "alergenicos" TEXT NOT NULL,
    "semGluten" BOOLEAN NOT NULL DEFAULT false,
    "semLactose" BOOLEAN NOT NULL DEFAULT false,
    "vegano" BOOLEAN NOT NULL DEFAULT false,
    "limiteDiario" INTEGER NOT NULL DEFAULT 20,
    "antecedenciaHoras" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "colecao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AreaEntrega" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cepInicio" TEXT NOT NULL,
    "cepFim" TEXT NOT NULL,
    "freteCentavos" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "nomeCliente" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "cep" TEXT,
    "endereco" TEXT,
    "dataAgendada" DATETIME NOT NULL,
    "subtotalCentavos" INTEGER NOT NULL,
    "freteCentavos" INTEGER NOT NULL,
    "totalCentavos" INTEGER NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "statusPagamento" TEXT NOT NULL,
    "cartaoFinal" TEXT,
    "trocoParaCentavos" INTEGER,
    "status" TEXT NOT NULL,
    "observacao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pedidoId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "nomeProduto" TEXT NOT NULL,
    "precoUnitarioCentavos" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "mensagem" TEXT,
    CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemPedido_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HistoricoStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pedidoId" INTEGER NOT NULL,
    "de" TEXT,
    "para" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoricoStatus_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LogAuditoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LogAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Produto_slug_key" ON "Produto"("slug");

-- CreateIndex
CREATE INDEX "Produto_ativo_idx" ON "Produto"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_numero_key" ON "Pedido"("numero");

-- CreateIndex
CREATE INDEX "Pedido_dataAgendada_idx" ON "Pedido"("dataAgendada");

-- CreateIndex
CREATE INDEX "Pedido_status_idx" ON "Pedido"("status");

-- CreateIndex
CREATE INDEX "ItemPedido_pedidoId_idx" ON "ItemPedido"("pedidoId");

-- CreateIndex
CREATE INDEX "ItemPedido_produtoId_idx" ON "ItemPedido"("produtoId");

-- CreateIndex
CREATE INDEX "HistoricoStatus_pedidoId_idx" ON "HistoricoStatus"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "LogAuditoria_entidade_entidadeId_idx" ON "LogAuditoria"("entidade", "entidadeId");
