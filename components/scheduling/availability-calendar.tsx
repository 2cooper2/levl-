"use client"

import { Textarea } from "@/components/ui/textarea"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Clock,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Save,
  Trash2,
  Users,
  Video,
  MapPin,
} from "lucide-react"
import { addDays, format, isSameDay, startOfWeek, addWeeks, subWeeks, parseISO, isWithinInterval } from "date-fns"
import { cn } from "@/lib/utils"

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  day: number // 0-6 for Sunday-Saturday
  available: boolean
}

interface ScheduleSettings {
  timezone: string
  bufferTime: number
  maxBookingsPerDay: number
  advanceBookingDays: number
  autoAccept: boolean
  allowInstantBooking: boolean
  defaultMeetingDuration: number
  availableDays: number[] // 0-6 for Sunday-Saturday
  workHours: {
    start: string
    end: string
  }
  breakHours?: {
    start: string
    end: string
  }
  unavailableDates: string[]
}

interface Booking {
  id: string
  title: string
  startTime: string
  endTime: string
  clientId: string
  clientName: string
  serviceId: string
  serviceName: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  meetingType: "in-person" | "video" | "phone"
  location?: string
  notes?: string
}

interface AvailabilityCalendarProps {
  userId: string
  isProvider?: boolean
  serviceId?: string
  onBookingCreated?: (booking: Booking) => void
}

export function AvailabilityCalendar({
  userId,
  isProvider = false,
  serviceId,
  onBookingCreated,
}: AvailabilityCalendarProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [view, setView] = useState<"day" | "week" | "month">("week")
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()))
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>({
    timezone: "America/New_York",
    bufferTime: 15,
    maxBookingsPerDay: 8,
    advanceBookingDays: 30,
    autoAccept: true,
    allowInstantBooking: true,
    defaultMeetingDuration: 60,
    availableDays: [1, 2, 3, 4, 5], // Monday to Friday
    workHours: {
      start: "09:00",
      end: "17:00",
    },
    unavailableDates: [],
  })
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    meetingType: "video",
  })

  // Timezones for the dropdown
  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
    { value: "Europe/Paris", label: "Central European Time (CET)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  ]

  // Generate time slots based on settings
  useEffect(() => {
    const generateTimeSlots = () => {
      const slots: TimeSlot[] = []
      const { workHours, availableDays, bufferTime } = scheduleSettings
      const [startHour, startMinute] = workHours.start.split(":").map(Number)
      const [endHour, endMinute] = workHours.end.split(":").map(Number)

      for (const day of availableDays) {
        let currentHour = startHour
        let currentMinute = startMinute

        while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
          const nextMinute = (currentMinute + bufferTime) % 60
          const nextHour = currentMinute + bufferTime >= 60 ? currentHour + 1 : currentHour

          if (nextHour > endHour || (nextHour === endHour && nextMinute > endMinute)) {
            break
          }

          const startTime = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`
          const endTime = `${nextHour.toString().padStart(2, "0")}:${nextMinute.toString().padStart(2, "0")}`

          slots.push({
            id: `${day}-${startTime}-${endTime}`,
            day,
            startTime,
            endTime,
            available: true,
          })

          currentHour = nextHour
          currentMinute = nextMinute
        }
      }

      return slots
    }

    setTimeSlots(generateTimeSlots())
  }, [scheduleSettings])

  // Fetch bookings (mock data for demo)
  useEffect(() => {
    const fetchBookings = async () => {
      // In a real app, fetch from database
      // const { data, error } = await supabase
      //   .from('bookings')
      //   .select('*')
      //   .or(`provider_id.eq.${userId},client_id.eq.${userId}`)

      // Mock data for demo
      const mockBookings: Booking[] = [
        {
          id: "1",
          title: "Website Consultation",
          startTime: "2023-05-15T10:00:00",
          endTime: "2023-05-15T11:00:00",
          clientId: "client123",
          clientName: "John Smith",
          serviceId: "service123",
          serviceName: "Web Development Consultation",
          status: "confirmed",
          meetingType: "video",
          notes: "Initial consultation to discuss project requirements",
        },
        {
          id: "2",
          title: "Logo Design Review",
          startTime: "2023-05-16T14:00:00",
          endTime: "2023-05-16T15:00:00",
          clientId: "client456",
          clientName: "Emily Johnson",
          serviceId: "service456",
          serviceName: "Logo Design",
          status: "confirmed",
          meetingType: "in-person",
          location: "Coffee Shop, 123 Main St",
        },
        {
          id: "3",
          title: "Mobile App Feedback",
          startTime: "2023-05-17T11:00:00",
          endTime: "2023-05-17T12:00:00",
          clientId: "client789",
          clientName: "Michael Brown",
          serviceId: "service789",
          serviceName: "Mobile App Development",
          status: "pending",
          meetingType: "phone",
        },
      ]

      // Adjust dates to be relative to current date for demo purposes
      const today = new Date()
      const adjustedBookings = mockBookings.map((booking) => {
        const startDate = parseISO(booking.startTime)
        const endDate = parseISO(booking.endTime)

        const daysDiff = 2 - startDate.getDay() // Adjust to be within current week
        const adjustedStartDate = addDays(today, daysDiff)
        adjustedStartDate.setHours(startDate.getHours(), startDate.getMinutes())

        const adjustedEndDate = new Date(adjustedStartDate)
        adjustedEndDate.setHours(endDate.getHours(), endDate.getMinutes())

        return {
          ...booking,
          startTime: adjustedStartDate.toISOString(),
          endTime: adjustedEndDate.toISOString(),
        }
      })

      setBookings(adjustedBookings)
    }

    fetchBookings()
  }, [userId])

  const handlePrevWeek = () => {
    setWeekStart(subWeeks(weekStart, 1))
  }

  const handleNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1))
  }

  const handleDayClick = (day: Date) => {
    setDate(day)
    setView("day")
  }

  const handleTimeSlotClick = (slotId: string) => {
    if (!isProvider) {
      setSelectedTimeSlot(slotId)
      setIsBookingDialogOpen(true)

      // Pre-fill the booking form
      const [day, startTime] = slotId.split("-")
      const bookingDate = addDays(startOfWeek(new Date()), Number.parseInt(day))
      const bookingStartTime = new Date(bookingDate)
      const [hours, minutes] = startTime.split(":").map(Number)
      bookingStartTime.setHours(hours, minutes)

      const bookingEndTime = new Date(bookingStartTime)
      bookingEndTime.setMinutes(bookingStartTime.getMinutes() + scheduleSettings.defaultMeetingDuration)

      setNewBooking({
        startTime: bookingStartTime.toISOString(),
        endTime: bookingEndTime.toISOString(),
        meetingType: "video",
        serviceId: serviceId,
      })
    }
  }

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
  }

  const handleCreateBooking = () => {
    if (!newBooking.startTime || !newBooking.endTime || !newBooking.title) return

    const booking: Booking = {
      id: `booking-${Date.now()}`,
      title: newBooking.title || "",
      startTime: newBooking.startTime,
      endTime: newBooking.endTime,
      clientId: userId,
      clientName: "Current User", // In a real app, get from user profile
      serviceId: newBooking.serviceId || "",
      serviceName: "Service Name", // In a real app, get from service data
      status: scheduleSettings.autoAccept ? "confirmed" : "pending",
      meetingType: newBooking.meetingType as "in-person" | "video" | "phone",
      location: newBooking.location,
      notes: newBooking.notes,
    }

    setBookings([...bookings, booking])
    setIsBookingDialogOpen(false)
    setNewBooking({
      meetingType: "video",
    })

    if (onBookingCreated) {
      onBookingCreated(booking)
    }
  }

  const isDateUnavailable = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return scheduleSettings.unavailableDates.includes(dateString)
  }

  const isTimeSlotBooked = (day: number, startTime: string) => {
    const dayDate = addDays(weekStart, day)
    const [hours, minutes] = startTime.split(":").map(Number)
    const slotStart = new Date(dayDate)
    slotStart.setHours(hours, minutes, 0, 0)

    return bookings.some((booking) => {
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)

      return (
        isWithinInterval(slotStart, { start: bookingStart, end: bookingEnd }) ||
        isWithinInterval(new Date(slotStart.getTime() + scheduleSettings.bufferTime * 60000), {
          start: bookingStart,
          end: bookingEnd,
        })
      )
    })
  }

  const renderDayView = () => {
    const dayBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.startTime)
      return isSameDay(bookingDate, date)
    })

    const daySlotsFiltered = timeSlots.filter((slot) => {
      const slotDay = (date.getDay() + 6) % 7 // Adjust for Sunday being 0
      return slot.day === slotDay
    })

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{format(date, "EEEE, MMMM d, yyyy")}</h3>
          <Button variant="outline" size="sm" onClick={() => setView("week")}>
            Back to Week View
          </Button>
        </div>

        <div className="grid gap-2">
          {daySlotsFiltered.length > 0 ? (
            daySlotsFiltered.map((slot) => {
              const isBooked = isTimeSlotBooked(slot.day, slot.startTime)

              return (
                <div
                  key={slot.id}
                  className={cn(
                    "p-3 rounded-md border flex justify-between items-center",
                    isBooked
                      ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                      : "hover:border-primary cursor-pointer",
                  )}
                  onClick={() => !isBooked && handleTimeSlotClick(slot.id)}
                >
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                  {isBooked ? (
                    <Badge variant="secondary">Booked</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Available
                    </Badge>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-gray-500">No available time slots for this day.</div>
          )}
        </div>

        {dayBookings.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium mb-2">Scheduled Meetings</h4>
            <div className="space-y-2">
              {dayBookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="cursor-pointer hover:border-primary"
                  onClick={() => handleBookingClick(booking)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{booking.title}</h5>
                        <p className="text-sm text-gray-500">
                          {format(new Date(booking.startTime), "h:mm a")} -{" "}
                          {format(new Date(booking.endTime), "h:mm a")}
                        </p>
                        <div className="flex items-center mt-1 text-sm">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{booking.clientName}</span>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          booking.status === "confirmed" && "bg-green-100 text-green-800 border-green-200",
                          booking.status === "pending" && "bg-yellow-100 text-yellow-800 border-yellow-200",
                          booking.status === "cancelled" && "bg-red-100 text-red-800 border-red-200",
                        )}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                      {booking.meetingType === "video" && <Video className="h-3 w-3 mr-1" />}
                      {booking.meetingType === "in-person" && <MapPin className="h-3 w-3 mr-1" />}
                      <span className="capitalize">{booking.meetingType} Meeting</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderWeekView = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-medium">
              {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </h3>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Select value={view} onValueChange={(value) => setView(value as "day" | "week" | "month")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const isToday = isSameDay(day, new Date())
            const dayBookings = bookings.filter((booking) => isSameDay(new Date(booking.startTime), day))
            const isUnavailable = isDateUnavailable(day)
            const daySlots = timeSlots.filter((slot) => slot.day === index)

            return (
              <div
                key={day.toString()}
                className={cn(
                  "border rounded-md p-2 min-h-[120px]",
                  isToday && "border-primary",
                  isUnavailable && "bg-gray-100 dark:bg-gray-800",
                )}
              >
                <div
                  className={cn("text-center p-1 rounded-md mb-2 cursor-pointer", isToday && "bg-primary text-white")}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="text-xs">{format(day, "EEE")}</div>
                  <div className="font-bold">{format(day, "d")}</div>
                </div>

                {isUnavailable ? (
                  <div className="text-center text-xs text-gray-500 mt-4">Unavailable</div>
                ) : (
                  <div className="space-y-1">
                    {dayBookings.length > 0 ? (
                      dayBookings.slice(0, 2).map((booking) => (
                        <div
                          key={booking.id}
                          className="text-xs p-1 rounded bg-primary/10 text-primary truncate cursor-pointer"
                          onClick={() => handleBookingClick(booking)}
                        >
                          {format(new Date(booking.startTime), "h:mm a")} - {booking.title}
                        </div>
                      ))
                    ) : daySlots.length > 0 ? (
                      <div className="text-center text-xs text-green-600 mt-2">{daySlots.length} available slots</div>
                    ) : (
                      <div className="text-center text-xs text-gray-500 mt-2">No slots</div>
                    )}

                    {dayBookings.length > 2 && (
                      <div className="text-center text-xs text-gray-500">+{dayBookings.length - 2} more</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{format(date, "MMMM yyyy")}</h3>
          <Select value={view} onValueChange={(value) => setView(value as "day" | "week" | "month")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Calendar
          mode="single"
          selected={date}
          onSelect={(day) => day && setDate(day)}
          className="rounded-md border"
          disabled={(date) => isDateUnavailable(date)}
          modifiers={{
            booked: bookings.map((booking) => new Date(booking.startTime)),
          }}
          modifiersClassNames={{
            booked: "bg-primary/20",
          }}
          components={{
            DayContent: (props) => {
              const dayBookings = bookings.filter((booking) => isSameDay(new Date(booking.startTime), props.date))

              return (
                <div className="relative h-full w-full p-2">
                  <div>{props.date.getDate()}</div>
                  {dayBookings.length > 0 && (
                    <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-primary"></div>
                  )}
                </div>
              )
            },
          }}
        />
      </div>
    )
  }

  const renderSettingsView = () => {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={scheduleSettings.timezone}
                onValueChange={(value) => setScheduleSettings({ ...scheduleSettings, timezone: value })}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bufferTime">Buffer Time Between Meetings (minutes)</Label>
              <Select
                value={scheduleSettings.bufferTime.toString()}
                onValueChange={(value) =>
                  setScheduleSettings({ ...scheduleSettings, bufferTime: Number.parseInt(value) })
                }
              >
                <SelectTrigger id="bufferTime">
                  <SelectValue placeholder="Select buffer time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="defaultDuration">Default Meeting Duration (minutes)</Label>
              <Select
                value={scheduleSettings.defaultMeetingDuration.toString()}
                onValueChange={(value) =>
                  setScheduleSettings({ ...scheduleSettings, defaultMeetingDuration: Number.parseInt(value) })
                }
              >
                <SelectTrigger id="defaultDuration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxBookings">Maximum Bookings Per Day</Label>
              <Input
                id="maxBookings"
                type="number"
                min="1"
                max="20"
                value={scheduleSettings.maxBookingsPerDay}
                onChange={(e) =>
                  setScheduleSettings({ ...scheduleSettings, maxBookingsPerDay: Number.parseInt(e.target.value) })
                }
              />
            </div>

            <div>
              <Label htmlFor="advanceBooking">Advance Booking Period (days)</Label>
              <Input
                id="advanceBooking"
                type="number"
                min="1"
                max="365"
                value={scheduleSettings.advanceBookingDays}
                onChange={(e) =>
                  setScheduleSettings({ ...scheduleSettings, advanceBookingDays: Number.parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Available Days</Label>
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                  <div key={day} className="flex flex-col items-center">
                    <Label htmlFor={`day-${index}`} className="text-xs mb-1">
                      {day}
                    </Label>
                    <Checkbox
                      id={`day-${index}`}
                      checked={scheduleSettings.availableDays.includes(index)}
                      onCheckedChange={(checked) => {
                        const newDays = checked
                          ? [...scheduleSettings.availableDays, index].sort()
                          : scheduleSettings.availableDays.filter((d) => d !== index)
                        setScheduleSettings({ ...scheduleSettings, availableDays: newDays })
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workStart">Work Hours Start</Label>
                <Input
                  id="workStart"
                  type="time"
                  value={scheduleSettings.workHours.start}
                  onChange={(e) =>
                    setScheduleSettings({
                      ...scheduleSettings,
                      workHours: { ...scheduleSettings.workHours, start: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="workEnd">Work Hours End</Label>
                <Input
                  id="workEnd"
                  type="time"
                  value={scheduleSettings.workHours.end}
                  onChange={(e) =>
                    setScheduleSettings({
                      ...scheduleSettings,
                      workHours: { ...scheduleSettings.workHours, end: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoAccept"
                  checked={scheduleSettings.autoAccept}
                  onCheckedChange={(checked) => setScheduleSettings({ ...scheduleSettings, autoAccept: checked })}
                />
                <Label htmlFor="autoAccept">Auto-accept bookings</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="instantBooking"
                  checked={scheduleSettings.allowInstantBooking}
                  onCheckedChange={(checked) =>
                    setScheduleSettings({ ...scheduleSettings, allowInstantBooking: checked })
                  }
                />
                <Label htmlFor="instantBooking">Allow instant booking</Label>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Unavailable Dates</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-[150px] overflow-y-auto">
                {scheduleSettings.unavailableDates.length > 0 ? (
                  scheduleSettings.unavailableDates.map((dateStr) => (
                    <div key={dateStr} className="flex justify-between items-center text-sm">
                      <span>{format(parseISO(dateStr), "MMMM d, yyyy")}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setScheduleSettings({
                            ...scheduleSettings,
                            unavailableDates: scheduleSettings.unavailableDates.filter((d) => d !== dateStr),
                          })
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-500">No unavailable dates set</div>
                )}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Unavailable Date
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Unavailable Date</DialogTitle>
                    <DialogDescription>Select dates when you are not available for bookings.</DialogDescription>
                  </DialogHeader>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(day) => {
                      if (day) {
                        const dateStr = format(day, "yyyy-MM-dd")
                        if (!scheduleSettings.unavailableDates.includes(dateStr)) {
                          setScheduleSettings({
                            ...scheduleSettings,
                            unavailableDates: [...scheduleSettings.unavailableDates, dateStr],
                          })
                        }
                      }
                    }}
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today
                    }}
                    className="rounded-md border"
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Availability Calendar</CardTitle>
        <CardDescription>
          {isProvider ? "Manage your availability and view upcoming bookings" : "Book a time slot that works for you"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isProvider ? (
          <Tabs defaultValue="calendar">
            <TabsList className="mb-4">
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="calendar">
              {view === "day" && renderDayView()}
              {view === "week" && renderWeekView()}
              {view === "month" && renderMonthView()}
            </TabsContent>
            <TabsContent value="settings">{renderSettingsView()}</TabsContent>
          </Tabs>
        ) : (
          <>
            {view === "day" && renderDayView()}
            {view === "week" && renderWeekView()}
            {view === "month" && renderMonthView()}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Select
          value={scheduleSettings.timezone}
          onValueChange={(value) => setScheduleSettings({ ...scheduleSettings, timezone: value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!isProvider && (
          <Button variant="outline" onClick={() => setView("month")}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            View Full Calendar
          </Button>
        )}
      </CardFooter>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book an Appointment</DialogTitle>
            <DialogDescription>Fill in the details to book this time slot.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="bookingTitle">Title</Label>
              <Input
                id="bookingTitle"
                value={newBooking.title || ""}
                onChange={(e) => setNewBooking({ ...newBooking, title: e.target.value })}
                placeholder="e.g., Initial Consultation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date & Time</Label>
                <div className="text-sm mt-1">
                  {newBooking.startTime && format(new Date(newBooking.startTime), "MMMM d, yyyy")}
                  <br />
                  {newBooking.startTime && format(new Date(newBooking.startTime), "h:mm a")} -
                  {newBooking.endTime && format(new Date(newBooking.endTime), "h:mm a")}
                </div>
              </div>

              <div>
                <Label htmlFor="meetingType">Meeting Type</Label>
                <Select
                  value={newBooking.meetingType}
                  onValueChange={(value) => setNewBooking({ ...newBooking, meetingType: value })}
                >
                  <SelectTrigger id="meetingType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in-person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newBooking.meetingType === "in-person" && (
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newBooking.location || ""}
                  onChange={(e) => setNewBooking({ ...newBooking, location: e.target.value })}
                  placeholder="Enter meeting location"
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newBooking.notes || ""}
                onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                placeholder="Add any additional information"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBooking} disabled={!newBooking.title}>
              Book Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedBooking.title}</DialogTitle>
              <DialogDescription>Booking details</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Date & Time</h4>
                  <p className="text-sm">
                    {format(new Date(selectedBooking.startTime), "MMMM d, yyyy")}
                    <br />
                    {format(new Date(selectedBooking.startTime), "h:mm a")} -
                    {format(new Date(selectedBooking.endTime), "h:mm a")}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium">Status</h4>
                  <Badge
                    className={cn(
                      "mt-1",
                      selectedBooking.status === "confirmed" && "bg-green-100 text-green-800 border-green-200",
                      selectedBooking.status === "pending" && "bg-yellow-100 text-yellow-800 border-yellow-200",
                      selectedBooking.status === "cancelled" && "bg-red-100 text-red-800 border-red-200",
                    )}
                  >
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium">Meeting Type</h4>
                <p className="text-sm flex items-center mt-1">
                  {selectedBooking.meetingType === "video" && <Video className="h-4 w-4 mr-2" />}
                  {selectedBooking.meetingType === "in-person" && <MapPin className="h-4 w-4 mr-2" />}
                  <span className="capitalize">{selectedBooking.meetingType} Meeting</span>
                </p>
                {selectedBooking.location && <p className="text-sm mt-1">Location: {selectedBooking.location}</p>}
              </div>

              <div>
                <h4 className="text-sm font-medium">Participants</h4>
                <div className="flex items-center mt-1 text-sm">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{selectedBooking.clientName}</span>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <h4 className="text-sm font-medium">Notes</h4>
                  <p className="text-sm mt-1">{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              {isProvider && selectedBooking.status === "pending" && (
                <Button variant="outline" className="mr-auto">
                  Approve
                </Button>
              )}
              {selectedBooking.status !== "cancelled" && (
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancel Booking
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
