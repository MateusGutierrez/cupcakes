"use client"

import type { ReactNode } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { QUERY_DESKTOP, useMediaQuery } from "@/hooks/use-media-query"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  /** Ações principais (botões). No celular ficam no rodapé do drawer. */
  footer?: ReactNode
  children?: ReactNode
}

/** Drawer de baixo para cima no celular; Dialog centralizado a partir do `md`. */
export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
}: Props) {
  const desktop = useMediaQuery(QUERY_DESKTOP)

  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
          {footer && <DialogFooter>{footer}</DialogFooter>}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4">{children}</div>
        {footer && (
          <DrawerFooter className="pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
