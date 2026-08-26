import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[#9ad2e6] text-black hover:bg-black hover:text-white focus-visible:ring-[#9ad2e6]",
        destructive:
          "bg-white text-black hover:bg-gray-800 focus-visible:ring-black",
        outline:
          "border-2 border-[#9ad2e6] bg-white shadow-sm hover:bg-[#9ad2e6] hover:text-black",
        secondary:
          "bg-white text-black border-2 border-black hover:bg-white hover:text-black",
        ghost:
          "hover:bg-[#9ad2e6]/10 hover:text-black",
        link: "text-[#9ad2e6] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-none gap-1.5 px-3",
        lg: "h-10 rounded-none px-6",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
