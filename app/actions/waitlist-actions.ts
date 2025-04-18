"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Make sure the waitlist table exists and has the correct structure
// This function should be called before attempting to insert data
async function ensureWaitlistTable(supabase: any) {
  try {
    // Check if the table exists by attempting a simple query
    const { error: checkError } = await supabase.from("waitlist").select("count(*)").limit(1).single()

    // If the table doesn't exist, log it
    if (checkError && checkError.message?.includes("relation") && checkError.message?.includes("does not exist")) {
      console.log("Waitlist table doesn't exist. Creating it now...")

      // Try to create the table
      const { error: createError } = await supabase.rpc("exec", {
        query: `
          CREATE TABLE IF NOT EXISTS waitlist (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            message TEXT,
            role TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (createError) {
        console.error("Error creating waitlist table:", createError)
        return false
      }

      return true
    }

    // Check if the 'role' column exists
    const { data: columnData, error: columnError } = await supabase.from("waitlist").select("role").limit(1)

    if (columnError && columnError.message?.includes('column "role" does not exist')) {
      console.log("Role column does not exist. Adding it now...")

      const { error: alterError } = await supabase.rpc("exec", {
        query: `ALTER TABLE waitlist ADD COLUMN role TEXT;`,
      })

      if (alterError) {
        console.error("Error adding 'role' column:", alterError)
        return false
      }
    }

    return true
  } catch (err) {
    console.error("Error checking waitlist table:", err)
    return false
  }
}

export async function joinWaitlist(
  formData: FormData | { name: string; email: string; role?: string; message?: string },
) {
  try {
    console.log("Starting waitlist submission process...")

    // Create Supabase client
    const supabase = createServerClient()
    if (!supabase) {
      console.error("Failed to create Supabase client")
      return {
        success: false,
        message: "Database connection error. Please try again later.",
      }
    }

    // Handle both FormData objects and plain objects
    let name, email, role, userMessage

    if (formData instanceof FormData) {
      name = formData.get("name") as string
      email = formData.get("email") as string
      role = (formData.get("role") as string) || "client"
      userMessage = (formData.get("message") as string) || ""
    } else {
      name = formData.name
      email = formData.email
      role = formData.role || "client"
      userMessage = formData.message || ""
    }

    console.log("Form data extracted:", { name, email, role })

    // Validate inputs
    if (!name || !email) {
      console.log("Missing required fields")
      return {
        success: false,
        message: "Name and email are required",
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email)
      return {
        success: false,
        message: "Please enter a valid email address",
      }
    }

    // Ensure the waitlist table exists
    const tableExists = await ensureWaitlistTable(supabase)
    if (!tableExists) {
      console.error("Table does not exist and could not be created")
      return {
        success: false,
        message: "Database setup issue. Please contact support.",
      }
    }

    // Check if email already exists
    console.log("Checking if email already exists:", email)
    const { data: existingUser, error: lookupError } = await supabase
      .from("waitlist")
      .select("email")
      .eq("email", email)
      .maybeSingle()

    if (lookupError && lookupError.code !== "PGRST116") {
      console.error("Error checking existing user:", lookupError)
      return {
        success: false,
        message: "Error checking waitlist. Please try again.",
      }
    }

    if (existingUser) {
      console.log("Email already exists in waitlist:", email)
      return {
        success: false,
        message: "This email is already on our waitlist",
      }
    }

    // Insert new waitlist entry
    console.log("Inserting new waitlist entry:", { name, email, role, message: userMessage })

    // Create a base object without the role field
    const insertData = {
      name,
      email,
      message: userMessage,
    }

    // Try to insert with role field first
    try {
      const { error } = await supabase.from("waitlist").insert([
        {
          ...insertData,
          role: role,
        },
      ])

      // If there's an error about the role column, try again without it
      if (error && error.message && error.message.includes("role")) {
        console.log("Role column not found, trying without role field")
        const { error: retryError } = await supabase.from("waitlist").insert([insertData])

        if (retryError) {
          console.error("Error inserting waitlist entry (retry):", retryError)

          // If it's a unique violation, the email already exists
          if (retryError.code === "23505") {
            return {
              success: false,
              message: "This email is already on our waitlist",
            }
          }

          return {
            success: false,
            message: "Failed to join waitlist. Please try again.",
          }
        }
      } else if (error) {
        console.error("Error inserting waitlist entry:", error)

        // If it's a unique violation, the email already exists
        if (error.code === "23505") {
          return {
            success: false,
            message: "This email is already on our waitlist",
          }
        }

        return {
          success: false,
          message: "Failed to join waitlist. Please try again.",
        }
      }

      console.log("Successfully added to waitlist:", email)
      revalidatePath("/admin/waitlist")

      return {
        success: true,
        message: "Successfully joined the waitlist!",
      }
    } catch (error) {
      console.error("Error in joinWaitlist insert operation:", error)
      return {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      }
    }
  } catch (error) {
    console.error("Error in joinWaitlist:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}

export async function getWaitlistEntries() {
  try {
    // Create Supabase client
    const supabase = createServerClient()

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
  } catch (error) {
    console.error("Error in getWaitlistEntries:", error)
    return {
      success: false,
      data: [],
      message: "An unexpected error occurred",
    }
  }
}
