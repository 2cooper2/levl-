import { WaitlistButton } from "@/components/waitlist/waitlist-button"
import { WaitlistDemo } from "./waitlist-demo"

export default function WaitlistDemoPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Waitlist Demo</h1>

      <div className="max-w-2xl mx-auto space-y-12">
        {/* Example 1: Button that links to the waitlist page */}
        <section className="bg-muted p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Example 1: Waitlist Button</h2>
          <p className="mb-6">This button links to the dedicated waitlist page:</p>
          <div className="flex justify-center">
            <WaitlistButton />
          </div>
        </section>

        {/* Example 2: Inline waitlist form */}
        <section className="bg-muted p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Example 2: Inline Waitlist Form</h2>
          <p className="mb-6">This form submits directly to your waitlist table:</p>
          <WaitlistDemo />
        </section>
      </div>
    </div>
  )
}
