import { Loader } from "lucide-react"

export default function AddServiceLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-2">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading service form...</p>
      </div>
    </div>
  )
}
