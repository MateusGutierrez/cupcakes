import { PencilIcon, PlusIcon, SearchIcon } from "lucide-react"
import type { Metadata } from "next"
import Form from "next/form"
import Image from "next/image"
import Link from "next/link"

import { SwitchAtivo } from "@/components/admin/switch-ativo"
import { ToastAoCarregar } from "@/components/toast-ao-carregar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { exigirSessao } from "@/lib/auth"
import { formatBRL } from "@/lib/format"
import { listarTodosProdutos } from "@/models/repositories/produto.repository"

export const metadata: Metadata = { title: "Produtos" }

const MENSAGENS = {
  novo: "Produto criado (inativo). Ative para aparecer na vitrine.",
  editado: "Produto atualizado.",
}

function Miniatura({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="48px"
        unoptimized={!src.startsWith("/")}
        className="object-cover"
      />
    </div>
  )
}

// US-16 — Gestão de produtos
export default async function ProdutosAdminPage({
  searchParams,
}: PageProps<"/admin/produtos">) {
  await exigirSessao(["ADMIN"])
  const { busca, salvo } = await searchParams
  const termo = typeof busca === "string" ? busca : ""
  const produtos = await listarTodosProdutos(termo)

  return (
    <div className="flex flex-col gap-4">
      <ToastAoCarregar mensagem={MENSAGENS[salvo as keyof typeof MENSAGENS]} />

      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-xl font-bold">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className={buttonVariants({ size: "touch" })}
        >
          <PlusIcon />
          Novo
        </Link>
      </div>

      <Form action="/admin/produtos" role="search" className="relative">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          name="busca"
          type="search"
          defaultValue={termo}
          placeholder="Buscar por nome"
          aria-label="Buscar produto por nome"
          className="pl-10 md:pl-9"
        />
      </Form>

      {produtos.length === 0 && (
        <p className="rounded-lg border bg-background p-6 text-center text-muted-foreground">
          Nenhum produto encontrado.
        </p>
      )}

      {/* Celular: lista de cards */}
      <ul className="flex flex-col gap-2 md:hidden">
        {produtos.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-1 rounded-lg border bg-background p-3"
          >
            <div className="flex items-center gap-3">
              <Miniatura src={p.imagemUrl} alt={p.nome} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {formatBRL(p.precoCentavos)} · limite {p.limiteDiario}/dia
                </p>
              </div>
              <Link
                href={`/admin/produtos/${p.id}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "icon-touch",
                })}
                aria-label={`Editar ${p.nome}`}
              >
                <PencilIcon />
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <SwitchAtivo id={p.id} nome={p.nome} ativo={p.ativo} />
              {p.destaque && <Badge variant="secondary">Destaque</Badge>}
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: tabela */}
      {produtos.length > 0 && (
        <div className="hidden rounded-lg border bg-background md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Limite/dia</TableHead>
                <TableHead>Coleção</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Miniatura src={p.imagemUrl} alt={p.nome} />
                      <span className="font-medium">{p.nome}</span>
                      {p.destaque && (
                        <Badge variant="secondary">Destaque</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatBRL(p.precoCentavos)}</TableCell>
                  <TableCell>{p.limiteDiario}</TableCell>
                  <TableCell>{p.colecao ?? "—"}</TableCell>
                  <TableCell>
                    <SwitchAtivo id={p.id} nome={p.nome} ativo={p.ativo} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/produtos/${p.id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      <PencilIcon />
                      Editar
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
