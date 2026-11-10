import { Skeleton } from "@/components/ui/skeleton"

export default function CarregandoProduto() {
  return (
    <div
      className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-8"
      aria-busy="true"
    >
      <Skeleton className="-mx-4 aspect-square md:mx-0 md:mt-14 md:rounded-xl" />
      <div className="flex flex-col gap-3 md:pt-14">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  )
}
