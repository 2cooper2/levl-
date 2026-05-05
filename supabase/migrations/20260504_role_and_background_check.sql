-- Run this in Supabase Dashboard → SQL Editor
-- Adds background_check_status column + ensures role constraint includes 'both' (master)

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS background_check_status TEXT
    CHECK (background_check_status IN ('none','pending','cleared','rejected'))
    DEFAULT 'none';

-- Refresh role constraint to be explicit
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
    CHECK (role IN ('client','worker','both'));

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_bg_status ON public.users(background_check_status);

-- Promote the master account (you) — safe to run repeatedly
UPDATE public.users
   SET role = 'both',
       background_check_status = 'cleared'
 WHERE lower(email) = 'caydonac@gmail.com';
