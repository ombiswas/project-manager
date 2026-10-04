import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-[8px] border border-[#212327] bg-[#1a1c20] px-4 py-2.5 text-sm font-normal text-white placeholder:text-[#7d8187] outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:border-white/40 focus-visible:ring-1 focus-visible:ring-white/20",
        "aria-invalid:border-[#ff7a17] aria-invalid:ring-1 aria-invalid:ring-[#ff7a17]/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
