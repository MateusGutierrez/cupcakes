import {
  PackageSearchIcon,
  SearchIcon,
  ShoppingBagIcon,
  StoreIcon,
} from "lucide-react"

export const NAV_ITEMS = [
  { href: "/", label: "Vitrine", icon: StoreIcon },
  { href: "/?busca=", label: "Buscar", icon: SearchIcon },
  { href: "/carrinho", label: "Carrinho", icon: ShoppingBagIcon },
  { href: "/acompanhar", label: "Pedido", icon: PackageSearchIcon },
] as const

/** Item ativo pelo caminho; "Buscar" e "Vitrine" dividem a rota "/". */
export function itemAtivo(
  href: string,
  pathname: string,
  buscando: boolean
): boolean {
  if (href === "/") return pathname === "/" && !buscando
  if (href.startsWith("/?busca")) return pathname === "/" && buscando
  return pathname.startsWith(href)
}
