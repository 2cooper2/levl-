"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

interface DateRange {
  from: Date
  to: Date
}

interface DateRangePickerProps {
  value: DateRange
  onValueChange: (value: DateRange) => void
}

export function DateRangePicker({ value, onValueChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState<DateRange>(value)

  const handleSelect = (date: Date | undefined) => {
    if (!date) return

    const newRange = { ...selectedRange }

    if (!selectedRange.from) {
      newRange.from = date
    } else if (!selectedRange.to && date >= selectedRange.from) {
      newRange.to = date
    } else {
      newRange.from = date
      newRange.to = undefined
    }

    setSelectedRange(newRange)

    // If we have both from and to dates, apply the filter
    if (newRange.from && newRange.to) {
      onValueChange(newRange)
    }
  }

  const formatDateRange = () => {
    if (!selectedRange.from) return "Select a date range"

    const fromDate = selectedRange.from.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })

    const toDate = selectedRange.to
      ? selectedRange.to.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "Present"

    return `${fromDate} - ${toDate}`
  }

  // Predefined date ranges
  const last7Days = () => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 6)

    setSelectedRange({ from, to })
    onValueChange({ from, to })
    setIsOpen(false)
  }

  const last30Days = () => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 29)

    setSelectedRange({ from, to })
    onValueChange({ from, to })
    setIsOpen(false)
  }

  const thisMonth = () => {
    const to = new Date()
    const from = new Date(to.getFullYear(), to.getMonth(), 1)

    setSelectedRange({ from, to })
    onValueChange({ from, to })
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col sm:flex-row">
          <div className="p-3 border-b sm:border-b-0 sm:border-r">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick select</h4>
              <div className="flex flex-col gap-2">
                <Button variant="ghost" size="sm" onClick={last7Days}>
                  Last 7 days
                </Button>
                <Button variant="ghost" size="sm" onClick={last30Days}>
                  Last 30 days
                </Button>
                <Button variant="ghost" size="sm" onClick={thisMonth}>
                  This month
                </Button>
              </div>
            </div>
          </div>
          <Calendar
            mode="range"
            selected={{
              from: selectedRange.from,
              to: selectedRange.to,
            }}
            onSelect={(range: any) => {
              if (range?.from) {
                handleSelect(range.from)
              }
              if (range?.to) {
                handleSelect(range.to)
              }
            }}
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
