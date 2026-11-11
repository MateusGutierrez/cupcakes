import { Suspense } from "react"

import { BottomNav } from "@/components/loja/bottom-nav"
import { DemoBanner } from "@/components/loja/demo-banner"
import { HidratarCarrinho } from "@/components/loja/hidratar-carrinho"
import { SiteHeader } from "@/components/loja/site-header"

export default function LojaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <HidratarCarrinho />
      <DemoBanner />
      <SiteHeader />
      {/* Espaço extra no fim para o conteúdo não ficar atrás da BottomNav */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8">
        {children}
        {/* Atribuição exigida pelas licenças CC BY/BY-SA das fotos */}
        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Fotos ilustrativas do Wikimedia Commons ·{" "}
          <a
            href="https://github.com/MateusGutierrez/cupcakes/blob/main/docs/creditos-imagens.md"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            créditos e licenças
          </a>
        </footer>
      </main>
      {/* useSearchParams exige Suspense */}
      <Suspense>
        <BottomNav />
      </Suspense>
    </div>
  )
}
