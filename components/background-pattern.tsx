export function BackgroundPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.015] dark:opacity-[0.03]" />
    </div>
  )
}
