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
  // This functionality has been removed
  return {
    success: true,
    message: "Waitlist functionality has been removed",
  }
}

export async function getWaitlistEntries() {
  // This functionality has been removed
  return {
    success: true,
    data: [],
    message: "Waitlist functionality has been removed",
  }
}
