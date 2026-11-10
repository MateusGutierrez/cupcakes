// Dados de exemplo para desenvolvimento e avaliação.
// Rodar com `pnpm db:seed` (ou automaticamente após `pnpm db:reset`).
import "dotenv/config"

import bcrypt from "bcryptjs"

import { PrismaClient, type Prisma } from "../generated/prisma/client"
import { criarAdapter } from "../lib/adapter"

const db = new PrismaClient({ adapter: criarAdapter() })

const COLECAO_SAZONAL = "Natal 2026"

type ProdutoSeed = Omit<Prisma.ProdutoCreateInput, "imagemUrl">

const produtos: ProdutoSeed[] = [
  {
    slug: "red-velvet",
    nome: "Red Velvet",
    descricao:
      "Massa aveludada de cacau com toque de baunilha e cobertura de cream cheese.",
    ingredientes:
      "Farinha de trigo, açúcar, ovos, manteiga, cacau, leitelho, cream cheese, baunilha",
    precoCentavos: 1200,
    alergenicos: "Contém glúten, ovos e leite",
    destaque: true,
  },
  {
    slug: "chocolate-belga",
    nome: "Chocolate Belga",
    descricao:
      "Massa de chocolate 54% recheada com ganache e cobertura de brigadeiro gourmet.",
    ingredientes:
      "Farinha de trigo, chocolate belga 54%, açúcar, ovos, manteiga, creme de leite",
    precoCentavos: 1100,
    alergenicos:
      "Contém glúten, ovos, leite e soja. Pode conter traços de castanhas",
    destaque: true,
  },
  {
    slug: "limao-siciliano",
    nome: "Limão Siciliano",
    descricao:
      "Massa cítrica com recheio de curd de limão e merengue maçaricado.",
    ingredientes:
      "Farinha de trigo, açúcar, ovos, manteiga, limão siciliano, claras",
    precoCentavos: 1000,
    alergenicos: "Contém glúten, ovos e leite",
  },
  {
    slug: "cenoura-brigadeiro",
    nome: "Cenoura com Brigadeiro",
    descricao:
      "O clássico bolo de cenoura em versão cupcake, com cobertura de brigadeiro.",
    ingredientes:
      "Farinha de trigo, cenoura, açúcar, ovos, óleo, leite condensado, cacau",
    precoCentavos: 1000,
    alergenicos: "Contém glúten, ovos e leite",
  },
  {
    // Pré-encomenda: exige 48h de antecedência
    slug: "morango-champagne",
    nome: "Morango com Champagne",
    descricao:
      "Massa de baunilha com morangos frescos e chantilly de champagne. Sob encomenda.",
    ingredientes:
      "Farinha de trigo, açúcar, ovos, manteiga, morango, creme de leite, champagne",
    precoCentavos: 1400,
    alergenicos: "Contém glúten, ovos, leite e álcool",
    antecedenciaHoras: 48,
    destaque: true,
  },
  {
    // Limite 0: aparece como "indisponível hoje"
    slug: "pistache",
    nome: "Pistache",
    descricao: "Massa amanteigada com creme de pistache siciliano.",
    ingredientes:
      "Farinha de trigo, pistache, açúcar, ovos, manteiga, creme de leite",
    precoCentavos: 1500,
    alergenicos: "Contém glúten, ovos, leite e pistache (castanha)",
    limiteDiario: 0,
  },
  {
    slug: "coco-vegano",
    nome: "Coco Vegano",
    descricao:
      "Massa de coco sem ingredientes de origem animal, com cobertura de creme de coco.",
    ingredientes:
      "Farinha de trigo, leite de coco, açúcar demerara, óleo de coco, coco ralado",
    precoCentavos: 1200,
    alergenicos: "Contém glúten. Pode conter traços de castanhas",
    vegano: true,
    semLactose: true,
  },
  {
    slug: "banana-canela",
    nome: "Banana com Canela",
    descricao:
      "Massa sem glúten de farinha de arroz e banana, com cobertura de canela.",
    ingredientes:
      "Farinha de arroz, banana, açúcar mascavo, ovos, óleo, canela",
    precoCentavos: 1100,
    alergenicos: "Contém ovos. Produzido em cozinha que manipula glúten",
    semGluten: true,
    semLactose: true,
  },
  {
    slug: "doce-de-leite",
    nome: "Doce de Leite",
    descricao: "Massa de baunilha recheada com doce de leite mineiro.",
    ingredientes: "Farinha de trigo, açúcar, ovos, manteiga, doce de leite",
    precoCentavos: 1000,
    alergenicos: "Contém glúten, ovos e leite",
  },
  {
    slug: "panetone",
    nome: "Panetone",
    descricao:
      "Massa com frutas cristalizadas e gotas de chocolate, cobertura de buttercream.",
    ingredientes:
      "Farinha de trigo, açúcar, ovos, manteiga, frutas cristalizadas, chocolate",
    precoCentavos: 1300,
    alergenicos: "Contém glúten, ovos, leite e soja",
    colecao: COLECAO_SAZONAL,
    limiteDiario: 15,
  },
  {
    slug: "rabanada",
    nome: "Rabanada",
    descricao:
      "Massa de pão doce com canela e açúcar, recheio de creme de baunilha.",
    ingredientes:
      "Farinha de trigo, açúcar, ovos, leite, manteiga, canela, baunilha",
    precoCentavos: 1300,
    alergenicos: "Contém glúten, ovos e leite",
    colecao: COLECAO_SAZONAL,
    limiteDiario: 15,
  },
  {
    slug: "nozes-caramelo",
    nome: "Nozes com Caramelo",
    descricao: "Massa com nozes tostadas e cobertura de caramelo salgado.",
    ingredientes:
      "Farinha de trigo, nozes, açúcar, ovos, manteiga, creme de leite, flor de sal",
    precoCentavos: 1400,
    alergenicos: "Contém glúten, ovos, leite e nozes",
    colecao: COLECAO_SAZONAL,
    limiteDiario: 10,
  },
]

// Produto inativo: não deve aparecer na vitrine
const produtoInativo: ProdutoSeed = {
  slug: "maracuja",
  nome: "Maracujá",
  descricao: "Massa de baunilha com mousse de maracujá. Sabor pausado.",
  ingredientes:
    "Farinha de trigo, açúcar, ovos, manteiga, maracujá, creme de leite",
  precoCentavos: 1100,
  alergenicos: "Contém glúten, ovos e leite",
  ativo: false,
}

// Faixas de CEP de exemplo (São Paulo)
const areas: Prisma.AreaEntregaCreateInput[] = [
  {
    nome: "Centro",
    cepInicio: "01000000",
    cepFim: "01599999",
    freteCentavos: 800,
  },
  {
    nome: "Zona Oeste",
    cepInicio: "05000000",
    cepFim: "05899999",
    freteCentavos: 1000,
  },
  {
    nome: "Zona Sul",
    cepInicio: "04000000",
    cepFim: "04999999",
    freteCentavos: 1500,
  },
]

async function main() {
  // Limpa na ordem das dependências
  await db.logAuditoria.deleteMany()
  await db.historicoStatus.deleteMany()
  await db.itemPedido.deleteMany()
  await db.pedido.deleteMany()
  await db.produto.deleteMany()
  await db.areaEntrega.deleteMany()
  await db.usuario.deleteMany()

  for (const p of produtos) {
    await db.produto.create({
      data: {
        ...p,
        imagemUrl: `/produtos/${p.slug}.svg`,
        ativo: p.ativo ?? true,
      },
    })
  }
  await db.produto.create({
    data: {
      ...produtoInativo,
      imagemUrl: `/produtos/${produtoInativo.slug}.svg`,
    },
  })

  await db.areaEntrega.createMany({ data: areas })

  await db.usuario.createMany({
    data: [
      {
        nome: "Ana Admin",
        email: "admin@cupcakes.dev",
        senhaHash: await bcrypt.hash("admin123", 10),
        papel: "ADMIN",
      },
      {
        nome: "Beto Atendente",
        email: "atendente@cupcakes.dev",
        senhaHash: await bcrypt.hash("atendente123", 10),
        papel: "ATENDENTE",
      },
    ],
  })

  console.log(
    `Seed concluído: ${produtos.length + 1} produtos, ${areas.length} áreas, 2 usuários.`
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
