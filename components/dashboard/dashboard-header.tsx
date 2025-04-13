import type React from "react"
interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
  actions?: React.ReactNode
}

export function DashboardHeader({ heading, text, children, actions }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
