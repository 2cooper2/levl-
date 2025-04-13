import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { WaitlistForm } from "@/components/waitlist/waitlist-form"
import { LevlLogo } from "@/components/levl-logo"

export default function WaitlistPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <EnhancedMainNav />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <LevlLogo className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Join Our Waitlist</h1>
            <p className="text-muted-foreground">
              Be the first to know when we launch. Get early access to the Levl platform and exclusive offers.
            </p>
          </div>

          <WaitlistForm showName={true} />

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>We respect your privacy and will never share your information.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
