import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"
import type { NextApiRequest, NextApiResponse } from "next"
import { parse, serialize } from "cookie"

// This version is safe to use in the pages/ directory
export const createPagesServerClient = (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials for server client")
    throw new Error("Missing Supabase credentials")
  }

  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const cookies = parse(req.headers.cookie || "")
        return cookies[name]
      },
      set(name: string, value: string, options: CookieOptions) {
        res.setHeader("Set-Cookie", serialize(name, value, options))
      },
      remove(name: string, options: CookieOptions) {
        res.setHeader("Set-Cookie", serialize(name, "", { ...options, maxAge: -1 }))
      },
    },
  })
}

export const createPagesDatabaseClient = createPagesServerClient
