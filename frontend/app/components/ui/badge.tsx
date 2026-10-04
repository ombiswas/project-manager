import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[1.2px] font-normal whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-white/20 bg-white/10 text-white",
        secondary:
          "border-[#212327] bg-[#1a1c20] text-[#dadbdf]",
        destructive:
          "border-[#ff7a17]/40 bg-[#ff7a17]/10 text-[#ff7a17]",
        outline:
          "border-[#212327] bg-transparent text-[#7d8187]",
        ghost:
          "border-transparent bg-transparent text-[#dadbdf] hover:bg-[#1a1c20]",
        sunset:
          "border-[#ff7a17]/40 bg-[#ff7a17]/10 text-[#ff7a17]",
        breeze:
          "border-[#a0c3ec]/40 bg-[#a0c3ec]/10 text-[#a0c3ec]",
        dusk:
          "border-[#7c3aed]/40 bg-[#7c3aed]/10 text-[#c4b5fd]",
        link: "text-white underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
