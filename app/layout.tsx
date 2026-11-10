import type { Metadata, Viewport } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Cupcakes Gourmet",
    template: "%s · Cupcakes Gourmet",
  },
  description:
    "Cupcakes artesanais com entrega ou retirada. Peça online em poucos toques.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Permite usar env(safe-area-inset-*) em celulares com notch
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
