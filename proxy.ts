import { type NextRequest, NextResponse } from "next/server"

import { COOKIE_SESSAO, verificarSessao } from "@/lib/sessao-token"

/**
 * Checagem otimista: quem não tem sessão válida vai para o login.
 * A verificação definitiva (usuário existe, papel permitido) fica em `exigirSessao()`.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const sessao = await verificarSessao(request.cookies.get(COOKIE_SESSAO)?.value)
  const naTelaDeLogin = pathname === "/admin/login"

  if (!sessao && !naTelaDeLogin) {
    const login = new URL("/admin/login", request.url)
    if (pathname !== "/admin") login.searchParams.set("de", pathname + search)
    return NextResponse.redirect(login)
  }

  if (sessao && naTelaDeLogin) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
