/**
 * Check if Resend is properly configured
 */
export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

/**
 * Check if Supabase email is properly configured
 */
export function isSupabaseEmailConfigured(): boolean {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY
}

/**
 * Check if any email service is configured
 */
export function isEmailServiceConfigured(): boolean {
  return isResendConfigured() || isSupabaseEmailConfigured()
}

/**
 * Get email configuration status
 */
export function getEmailConfigStatus() {
  return {
    resend: isResendConfigured(),
    supabase: isSupabaseEmailConfigured(),
    anyConfigured: isEmailServiceConfigured(),
  }
}
