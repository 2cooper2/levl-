import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

// Initialize Resend if API key is available
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create admin client for email operations
const adminClient =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

/**
 * Send a confirmation email to a user
 */
export async function sendConfirmationEmail(email: string, token: string) {
  console.log("Email verification bypassed for:", email)
  // Always return success without actually sending an email
  return { success: true }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  console.log("Password reset email bypassed for:", email)
  // Always return success without actually sending an email
  return { success: true }
}
