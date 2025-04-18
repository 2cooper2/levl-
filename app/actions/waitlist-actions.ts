"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Make sure the waitlist table exists and has the correct structure
// This function should be called before attempting to insert data
async function ensureWaitlistTable(supabase: any) {
  try {
    // Try to create the waitlist table if it doesn't exist
    const { error: createTableError } = await supabase.rpc("exec", {
      query: `
        CREATE TABLE IF NOT EXISTS waitlist (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    if (createTableError) {
      console.log(
        "Note: Could not create waitlist table via RPC. This is expected if using anon key:",
        createTableError.message,
      )

      // Try direct SQL query as fallback
      const { error: directQueryError } = await supabase.from("waitlist").select("count(*)").limit(1)

      if (
        directQueryError &&
        directQueryError.message?.includes("relation") &&
        directQueryError.message?.includes("does not exist")
      ) {
        console.log("Waitlist table doesn't exist. Please create it manually in your Supabase dashboard.")
        return false
      }
    }

    return true
  } catch (err) {
    console.log("Error checking waitlist table:", err)
    return false
  }
}

export async function joinWaitlist(
  formData: FormData | { name: string; email: string; role?: string; message?: string },
) {
  try {
    // Create Supabase client (will return mock client if credentials are missing)
    const supabase = createServerClient()

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

    // Combine role and message into a single message field
    const message = `Role: ${role}

Feedback: ${userMessage}`

    if (!name || !email) {
      return {
        success: false,
        message: "Name and email are required",
      }
    }

    // Ensure the waitlist table exists
    const tableExists = await ensureWaitlistTable(supabase)
    if (!tableExists) {
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
      .single()

    if (lookupError && lookupError.code !== "PGRST116") {
      console.error("Error checking existing user:", lookupError)

      // If the error is about the relation not existing, the table might not exist
      if (lookupError.message?.includes("relation") && lookupError.message?.includes("does not exist")) {
        console.log("The waitlist table might not exist in your Supabase database.")
        return {
          success: false,
          message: "Database setup issue. Please contact support.",
        }
      }

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

    // Insert new waitlist entry - only using the existing columns
    console.log("Inserting new waitlist entry:", { name, email, message })
    const { error } = await supabase.from("waitlist").insert([{ name, email, message }])

    if (error) {
      console.error("Error inserting waitlist entry:", error)

      // If the error is about the relation not existing, the table might not exist
      if (error.message?.includes("relation") && error.message?.includes("does not exist")) {
        console.log("The waitlist table might not exist in your Supabase database.")
        return {
          success: false,
          message: "Database setup issue. Please contact support.",
        }
      }

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
    console.error("Error in joinWaitlist:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}

export async function getWaitlistEntries() {
  try {
    // Create Supabase client (will return mock client if credentials are missing)
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
