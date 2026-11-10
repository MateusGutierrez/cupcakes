import { CakeSliceIcon } from "lucide-react"
import type { Metadata } from "next"

import { LoginForm } from "@/components/admin/login-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = { title: "Entrar — Equipe" }

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const { de } = await searchParams

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <CakeSliceIcon className="mx-auto size-8 text-primary" aria-hidden />
          <CardTitle className="text-lg">Painel da equipe</CardTitle>
          <CardDescription>Entre com seu e-mail e senha.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm de={typeof de === "string" ? de : undefined} />
        </CardContent>
      </Card>
    </main>
  )
}
