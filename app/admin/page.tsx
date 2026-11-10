import { redirect } from "next/navigation"

import { exigirSessao, inicioDoPapel } from "@/lib/auth"

export default async function AdminInicio({
  searchParams,
}: PageProps<"/admin">) {
  const usuario = await exigirSessao()
  const { negado } = await searchParams
  redirect(inicioDoPapel(usuario.papel) + (negado ? "?negado=1" : ""))
}
