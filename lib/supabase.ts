import { createClient } from "@supabase/supabase-js"

// For client components
export const createClientComponentClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  )
}

// For server components and server actions
export const createServerClient = () => {
  return createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: {
      persistSession: false,
    },
  })
}
