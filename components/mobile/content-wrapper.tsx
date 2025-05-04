import type { ReactNode } from "react"

interface ContentWrapperProps {
  children: ReactNode
}

export function ContentWrapper({ children }: ContentWrapperProps) {
  return <div className="main-content">{children}</div>
}
