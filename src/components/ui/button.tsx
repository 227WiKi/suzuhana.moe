import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-muted-foreground focus-visible:ring-3 focus-visible:ring-muted-foreground/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 dark:border-border dark:focus-visible:border-muted-foreground dark:focus-visible:ring-muted-foreground/50 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20 dark:dark:aria-invalid:border-destructive/50 dark:dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-foreground/90",
        outline: "border-border bg-card text-foreground hover:bg-muted aria-expanded:bg-muted",
        secondary: "bg-muted text-foreground hover:bg-muted/80 aria-expanded:bg-muted",
        ghost: "text-foreground hover:bg-muted aria-expanded:bg-muted",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "control-size gap-2 px-4",
        xs: "control-size gap-1 px-2 text-xs",
        sm: "control-size gap-1 px-3 text-sm",
        lg: "min-h-12 gap-2 px-6",
        icon: "icon-control",
        "icon-xs": "icon-control",
        "icon-sm": "icon-control",
        "icon-lg": "icon-control",
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
  variant = "default",
  size = "default",
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
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
