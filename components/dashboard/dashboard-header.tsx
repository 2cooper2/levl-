import type React from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
  actions?: React.ReactNode
}

export function DashboardHeader({ heading, text, children, actions }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-6 mb-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl shadow-sm border border-slate-100">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
          {heading}
        </h1>
        {text && <p className="text-slate-500 max-w-2xl">{text}</p>}
        {children}
      </div>
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="gradient"
          className="gap-1 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
        >
          <Link href="/dashboard/services/new">
            <PlusCircle className="h-4 w-4" />
            Service+
          </Link>
        </Button>
        {actions}
      </div>
    </div>
  )
}
