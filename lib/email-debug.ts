import { Resend } from "resend"

export async function getEmailDebugInfo() {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const debugInfo: any = {
      resend: {
        configured: !!resendApiKey,
        domains: "None",
      },
      environment: {
        RESEND_API_KEY: resendApiKey ? "Set" : "Not set",
        ADMIN_EMAIL: process.env.ADMIN_EMAIL ? "Set" : "Not set",
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ? "Set" : "Not set",
        SUPABASE_URL: process.env.SUPABASE_URL ? "Set" : "Not set",
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
      },
    }

    // Try to get Resend domains if API key is available
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey)
        const domains = await resend.domains.list()

        if (domains.data && domains.data.length > 0) {
          debugInfo.resend.domains = domains.data.map((d) => d.name).join(", ")
        }
      } catch (resendError: any) {
        debugInfo.resend.error = resendError.message || "Error fetching Resend domains"
      }
    }

    return debugInfo
  } catch (error: any) {
    return {
      error: error.message || "Failed to get email debug info",
    }
  }
}
