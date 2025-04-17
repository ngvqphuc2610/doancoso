import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
import { FiMinus, FiPlus } from "react-icons/fi";

const productCardVariants = cva(
  "rounded-lg  bg-card text-card-foreground shadow-sm flex flex-col items-center space-y-4 p-4 ",
  {
    variants: {
      variant: {
        default: "bg-[#13172C] text-white font-bold ",
        outline: "border border-gray-200",
      },
      size: {
        default: "w-64 h-auto",
        sm: "w-48 h-auto",
        lg: "w-80 h-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ProductCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof productCardVariants> {
  id: string;
  className?: string;
  title: string;
  description?: string;
  price: string;
  image: string;
  quantity?: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
}

const CardProduct = React.forwardRef<HTMLDivElement, ProductCardProps>(
  (
    {
      id,
      className,
      title,
      description,
      price,
      image,
      quantity = 0,
      onIncrease,
      onDecrease,
      variant,
      size,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(productCardVariants({ variant, size, className }))}
      {...props}
    >
      {/* Image Section */}
      <div className="w-36 h-[187px] bg-[#EFEFEF]">
        <div className="relative w-36 h-[185px] group  overflow-hidden">
          <img
            src={image}
            alt={title}
            className="object-contain rounded-lg w-full h-full transition-transform duration-700 ease-in-out transform group-hover:scale-110 group-hover:rotate-6"
          />
        </div>
      </div>
      {/* Title */}
      <h3 className="text-lg font-bold text-center">{title}</h3>

      {/* Description */}
      {description && <p className="text-sm text-center text-gray-300">{description}</p>}

      {/* Price */}
      <p className="text-xl font-bold ">{price}</p>

      {/* Quantity Controls */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center justify-center bg-[#94A3B8] hover:bg-[#EBDB40] hover:text-dark text-white rounded-md text-xl font-bold">
          <div
            role="button"
            onClick={onDecrease}
            className="w-8 h-8 flex items-center justify-center text-dark rounded-md text-xl font-bold cursor-pointer"
          >
            <FiMinus className="w-4 hover:bg-[#663399] rounded-full" />
          </div>
          <span className="w-12 text-center text-lg font-medium text-dark">{quantity}</span>
          <div
            role="button"
            onClick={onIncrease}
            className="w-8 h-8 flex items-center justify-center rounded-full text-dark text-xl font-bold cursor-pointer"
          >
            <FiPlus className="w-4 hover:bg-[#663399] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
);

CardProduct.displayName = "CardProduct";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow group",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("py-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center py-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardProduct,
  productCardVariants,
};
