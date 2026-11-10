"use client"

import { useSyncExternalStore } from "react"

/** Breakpoint `md` do Tailwind (768px). */
export const QUERY_DESKTOP = "(min-width: 768px)"

/**
 * Indica se a media query bate. No servidor (e no primeiro render) retorna `false`,
 * ou seja, assume celular — coerente com o mobile-first.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (avisar) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", avisar)
      return () => mql.removeEventListener("change", avisar)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}
