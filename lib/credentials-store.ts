// lib/credentials-store.ts
//
// Storage layer for verified platform credentials.
//
// Today: localStorage only (single-browser, demo-grade).
// Tomorrow: swap the four implementations below to Supabase calls — the rest
// of the app keeps using getCredentials/saveCredential/removeCredential without
// changes. Supabase schema sketched at the bottom of this file.

import type { VerifiedProfile } from "@/components/portal/verify-taskrabbit-modal"

export type AnyVerifiedProfile = VerifiedProfile // expand union as more platforms ship
export type CredentialMap = Record<string, AnyVerifiedProfile>

const KEY = (handle: string) => `levl:credentials:${handle}`

export async function getCredentials(handle: string): Promise<CredentialMap> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(KEY(handle))
    return raw ? (JSON.parse(raw) as CredentialMap) : {}
  } catch {
    return {}
  }
}

export async function saveCredential(
  handle: string,
  platform: string,
  profile: AnyVerifiedProfile,
): Promise<void> {
  if (typeof window === "undefined") return
  const existing = await getCredentials(handle)
  existing[platform] = profile
  window.localStorage.setItem(KEY(handle), JSON.stringify(existing))
}

export async function removeCredential(handle: string, platform: string): Promise<void> {
  if (typeof window === "undefined") return
  const existing = await getCredentials(handle)
  delete existing[platform]
  window.localStorage.setItem(KEY(handle), JSON.stringify(existing))
}

// ─── Supabase migration (when ready) ─────────────────────────────────────────
//
// 1. Run this in the Supabase SQL editor:
//
//    create table public.verified_credentials (
//      id            uuid primary key default gen_random_uuid(),
//      user_handle   text not null,
//      platform      text not null,
//      profile_url   text not null,
//      profile_data  jsonb not null,
//      verified_at   timestamptz not null default now(),
//      unique (user_handle, platform)
//    );
//    alter table public.verified_credentials enable row level security;
//    -- public read policy (so /profile/[handle] can render anonymously):
//    create policy verified_credentials_public_read
//      on public.verified_credentials for select using (true);
//    -- only authenticated users can write their own row:
//    create policy verified_credentials_owner_write
//      on public.verified_credentials for all
//      using (auth.jwt() ->> 'handle' = user_handle);
//
// 2. Replace the three functions above with:
//
//    import { createDatabaseClient } from "@/lib/database"
//
//    export async function getCredentials(handle: string) {
//      const db = createDatabaseClient()
//      if (!db) return {}
//      const { data } = await db
//        .from("verified_credentials")
//        .select("platform, profile_data")
//        .eq("user_handle", handle)
//      return Object.fromEntries((data ?? []).map((r) => [r.platform, r.profile_data]))
//    }
//
//    export async function saveCredential(handle, platform, profile) {
//      const db = createDatabaseClient()
//      if (!db) return
//      await db.from("verified_credentials").upsert({
//        user_handle: handle,
//        platform,
//        profile_url: profile.profileUrl,
//        profile_data: profile,
//      })
//    }
//
//    export async function removeCredential(handle, platform) {
//      const db = createDatabaseClient()
//      if (!db) return
//      await db.from("verified_credentials")
//        .delete()
//        .eq("user_handle", handle)
//        .eq("platform", platform)
//    }
