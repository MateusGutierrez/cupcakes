"use server"

import { z } from "zod"

import {
  type ItemCarrinho,
  reconciliarCarrinho,
} from "@/models/domain/carrinho"
import { buscarProdutosAtivosPorIds } from "@/models/repositories/produto.repository"

const itensSchema = z
  .array(
    z.object({
      produtoId: z.number().int().positive(),
      slug: z.string(),
      nome: z.string(),
      precoCentavos: z.number().int(),
      imagemUrl: z.string(),
      quantidade: z.number().int().positive().max(1000),
      maximo: z.number().int(),
      antecedenciaHoras: z.number().int(),
    })
  )
  .max(50)

/** Confere o carrinho local com preços e capacidade atuais (F4). */
export async function revalidarCarrinho(
  itens: ItemCarrinho[]
): Promise<{ itens: ItemCarrinho[]; avisos: string[] }> {
  const dados = itensSchema.safeParse(itens)
  if (!dados.success)
    return {
      itens: [],
      avisos: ["Seu carrinho estava inválido e foi esvaziado."],
    }
  const atuais = await buscarProdutosAtivosPorIds(
    dados.data.map((i) => i.produtoId)
  )
  return reconciliarCarrinho(dados.data, atuais)
}
