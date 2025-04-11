import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: //button xem them
          "bg-cinestar-darkblue  text-primary-foreground shadow hover:bg-primary/90 border-2 border-[#EBDB40]",
        
        custom1:  //button dat ve header
          "bg-[#EBDB40] font-bold  text-dark shadow hover:bg-primary/90 ",
        custom2: //button dat bap nuoc
          "bg-[#7436A7] text-primary-foreground shadow hover:bg-primary/90",
        custom3: //button dat ve card
          "bg-[#EBDB40] text-primary-foreground text-dark font-bold shadow hover:bg-primary/90 flex ",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
        
      },
      size: {
        default: "h-10 px-6 py-3",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
      width: {
        
        auto: "w-auto",
        full : "w-[230px]",
        custom1: "w-[126px]",
        custom3: "w-[131px]",
      },
      position: {
        
        right: "ml-auto",
        left: "mr-auto",
        center: "mx-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      width: "full",
      position: null,
    },
  }

)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size,width,position, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size,width,position, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
