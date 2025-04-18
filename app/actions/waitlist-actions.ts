"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

// Create a direct Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// SQL to create the waitlist table if it doesn't exist
const createWaitlistTableSQL = `
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`

export async function joinWaitlist(formData: FormData) {
  try {
    // Create Supabase client directly to avoid any issues with the wrapper
    const supabase = createClient(supabaseUrl, supabaseKey)

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const role = (formData.get("role") as string) || "client"
    const userMessage = (formData.get("message") as string) || ""

    // Combine role and message into a single message field
    const message = `Role: ${role}\nFeedback: ${userMessage}`

    if (!name || !email) {
      return {
        success: false,
        message: "Name and email are required",
      }
    }

    console.log("Attempting to join waitlist with:", { name, email, role })
    console.log("Using Supabase URL:", supabaseUrl.substring(0, 15) + "...")

    // Try to create the waitlist table if it doesn't exist
    try {
      const { error: createTableError } = await supabase.rpc("exec", { query: createWaitlistTableSQL })
      if (createTableError) {
        console.log("Note: Could not create waitlist table:", createTableError.message)
      }
    } catch (err) {
      console.log("Note: RPC exec not available. This is expected in some environments.")
    }

    // Insert new waitlist entry directly without checking for duplicates first
    // Let Supabase handle the unique constraint
    console.log("Inserting new waitlist entry:", { name, email })
    const { error } = await supabase.from("waitlist").insert([{ name, email, message }])

    if (error) {
      console.error("Error inserting waitlist entry:", error)

      // If it's a unique violation, the email already exists
      if (error.code === "23505") {
        return {
          success: false,
          message: "This email is already on our waitlist",
        }
      }

      // If the error is about the relation not existing, the table might not exist
      if (error.message?.includes("relation") && error.message?.includes("does not exist")) {
        console.log("The waitlist table might not exist in your Supabase database.")
        return {
          success: false,
          message: "Database setup issue. Please contact support.",
        }
      }

      return {
        success: false,
        message: `Failed to join waitlist: ${error.message}`,
      }
    }

    console.log("Successfully added to waitlist:", email)
    revalidatePath("/admin/waitlist")

    return {
      success: true,
      message: "Successfully joined the waitlist!",
    }
  } catch (error: any) {
    console.error("Error in joinWaitlist:", error)
    return {
      success: false,
      message: `An unexpected error occurred: ${error.message}`,
    }
  }
}

export async function getWaitlistEntries() {
  try {
    // Create Supabase client directly
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase.from("waitlist").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching waitlist entries:", error)
      return {
        success: false,
        data: [],
        message: "Failed to fetch waitlist entries",
      }
    }

    return {
      success: true,
      data: data || [],
      message: "Successfully fetched waitlist entries",
    }
  } catch (error: any) {
    console.error("Error in getWaitlistEntries:", error)
    return {
      success: false,
      data: [],
      message: `An unexpected error occurred: ${error.message}`,
    }
  }
}
