"use server"

import { z } from "zod"

const waitlistSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  message: z.string().optional(),
})

// In-memory storage for waitlist entries (in a real app, this would be a database)
const waitlistEntries: Array<z.infer<typeof waitlistSchema> & { date: Date }> = []

export async function joinWaitlist(data: z.infer<typeof waitlistSchema>) {
  try {
    // Validate the data
    const validatedData = waitlistSchema.parse(data)

    // Store the waitlist entry in memory (in a real app, this would be a database)
    waitlistEntries.push({
      ...validatedData,
      date: new Date(),
    })

    console.log("New waitlist entry (server):", validatedData)
    console.log("Total waitlist entries (server):", waitlistEntries.length)

    return {
      success: true,
      message: "You've been added to our waitlist! We'll notify you when we launch.",
    }
  } catch (error) {
    console.error("Error in joinWaitlist:", error)
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors[0].message
      return { success: false, message: errorMessage }
    }
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    }
  }
}
