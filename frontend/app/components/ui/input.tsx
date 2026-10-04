import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[8px] border border-[#212327] bg-[#1a1c20] px-4 py-2 text-sm font-normal text-white placeholder:text-[#7d8187] outline-none transition-all duration-200 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-normal disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:border-white/40 focus-visible:ring-1 focus-visible:ring-white/20",
        "aria-invalid:border-[#ff7a17] aria-invalid:ring-1 aria-invalid:ring-[#ff7a17]/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
