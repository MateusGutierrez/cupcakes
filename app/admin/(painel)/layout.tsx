import { CakeSliceIcon, LogOutIcon } from "lucide-react"
import Link from "next/link"

import { AdminNav } from "@/components/admin/admin-nav"
import { Button } from "@/components/ui/button"
import { sair } from "@/controllers/auth.actions"
import { obterUsuarioLogado } from "@/lib/auth"

// O layout só exibe dados do usuário; a autorização é feita em cada página/action (exigirSessao).
export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const usuario = await obterUsuarioLogado()
  const itens = [
    ...(usuario?.papel === "ADMIN"
      ? [{ href: "/admin/produtos", label: "Produtos" }]
      : []),
    { href: "/admin/pedidos", label: "Pedidos" },
  ]

  return (
    <div className="flex min-h-svh flex-col bg-muted/30 print:bg-white">
      <header className="sticky top-0 z-40 border-b bg-background pt-[env(safe-area-inset-top)] print:hidden">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-heading font-bold"
          >
            <CakeSliceIcon className="size-5 text-primary" aria-hidden />
            Painel
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {usuario?.nome} ·{" "}
              {usuario?.papel === "ADMIN" ? "Admin" : "Atendente"}
            </span>
            <form action={sair}>
              <Button
                type="submit"
                variant="ghost"
                size="touch"
                aria-label="Sair"
              >
                <LogOutIcon />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </form>
          </div>
        </div>
        <div className="mx-auto max-w-6xl overflow-x-auto px-2">
          <AdminNav itens={itens} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] print:p-0">
        {children}
      </main>
    </div>
  )
}
