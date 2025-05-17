// This file can be imported early in your app to verify dependencies
// It won't affect runtime, just build-time checking

type Dependency = {
  name: string
  version?: string
  isOptional?: boolean
}

// List of required dependencies
const REQUIRED_DEPENDENCIES: Dependency[] = [
  { name: "next" },
  { name: "react" },
  { name: "react-dom" },
  { name: "@supabase/supabase-js" },
  { name: "zod" },
  { name: "stripe", isOptional: true },
  { name: "@stripe/react-stripe-js", isOptional: true },
  { name: "@stripe/stripe-js", isOptional: true },
  { name: "lucide-react" },
]

// Build-time check function to verify dependencies
export function checkDependencies() {
  if (process.env.NODE_ENV !== "production") {
    try {
      let packageJson: any

      try {
        // Try to import package.json
        packageJson = require("../../package.json")
      } catch (e) {
        console.warn("Could not load package.json to check dependencies")
        return
      }

      const { dependencies = {}, devDependencies = {} } = packageJson
      const allDeps = { ...dependencies, ...devDependencies }

      // Check for missing dependencies
      const missing = REQUIRED_DEPENDENCIES.filter((dep) => !dep.isOptional && !allDeps[dep.name])

      if (missing.length > 0) {
        console.warn(
          `Missing required dependencies: ${missing.map((d) => d.name).join(", ")}. ` +
            `Install them with: npm install ${missing.map((d) => d.name).join(" ")}`,
        )
      }
    } catch (error) {
      console.error("Error checking dependencies:", error)
    }
  }
}

// Run the check on import
checkDependencies()
