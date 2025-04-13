import type React from "react"
interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
  actions?: React.ReactNode
}

export function EnhancedDashboardHeader({ heading, text, children, actions }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-2 mb-8">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{heading}</h1>
        {text && <p className="text-muted-foreground max-w-[750px]">{text}</p>}
        {children}
      </div>
      {actions && <div className="flex items-center gap-3 mt-2 md:mt-0">{actions}</div>}
    </div>
  )
}
