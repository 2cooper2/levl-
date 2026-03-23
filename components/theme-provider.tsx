"use client"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      forcedTheme="light" 
      disableTransitionOnChange
      enableSystem={false}
      storageKey="levl-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
