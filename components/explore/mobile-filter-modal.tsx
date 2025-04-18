"use client"

import { type Dispatch, type SetStateAction, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Star, TimerResetIcon as Reset, Check, FilterIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface FilterOption {
  id: string
  name: string
  checked: boolean
}

export interface FilterState {
  categories: FilterOption[]
  priceRange: [number, number]
  ratings: FilterOption[]
  locations: FilterOption[]
}

interface MobileFilterModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  filters: FilterState
  setFilters: Dispatch<SetStateAction<FilterState>>
  onResetFilters: () => void
  countActiveFilters: () => number
}

export function MobileFilterModal({
  isOpen,
  onOpenChange,
  filters,
  setFilters,
  onResetFilters,
  countActiveFilters,
}: MobileFilterModalProps) {
  const [activeSection, setActiveSection] = useState<string>("categories")
  const activeFiltersCount = countActiveFilters()

  const updateCategoryFilter = (id: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.map((category) => (category.id === id ? { ...category, checked } : category)),
    }))
  }

  const updateRatingFilter = (id: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      ratings: prev.ratings.map((rating) => (rating.id === id ? { ...rating, checked } : rating)),
    }))
  }

  const updateLocationFilter = (id: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      locations: prev.locations.map((location) => (location.id === id ? { ...location, checked } : location)),
    }))
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md p-0 overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <SheetHeader className="px-4 py-3 border-b">
            <div className="flex items-center justify-between w-full">
              <SheetTitle className="flex items-center">
                <FilterIcon className="mr-2 h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                    {activeFiltersCount}
                  </Badge>
                )}
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs font-normal"
                onClick={(e) => {
                  e.stopPropagation()
                  onResetFilters()
                }}
              >
                <Reset className="h-3 w-3" />
                Reset
              </Button>
            </div>
            <SheetDescription>Filter services to find exactly what you need</SheetDescription>
          </SheetHeader>

          <div className="flex overflow-hidden h-full">
            {/* Filter sections sidebar */}
            <motion.div
              className="w-1/3 sm:w-1/4 border-r overflow-auto py-2 flex flex-col"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className={`px-4 py-3 text-left text-sm font-medium transition-colors ${
                  activeSection === "categories"
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => setActiveSection("categories")}
              >
                Categories
              </button>
              <button
                className={`px-4 py-3 text-left text-sm font-medium transition-colors ${
                  activeSection === "price" ? "bg-primary/10 text-primary border-r-2 border-primary" : "hover:bg-muted"
                }`}
                onClick={() => setActiveSection("price")}
              >
                Price
              </button>
              <button
                className={`px-4 py-3 text-left text-sm font-medium transition-colors ${
                  activeSection === "rating" ? "bg-primary/10 text-primary border-r-2 border-primary" : "hover:bg-muted"
                }`}
                onClick={() => setActiveSection("rating")}
              >
                Rating
              </button>
              <button
                className={`px-4 py-3 text-left text-sm font-medium transition-colors ${
                  activeSection === "location"
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => setActiveSection("location")}
              >
                Location
              </button>
            </motion.div>

            {/* Filter content */}
            <div className="flex-1 overflow-auto p-4">
              <AnimatePresence mode="wait">
                {activeSection === "categories" && (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h4 className="font-medium">Category</h4>
                    <div className="space-y-3">
                      {filters.categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={category.checked}
                            onCheckedChange={(checked) => updateCategoryFilter(category.id, checked as boolean)}
                          />
                          <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer">
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeSection === "price" && (
                  <motion.div
                    key="price"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h4 className="font-medium">Price Range</h4>
                    <div className="space-y-6 px-2">
                      <Slider
                        value={[filters.priceRange[0], filters.priceRange[1]]}
                        min={0}
                        max={1000}
                        step={10}
                        onValueChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            priceRange: [value[0], value[1]],
                          }))
                        }
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">${filters.priceRange[0]}</span>
                        <span className="text-sm">${filters.priceRange[1]}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <motion.div
                          className="rounded-md border p-3 cursor-pointer hover:bg-primary/5"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              priceRange: [0, 50],
                            }))
                          }
                        >
                          <p className="text-sm font-medium">Budget</p>
                          <p className="text-xs text-muted-foreground">Under $50</p>
                        </motion.div>

                        <motion.div
                          className="rounded-md border p-3 cursor-pointer hover:bg-primary/5"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              priceRange: [50, 200],
                            }))
                          }
                        >
                          <p className="text-sm font-medium">Mid-range</p>
                          <p className="text-xs text-muted-foreground">$50 - $200</p>
                        </motion.div>

                        <motion.div
                          className="rounded-md border p-3 cursor-pointer hover:bg-primary/5"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              priceRange: [200, 500],
                            }))
                          }
                        >
                          <p className="text-sm font-medium">Premium</p>
                          <p className="text-xs text-muted-foreground">$200 - $500</p>
                        </motion.div>

                        <motion.div
                          className="rounded-md border p-3 cursor-pointer hover:bg-primary/5"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              priceRange: [500, 1000],
                            }))
                          }
                        >
                          <p className="text-sm font-medium">Luxury</p>
                          <p className="text-xs text-muted-foreground">$500+</p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === "rating" && (
                  <motion.div
                    key="rating"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h4 className="font-medium">Rating</h4>
                    <div className="space-y-3">
                      {filters.ratings.map((rating) => (
                        <div key={rating.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`rating-${rating.id}`}
                            checked={rating.checked}
                            onCheckedChange={(checked) => updateRatingFilter(rating.id, checked as boolean)}
                          />
                          <Label
                            htmlFor={`rating-${rating.id}`}
                            className="text-sm font-normal cursor-pointer flex items-center"
                          >
                            {rating.name}
                            <Star className="h-3 w-3 ml-1 fill-yellow-400 text-yellow-400" />
                          </Label>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeSection === "location" && (
                  <motion.div
                    key="location"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h4 className="font-medium">Location</h4>
                    <div className="space-y-3">
                      {filters.locations.map((location) => (
                        <div key={location.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`location-${location.id}`}
                            checked={location.checked}
                            onCheckedChange={(checked) => updateLocationFilter(location.id, checked as boolean)}
                          />
                          <Label htmlFor={`location-${location.id}`} className="text-sm font-normal cursor-pointer">
                            {location.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="border-t p-4 bg-background/80 backdrop-blur-sm">
            <Button
              className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              onClick={() => onOpenChange(false)}
            >
              <Check className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
