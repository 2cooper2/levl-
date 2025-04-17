export const dynamic = "force-dynamic"

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Services</h1>
          <p className="text-muted-foreground">Find the perfect service for your needs from our talented providers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="border rounded-lg p-4">
              <div className="aspect-[4/3] bg-muted mb-4"></div>
              <h3 className="font-semibold mb-2">Service Example {item}</h3>
              <p className="text-sm text-muted-foreground">This is a sample service description.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
