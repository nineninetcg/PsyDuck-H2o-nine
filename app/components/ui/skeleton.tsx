import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-[#9ad2e6]/10 animate-pulse rounded-none", className)}
      {...props}
    />
  )
}

export { Skeleton }
