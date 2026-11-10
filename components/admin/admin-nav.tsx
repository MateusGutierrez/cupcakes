"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

type Item = { href: string; label: string }

export function AdminNav({ itens }: { itens: Item[] }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Seções do painel">
      <ul className="flex gap-1">
        {itens.map(({ href, label }) => {
          const ativo = pathname.startsWith(href)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  ativo && "bg-muted text-foreground"
                )}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
