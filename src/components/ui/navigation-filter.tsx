import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const navigationFilterVariants = cva(
    "relative w-full transition-all duration-200",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-[#ECF2FF] to-[#FBFCFF]",
                dark: "bg-cinestar-darkblue",
            },
            size: {
                default: "h-[90px] py-6 px-8",
                sm: "py-4 px-6",
                lg: "py-8 px-10",
            },
            shadow: {
                default: "shadow-lg",
                none: "",
            },
            rounded: {
                default: "rounded-lg",
                none: "",
                full: "rounded-full",
            },
            position: {
                default: "relative",
                fixed: "fixed top-0 left-0 right-0",
                sticky: "sticky top-0",
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            shadow: "default",
            rounded: "default",
            position: "default",
        },
    }
)

const selectVariants = cva(
    "w-full transition-all duration-200 outline-none", // Thêm outline-none để xóa viền mặc định
    {
        variants: {
            variant: {
                default: "bg-white text-gray-800 font-bold border border-gray-300 text-sm hover:border-gray-400",
                dark: "bg-gray-800 text-white border border-gray-700 text-sm hover:border-gray-600",
                custom1 : "bg-[#EBDB40] text-[#663399] font-bold border border-gray-300 text-sm hover:border-gray-400"
            },
            state: {
                default: "",
                disabled: "bg-gray-100 cursor-not-allowed opacity-50",
            },
            focus: {
                default: "focus:outline-none focus:ring-0", // Xóa focus ring và thêm outline-none
                none: "",
            }
        },
        defaultVariants: {
            variant: "default",
            state: "default",
            focus: "default",
        },
    }
)

export interface NavigationFilterProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof navigationFilterVariants> {
    asChild?: boolean
}

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> { }

const NavigationFilter = React.forwardRef<HTMLDivElement, NavigationFilterProps>(
    ({ className, variant, size, shadow, rounded, position, ...props }, ref) => {
        return (
            <div
                className={cn(navigationFilterVariants({ variant, size, shadow, rounded, position, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
NavigationFilter.displayName = "NavigationFilter"

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, variant, state, focus, ...props }, ref) => {
        return (
            <select
                className={cn(
                    selectVariants({ variant, state, focus }),
                    "p-3 rounded-lg shadow-sm outline-none", // Thêm outline-none ở đây nữa
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Select.displayName = "Select"

export { NavigationFilter, Select, navigationFilterVariants, selectVariants }