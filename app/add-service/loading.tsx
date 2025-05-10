import { Loader2 } from "lucide-react"

export default function AddServiceLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-muted-foreground">Loading add service page...</p>
      </div>
    </div>
  )
}
