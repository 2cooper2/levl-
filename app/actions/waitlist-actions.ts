"use server"

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
  let name: string, email: string, role: string | undefined, message: string | undefined

  if (formData instanceof FormData) {
    name = formData.get("name") as string
    email = formData.get("email") as string
    role = formData.get("role") as string | undefined
    message = formData.get("message") as string | undefined
  } else {
    name = formData.name
    email = formData.email
    role = formData.role
    message = formData.message
  }

  try {
    const supabase = await import("@/lib/supabase").then((m) => m.createServerClient())

    if (!supabase) {
      return { success: false, message: "Failed to create Supabase client" }
    }

    const tableExists = await ensureWaitlistTable(supabase)
    if (!tableExists) {
      return { success: false, message: "Failed to ensure waitlist table exists" }
    }

    const { error } = await supabase.from("waitlist").insert({
      name,
      email,
      message,
      role,
    })

    if (error) {
      console.error("Error joining waitlist:", error)
      return { success: false, message: error.message }
    }

    return { success: true, message: "Successfully joined the waitlist!" }
  } catch (err: any) {
    console.error("Error in joinWaitlist:", err)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function getWaitlistEntries() {
  try {
    const supabase = await import("@/lib/supabase").then((m) => m.createServerClient())

    if (!supabase) {
      return { success: false, message: "Failed to create Supabase client", data: [] }
    }

    const { data, error } = await supabase.from("waitlist").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching waitlist entries:", error)
      return { success: false, message: "Failed to fetch waitlist entries", data: [] }
    }

    return { success: true, data: data, message: "Successfully fetched waitlist entries" }
  } catch (err: any) {
    console.error("Error in getWaitlistEntries:", err)
    return { success: false, message: "An unexpected error occurred", data: [] }
  }
}
