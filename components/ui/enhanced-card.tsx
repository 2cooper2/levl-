import { CardContent } from "@/components/ui/card"
import { CardFooter } from "@/components/ui/card"
import type React from "react"
import { forwardRef } from "react"
import {
  Card as BaseCard,
  CardContent as BaseCardContent,
  CardDescription,
  CardFooter as BaseCardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Enhanced Card component with additional styling
const EnhancedCard = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <BaseCard
      ref={ref}
      className={cn(
        "overflow-hidden border border-lavender-200/70 bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 shadow-[0_10px_20px_rgba(124,58,237,0.15)] hover:shadow-[0_15px_30px_rgba(124,58,237,0.25)] transition-all duration-300 transform hover:-translate-y-1",
        className,
      )}
      {...props}
    />
  ),
)
EnhancedCard.displayName = "EnhancedCard"

// Enhanced CardContent component
const EnhancedCardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <BaseCardContent ref={ref} className={cn("p-6", className)} {...props} />,
)
EnhancedCardContent.displayName = "EnhancedCardContent"

// Enhanced CardFooter component
const EnhancedCardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <BaseCardFooter ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
)
EnhancedCardFooter.displayName = "EnhancedCardFooter"

// Export the components
export { EnhancedCard, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

// Export aliases for compatibility
export { EnhancedCard as Card }
export { EnhancedCardContent }
export { EnhancedCardFooter }
