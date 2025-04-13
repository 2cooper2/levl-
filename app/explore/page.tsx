export const dynamic = "force-dynamic"

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="text-xl font-bold">
              LevL
            </a>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="/explore" className="text-sm font-medium">
              Find Services
            </a>
            <a href="/providers" className="text-sm font-medium">
              Become a Provider
            </a>
            <a href="/how-it-works" className="text-sm font-medium">
              How it Works
            </a>
            <a href="/about" className="text-sm font-medium">
              About
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="/auth/login" className="text-sm font-medium">
              Sign In
            </a>
            <a
              href="/auth/signup"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Services</h1>
          <p className="text-muted-foreground">Find the perfect service for your needs from our talented providers.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Filters</h3>
                <button className="text-sm border px-2 py-1 rounded">Clear All</button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Category</h4>
                <div className="space-y-2">
                  {["Technology", "Creative", "Writing", "Marketing", "Business"].map((category) => (
                    <div key={category} className="flex items-center gap-2">
                      <input type="checkbox" id={`category-${category}`} />
                      <label htmlFor={`category-${category}`}>{category}</label>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="my-4" />

              <div className="space-y-4">
                <h4 className="font-medium">Price Range</h4>
                <div className="flex justify-between">
                  <span>$0</span>
                  <span>$1000</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="space-y-4">
                <h4 className="font-medium">Rating</h4>
                <div className="space-y-2">
                  {["4.5 & up", "4.0 & up", "3.5 & up", "3.0 & up"].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <input type="checkbox" id={`rating-${rating}`} />
                      <label htmlFor={`rating-${rating}`}>{rating}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="search"
                    placeholder="Search for services..."
                    className="w-full px-4 py-2 pl-10 border rounded-md"
                  />
                  <span className="absolute left-3 top-2.5">🔍</span>
                </div>

                <select className="border rounded-md px-3 py-2">
                  <option>All Categories</option>
                  <option>Technology</option>
                  <option>Creative</option>
                  <option>Writing</option>
                  <option>Marketing</option>
                  <option>Business</option>
                </select>

                <button className="md:hidden border rounded-md p-2">Filters</button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Showing 9 results</p>
                <div className="flex items-center gap-2">
                  <select className="border rounded-md px-3 py-2 text-sm">
                    <option>Relevance</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Top Rated</option>
                    <option>Newest</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Professional Website Development",
                  price: "From $499",
                  provider: "Alex Morgan",
                  rating: "4.9",
                  reviews: "124",
                  tags: ["Web Design", "Responsive", "E-commerce"],
                },
                {
                  title: "Custom Logo Design & Branding",
                  price: "From $199",
                  provider: "Sarah Chen",
                  rating: "4.8",
                  reviews: "89",
                  tags: ["Logo", "Branding", "Identity"],
                },
                {
                  title: "SEO Content Writing & Copywriting",
                  price: "From $99",
                  provider: "James Wilson",
                  rating: "4.7",
                  reviews: "56",
                  tags: ["SEO", "Content", "Copywriting"],
                },
                {
                  title: "Social Media Management & Strategy",
                  price: "From $299/mo",
                  provider: "Emma Davis",
                  rating: "4.8",
                  reviews: "72",
                  tags: ["Social Media", "Marketing", "Strategy"],
                },
                {
                  title: "Mobile App Development",
                  price: "From $999",
                  provider: "Michael Zhang",
                  rating: "4.9",
                  reviews: "48",
                  tags: ["iOS", "Android", "React Native"],
                },
                {
                  title: "Professional Video Editing",
                  price: "From $149",
                  provider: "Olivia Johnson",
                  rating: "4.7",
                  reviews: "63",
                  tags: ["Video", "Editing", "Animation"],
                },
                {
                  title: "Bookkeeping & Financial Statements",
                  price: "From $199/mo",
                  provider: "Robert Lee",
                  rating: "4.8",
                  reviews: "42",
                  tags: ["Accounting", "Bookkeeping", "Finance"],
                },
                {
                  title: "Professional Translation Services",
                  price: "From $0.10/word",
                  provider: "Maria Garcia",
                  rating: "4.9",
                  reviews: "37",
                  tags: ["Translation", "Localization", "Proofreading"],
                },
                {
                  title: "Professional Voice Over Services",
                  price: "From $99",
                  provider: "David Kim",
                  rating: "4.7",
                  reviews: "29",
                  tags: ["Voice Over", "Narration", "Commercial"],
                },
              ].map((service, index) => (
                <div key={index} className="border rounded-lg overflow-hidden flex flex-col">
                  <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                    <div className="text-center p-4">Service Image</div>
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-muted"></div>
                      <span className="text-sm font-medium">{service.provider}</span>
                    </div>
                    <h3 className="font-semibold mb-2">{service.title}</h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {service.tags.map((tag, i) => (
                        <span key={i} className="text-xs border px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="border-t p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-sm font-medium">{service.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">({service.reviews})</span>
                    </div>
                    <span className="font-medium">{service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
