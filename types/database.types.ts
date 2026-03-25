export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          bio: string | null
          role: string
          available_roles: string[] | null // New field to store available roles
          active_role: string | null // New field to store currently active role
          created_at: string
          updated_at: string
          social_links: Json | null
          privacy_settings: Json | null
          headline: string | null
          skills: string | null
          email_verified: boolean | null
          stripe_customer_id: string | null
          stripe_account_id: string | null
          account_balance: number | null
          onboarding_completed: boolean | null
          is_active: boolean | null
          is_verified: boolean | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          bio?: string | null
          role?: string
          available_roles?: string[] | null
          active_role?: string | null
          created_at?: string
          updated_at?: string
          social_links?: Json | null
          privacy_settings?: Json | null
          headline?: string | null
          skills?: string | null
          email_verified?: boolean | null
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          account_balance?: number | null
          onboarding_completed?: boolean | null
          is_active?: boolean | null
          is_verified?: boolean | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          bio?: string | null
          role?: string
          available_roles?: string[] | null
          active_role?: string | null
          created_at?: string
          updated_at?: string
          social_links?: Json | null
          privacy_settings?: Json | null
          headline?: string | null
          skills?: string | null
          email_verified?: boolean | null
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          account_balance?: number | null
          onboarding_completed?: boolean | null
          is_active?: boolean | null
          is_verified?: boolean | null
        }
      }
      // Other tables remain the same...
    }
    // Views, Functions, Enums remain the same...
  }
}

export type User = Database["public"]["Tables"]["users"]["Row"]
// Other types remain the same...
