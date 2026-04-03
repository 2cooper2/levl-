"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, SlidersHorizontal, X } from "lucide-react"

type FilterProps = {
  onFilterChange?: (filters: FilterState) => void
  categories?: string[]
}

type FilterState = {
  priceRange: [number, number]
  categories: string[]
  minRating: number
  search: string
}

export function FilterComponent({
  onFilterChange,
  categories = ["Design", "Development", "Marketing", "Writing"],
}: FilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000],
    categories: [],
    minRating: 0,
    search: "",
  })

  const handlePriceChange = (value: number[]) => {
    const newFilters = {
      ...filters,
      priceRange: [value[0], value[1]] as [number, number],
    }
    setFilters(newFilters)
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked ? [...filters.categories, category] : filters.categories.filter((c) => c !== category)

    const newFilters = {
      ...filters,
      categories: newCategories,
    }
    setFilters(newFilters)
  }

  const handleRatingChange = (value: number[]) => {
    const newFilters = {
      ...filters,
      minRating: value[0],
    }
    setFilters(newFilters)
  }

  const handleSearchChange = (value: string) => {
    const newFilters = {
      ...filters,
      search: value,
    }
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    if (onFilterChange) {
      onFilterChange(filters)
    }
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  const handleResetFilters = () => {
    const resetFilters = {
      priceRange: [0, 1000],
      categories: [],
      minRating: 0,
      search: "",
    }
    setFilters(resetFilters)
    if (onFilterChange) {
      onFilterChange(resetFilters)
    }
  }

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="md:hidden mb-4">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="w-full flex items-center justify-between"
        >
          <span className="flex items-center">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </span>
          {isOpen ? <X className="h-4 w-4" /> : null}
        </Button>
      </div>

      {/* Filter card - hidden on mobile unless toggled */}
      <Card className={`${isOpen ? "block" : "hidden"} md:block`}>
        <CardHeader>
          <CardTitle className="text-lg">Filter Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search services..."
                className="pl-8"
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Price Range</Label>
              <span className="text-sm text-gray-500">
                ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </span>
            </div>
            <Slider
              defaultValue={[0, 1000]}
              min={0}
              max={1000}
              step={10}
              value={[filters.priceRange[0], filters.priceRange[1]]}
              onValueChange={handlePriceChange}
              className="py-4"
            />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked === true)}
                  />
                  <Label htmlFor={`category-${category}`} className="text-sm font-normal cursor-pointer">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Minimum Rating</Label>
              <span className="text-sm text-gray-500">{filters.minRating} stars</span>
            </div>
            <Slider
              defaultValue={[0]}
              min={0}
              max={5}
              step={0.5}
              value={[filters.minRating]}
              onValueChange={handleRatingChange}
              className="py-4"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
