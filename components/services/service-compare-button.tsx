"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Check, BarChart2, Trash2, AlertCircle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Service {
  id: string
  title: string
  provider: {
    name: string
    id: string
  }
  base_price: number
  currency: string
}

interface ServiceCompareButtonProps {
  service: Service
  className?: string
  children?: React.ReactNode
}

export function ServiceCompareButton({ service, className, children }: ServiceCompareButtonProps) {
  const [isCompareList, setIsCompareList] = useState(false)
  const [compareList, setCompareList] = useState<Service[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const maxCompareItems = 4

  // Check local storage on component mount
  useEffect(() => {
    const storedCompareList = localStorage.getItem("compareList")
    if (storedCompareList) {
      const parsedList = JSON.parse(storedCompareList)
      setCompareList(parsedList)
      setIsCompareList(parsedList.some((s: Service) => s.id === service.id))
    }
  }, [service.id])

  // Update local storage when compare list changes
  useEffect(() => {
    localStorage.setItem("compareList", JSON.stringify(compareList))
  }, [compareList])

  const toggleCompare = () => {
    if (isCompareList) {
      // Remove from compare list
      const newList = compareList.filter((s) => s.id !== service.id)
      setCompareList(newList)
      setIsCompareList(false)
    } else {
      // Add to compare list if not at max
      if (compareList.length >= maxCompareItems) {
        alert(`You can only compare up to ${maxCompareItems} services at once.`)
        return
      }
      const newList = [...compareList, service]
      setCompareList(newList)
      setIsCompareList(true)
    }
  }

  const removeFromCompare = (serviceId: string) => {
    const newList = compareList.filter((s) => s.id !== serviceId)
    setCompareList(newList)
    if (serviceId === service.id) {
      setIsCompareList(false)
    }
  }

  const clearCompareList = () => {
    setCompareList([])
    setIsCompareList(false)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("flex items-center gap-2", isCompareList && "border-primary", className)}
            onClick={toggleCompare}
          >
            {isCompareList ? (
              <>
                <Check className="h-4 w-4" />
                <span>Added to Compare</span>
              </>
            ) : (
              <>
                <BarChart2 className="h-4 w-4" />
                <span>{children || "Add to Compare"}</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isCompareList ? "Remove from comparison" : "Add to comparison"}</p>
        </TooltipContent>
      </Tooltip>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger className="hidden">Open Compare Panel</SheetTrigger>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Compare Services</SheetTitle>
            <SheetDescription>
              You have {compareList.length} of {maxCompareItems} services selected for comparison.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-4">
            {compareList.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">No services added to compare.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Add services by clicking the "Add to Compare" button on service pages.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {compareList.map((compareService) => (
                    <div key={compareService.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{compareService.title}</div>
                        <div className="text-sm text-gray-500">by {compareService.provider.name}</div>
                        <div className="text-sm font-medium mt-1">
                          {compareService.base_price} {compareService.currency}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCompare(compareService.id)}
                        aria-label="Remove from comparison"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {compareList.length > 0 && (
                  <div className="flex justify-between items-center">
                    <Button variant="ghost" size="sm" onClick={clearCompareList}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                    <Badge variant="outline">
                      {compareList.length} of {maxCompareItems} selected
                    </Badge>
                  </div>
                )}
              </>
            )}
          </div>

          <SheetFooter>
            <Button asChild disabled={compareList.length < 2} className="w-full">
              <Link href={`/compare?ids=${compareList.map((s) => s.id).join(",")}`}>
                <BarChart2 className="h-4 w-4 mr-2" />
                Compare Services
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}
