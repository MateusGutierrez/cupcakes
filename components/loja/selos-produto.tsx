import { Badge } from "@/components/ui/badge"
import { selosDoProduto } from "@/models/domain/catalogo"

type Props = {
  produto: { semGluten: boolean; semLactose: boolean; vegano: boolean }
  className?: string
}

/** Selos de restrição alimentar (RN#09). */
export function SelosProduto({ produto, className }: Props) {
  const selos = selosDoProduto(produto)
  if (selos.length === 0) return null
  return (
    <ul
      className={className ?? "flex flex-wrap gap-1"}
      aria-label="Restrições atendidas"
    >
      {selos.map((s) => (
        <li key={s}>
          <Badge variant="secondary">{s}</Badge>
        </li>
      ))}
    </ul>
  )
}
