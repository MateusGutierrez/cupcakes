import { Skeleton } from "@/components/ui/skeleton"

export default function Carregando() {
  return (
    <div
      className="flex flex-col gap-6"
      aria-busy="true"
      aria-label="Carregando"
    >
      <Skeleton className="h-11 w-full" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-11 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-6 w-40" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
