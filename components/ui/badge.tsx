import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "low" | "medium" | "high" | "todo" | "in-progress" | "done"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default",
        {
          "border-transparent bg-blue-600 text-white shadow": variant === "default",
          "border-transparent bg-gray-100 text-gray-900": variant === "secondary",
          "border-transparent bg-red-500 text-white shadow": variant === "destructive",
          "text-gray-950 border-gray-200": variant === "outline",
          "border-transparent bg-green-100 text-green-700": variant === "low",
          "border-transparent bg-yellow-100 text-yellow-700": variant === "medium",
          "border-transparent bg-red-100 text-red-700": variant === "high",
          "border-transparent bg-slate-100 text-slate-700": variant === "todo",
          "border-transparent bg-blue-100 text-blue-700": variant === "in-progress",
          "border-transparent bg-emerald-100 text-emerald-700": variant === "done",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
