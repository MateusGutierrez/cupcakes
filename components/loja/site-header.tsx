import { CakeSliceIcon } from "lucide-react"
import Link from "next/link"

import { NAV_ITEMS } from "./nav-items"

/** Cabeçalho da loja. No celular mostra só a marca; os links aparecem a partir do `md`. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-lg font-bold"
        >
          <CakeSliceIcon className="size-6 text-primary" aria-hidden />
          Cupcakes Gourmet
        </Link>
        <nav aria-label="Navegação principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
