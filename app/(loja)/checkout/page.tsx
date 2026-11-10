import type { Metadata } from "next"

import { CheckoutForm } from "@/components/loja/checkout/checkout-form"

export const metadata: Metadata = { title: "Finalizar pedido" }

export default function CheckoutPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-xl font-bold">Finalizar pedido</h1>
      <CheckoutForm />
    </div>
  )
}
