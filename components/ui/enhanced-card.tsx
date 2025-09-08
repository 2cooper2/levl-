import type React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary" | "destructive" | "outline"
  elevation?: "low" | "medium" | "high"
  hoverable?: boolean
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = "default", elevation = "low", hoverable = true, children, ...props }, ref) => {
    let baseShadow =
      "shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(255,255,255,0.08),0_1px_2px_rgba(255,255,255,0.04)]"
    let hoverShadow =
      "hover:shadow-[0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_8px_rgba(255,255,255,0.1),0_2px_4px_rgba(255,255,255,0.08)]"

    if (elevation === "medium") {
      baseShadow =
        "shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_16px_-4px_rgba(255,255,255,0.08),0_4px_8px_-4px_rgba(255,255,255,0.06)]"
      hoverShadow =
        "hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.2),0_6px_12px_-6px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_24px_-6px_rgba(255,255,255,0.12),0_6px_12px_-6px_rgba(255,255,255,0.08)]"
    } else if (elevation === "high") {
      baseShadow =
        "shadow-[0_20px_40px_-8px_rgba(0,0,0,0.15),0_10px_20px_-8px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_40px_-8px_rgba(255,255,255,0.1),0_10px_20px_-8px_rgba(255,255,255,0.08)]"
      hoverShadow =
        "hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25),0_15px_30px_-12px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_30px_60px_-12px_rgba(255,255,255,0.15),0_15px_30px_-12px_rgba(255,255,255,0.1)]"
    }

    return (
      <Card
        ref={ref}
        {...props}
        className={cn(
          className,
          baseShadow,
          hoverable ? hoverShadow : "",
          variant === "primary" && "bg-primary text-primary-foreground",
          variant === "secondary" && "bg-secondary text-secondary-foreground",
          variant === "destructive" && "bg-destructive text-destructive-foreground",
          variant === "outline" && "border",
        )}
      >
        {children}
      </Card>
    )
  },
)

EnhancedCard.displayName = "EnhancedCard"

// Export the EnhancedCard as the default export and also export all the original card components
export { EnhancedCard }
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
