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
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          provider_id: string
          category_id: string | null
          base_price: number
          currency: string
          delivery_time: string | null
          is_featured: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          provider_id: string
          category_id?: string | null
          base_price: number
          currency?: string
          delivery_time?: string | null
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          provider_id?: string
          category_id?: string | null
          base_price?: number
          currency?: string
          delivery_time?: string | null
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          payment_intent_id: string | null
          payment_status: string | null
          earnings_status: string | null
          status: string | null
          // Add other fields as needed
        }
        Insert: {
          id?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          earnings_status?: string | null
          status?: string | null
          // Add other fields as needed
        }
        Update: {
          id?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          earnings_status?: string | null
          status?: string | null
          // Add other fields as needed
        }
      }
      bank_accounts: {
        Row: {
          id: string
          user_id: string
          account_number: string
          routing_number: string
          account_holder_name: string
          account_type: string
          bank_name: string
          is_default: boolean | null
          is_verified: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_number: string
          routing_number: string
          account_holder_name: string
          account_type: string
          bank_name: string
          is_default?: boolean | null
          is_verified?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_number?: string
          routing_number?: string
          account_holder_name?: string
          account_type?: string
          bank_name?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type User = Database["public"]["Tables"]["users"]["Row"]
export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type Service = Database["public"]["Tables"]["services"]["Row"]
export type Booking = Database["public"]["Tables"]["bookings"]["Row"]
export type BankAccount = Database["public"]["Tables"]["bank_accounts"]["Row"]
