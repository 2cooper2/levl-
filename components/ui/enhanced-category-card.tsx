import type React from "react"

interface EnhancedCategoryCardProps {
  title: string
  imageUrl: string
  description?: string
}

const EnhancedCategoryCard: React.FC<EnhancedCategoryCardProps> = ({ title, imageUrl, description }) => {
  return (
    <div
      className="relative rounded-lg overflow-hidden shadow-md transition-transform transform hover:scale-105 duration-300"
      style={{
        boxShadow:
          "0 20px 25px -5px rgba(0,0,0,0.4), 0 10px 10px -5px rgba(0,0,0,0.3), 0 -2px 8px 0px rgba(255,255,255,0.2)",
      }}
    >
      <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4 bg-white">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {description && <p className="mt-2 text-gray-600">{description}</p>}
      </div>
    </div>
  )
}

export default EnhancedCategoryCard
