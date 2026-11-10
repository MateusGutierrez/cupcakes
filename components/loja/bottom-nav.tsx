"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"

import { itemAtivo, NAV_ITEMS } from "./nav-items"

/** Navegação fixa no rodapé, só no celular (some a partir do `md`). */
export function BottomNav() {
  const pathname = usePathname()
  const buscando = useSearchParams().has("busca")

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const ativo = itemAtivo(href, pathname, buscando)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors",
                  ativo && "text-primary"
                )}
              >
                <Icon className="size-6" aria-hidden />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
