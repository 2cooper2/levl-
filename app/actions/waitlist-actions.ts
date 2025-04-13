"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/supabase"

const waitlistSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  message: z.string().optional(),
})

export async function joinWaitlist(data: z.infer<typeof waitlistSchema>) {
  try {
    // Validate the data
    const validatedData = waitlistSchema.parse(data)

    // Initialize Supabase client
    const supabase = createServerClient()

    // Insert the data into the waitlist table
    const { error } = await supabase.from("waitlist").insert([
      {
        name: validatedData.name,
        email: validatedData.email,
        message: validatedData.message || null,
      },
    ])

    if (error) {
      console.error("Error inserting into waitlist:", error)

      // Handle duplicate email error
      if (error.code === "23505") {
        return {
          success: false,
          message: "This email is already on our waitlist.",
        }
      }

      throw error
    }

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
