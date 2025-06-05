import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
import { FiMinus, FiPlus } from "react-icons/fi";

const productCardVariants = cva(
  "rounded-lg  bg-card text-card-foreground shadow-sm flex flex-col items-center space-y-4 p-0 ",
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

const ticketCardVariants = cva(
  "rounded-lg  text-white p-6 shadow-sm flex flex-col",
  {
    variants: {
      variant: {
        default: "border border-white ",
        outline: "border border-gray-700",
      },
      size: {
        default: "w-full max-w-sm",
        sm: "w-64",
        lg: "w-96",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Interface cho ticket card riêng, không cần thuộc tính image
interface TicketCardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof ticketCardVariants> {
  id: string;
  title: string;
  subtitle?: string; // Cho phần "ĐƠN" trong ảnh
  price: string;
  quantity?: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
}



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

      {/* product */}
      <div className="flex gap-4 items-stretch min-h-[187px] w-full">
        {/* Image Section */}
        <div className="w-36 h-[187px] bg-gray-100 rounded-sm flex-shrink-0">
          <div className="relative w-full h-full group  overflow-hidden">
            <img
              src={image}
              alt={title}
              className="object-contain w-full h-full rounded-lg transition-transform duration-700 ease-in-out transform group-hover:scale-110 group-hover:rotate-6"
            />
          </div>
        </div>

        {/* Context */}
        <div className="flex flex-col justify-between flex-1">
          {/* Top content */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-left">{title}</h3>

            {description && (
              <p className="text-sm text-left text-gray-300">{description}</p>
            )}

            <p className="text-sm  text-left">{price}</p>
          </div>

          {/* Quantity Controls at bottom */}
          <div className="flex items-center justify-start gap-4 mt-4">
            <div className="flex items-center bg-[#94A3B8] rounded-md text-white text-xl font-bold px-2 py-1 hover:bg-[#EBDB40] hover:text-dark transition">
              {/* Decrease */}
              <div
                role="button"
                onClick={onDecrease}
                className="w-8 h-8 flex items-center justify-center text-dark rounded-md text-xl font-bold cursor-pointer"
              >
                <FiMinus className="w-4 hover:bg-[#663399] rounded-full" />
              </div>

              {/* Quantity */}
              <span className="w-12 text-center text-lg font-medium text-dark">{quantity}</span>

              {/* Increase */}
              <div
                role="button"
                onClick={onIncrease}
                className="w-8 h-8 flex items-center justify-center text-dark rounded-md text-xl font-bold cursor-pointer"
              >
                <FiPlus className="w-4 hover:bg-[#663399] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
);

const CardTicket = React.forwardRef<HTMLDivElement, TicketCardProps>(
  (
    {
      id,
      className,
      title,
      subtitle,
      price,
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
      className={cn(ticketCardVariants({ variant, size, className }))}
      {...props}
    >
      {/* Tiêu đề */}
      <h3 className="text-xl font-bold text-white">{title}</h3>
      
      {/* Phụ đề (nếu có) */}
      {subtitle && (
        <span className="text-lg font-medium text-[#EBDB40] mt-1">{subtitle}</span>
      )}
      
      {/* Giá */}
      <p className="text-lg font-semibold my-3">{price}</p>
      
      {/* Quantity Controls */}
      
          <div className="flex items-center justify-start gap-4 mt-4">
            <div className="flex items-center bg-[#94A3B8] rounded-md text-white text-xl font-bold px-2 py-1 hover:bg-[#EBDB40] hover:text-dark transition">
              {/* Decrease */}
              <div
                role="button"
                onClick={onDecrease}
                className="w-8 h-8 flex items-center justify-center text-dark rounded-md text-xl font-bold cursor-pointer"
              >
                <FiMinus className="w-4 hover:bg-[#663399] rounded-full" />
              </div>

              {/* Quantity */}
              <span className="w-12 text-center text-lg font-medium text-dark">{quantity}</span>

              {/* Increase */}
              <div
                role="button"
                onClick={onIncrease}
                className="w-8 h-8 flex items-center justify-center text-dark rounded-md text-xl font-bold cursor-pointer"
              >
                <FiPlus className="w-4 hover:bg-[#663399] rounded-full" />
              </div>
            </div>
          </div>
    </div>
  )
);

CardProduct.displayName = "CardProduct";
CardTicket.displayName = "CardTicket";

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
  CardTicket,
  productCardVariants,
  ticketCardVariants,
};