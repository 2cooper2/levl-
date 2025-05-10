"use client"

const PersonalizedDashboard = () => {
  // Refs for spotlight effect
  // const spotlightRef = React.useRef<HTMLDivElement>(null)
  // const spotlightDelayedRef = React.useRef<HTMLDivElement>(null)

  // useEffect(() => {
  //   const handleMouseMove = (e: MouseEvent) => {
  //     if (!spotlightRef.current || !spotlightDelayedRef.current) return

  //     const x = (e.clientX / window.innerWidth) * 100
  //     const y = (e.clientY / window.innerHeight) * 100

  //     // Immediate follow
  //     spotlightRef.current.style.setProperty("--x", `${x}%`)
  //     spotlightRef.current.style.setProperty("--y", `${y}%`)

  //     // Delayed follow with smoother animation
  //     setTimeout(() => {
  //       if (spotlightDelayedRef.current) {
  //         spotlightDelayedRef.current.style.setProperty("--x", `${x}%`)
  //         spotlightDelayedRef.current.style.setProperty("--y", `${y}%`)
  //       }
  //     }, 100)
  //   }

  //   window.addEventListener("mousemove", handleMouseMove)
  //   return () => window.removeEventListener("mousemove", handleMouseMove)
  // }, [])

  return (
    <div className="relative w-full h-full">
      {/* Simple subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-90"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

      <div className="relative z-10 p-6 md:p-8 lg:p-12">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
          Welcome to Your Personalized Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Here's a snapshot of your progress and opportunities tailored just for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Card 1 */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Recommended Learning Path</h2>
              <p className="text-sm text-gray-500 mb-3">Based on your goals, we suggest starting with these courses.</p>
              <button className="w-full py-1.5 text-xs bg-gradient-to-r from-primary/80 to-purple-500/80 hover:from-primary hover:to-purple-500 text-white rounded-md transition-colors">
                Start Learning
              </button>
            </div>
          </div>

          {/* Example Card 2 */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Your Progress This Week</h2>
              <p className="text-sm text-gray-500 mb-3">You've completed 3 modules and earned 150 XP. Keep it up!</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "60%" }}></div>
              </div>
              <p className="text-xs text-green-600 font-semibold">60% Complete</p>
            </div>
          </div>

          {/* Example Card 3 */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Exclusive Growth Opportunities</h2>
              <p className="text-sm text-gray-500 mb-3">
                Unlock new skills and advance your career with these opportunities.
              </p>
              <button className="w-full py-1.5 text-xs bg-gradient-to-r from-primary/80 to-purple-500/80 hover:from-primary hover:to-purple-500 text-white rounded-md transition-colors">
                Explore All Growth Opportunities
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalizedDashboard
