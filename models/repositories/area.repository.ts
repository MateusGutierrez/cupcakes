import "server-only"

import { db } from "@/lib/db"

export function listarAreas() {
  return db.areaEntrega.findMany({ orderBy: { cepInicio: "asc" } })
}
