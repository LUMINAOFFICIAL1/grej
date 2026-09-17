-- ========================================================
-- GREJLABS UID BYPASS - CUSTOM SUPABASE DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor
-- ========================================================

-- 1. PROFILES TABLE (Stores Reseller Roles & Active UID Limits)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  approved BOOLEAN DEFAULT true,
  credits INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'starter' CHECK (role IN ('starter', 'pro', 'developer', 'admin')),
  uid_limit INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated & anon to view profiles for admin control
CREATE POLICY "Allow public select profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update profiles"
  ON public.profiles FOR UPDATE
  USING (true);


-- 2. USER_ROLES TABLE (For Security Definer Role Sync)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('starter', 'pro', 'developer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select user_roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert user_roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update user_roles"
  ON public.user_roles FOR ALL
  USING (true);


-- 3. ORDERS TABLE (Stores Reseller Role Purchase Submissions)
CREATE TABLE IF NOT EXISTS public.role_orders (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  pkg TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL,
  tx_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending Admin Verification',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.role_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select role_orders"
  ON public.role_orders FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert role_orders"
  ON public.role_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update role_orders"
  ON public.role_orders FOR UPDATE
  USING (true);


-- 4. UID LOGS TABLE (Tracks Reseller Actions: Add, Replace, Extend, Remove)
CREATE TABLE IF NOT EXISTS public.uid_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  uid TEXT NOT NULL,
  target_uid TEXT,
  days INTEGER,
  credits_used INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'success',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.uid_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select uid_logs"
  ON public.uid_logs FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert uid_logs"
  ON public.uid_logs FOR INSERT
  WITH CHECK (true);


-- 5. AUTOMATIC NEW USER TRIGGER & ADMIN ASSIGNMENT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT := 'starter';
  assigned_limit INTEGER := 0;
BEGIN
  IF LTRIM(LOWER(new.email)) = 'alisaleem98776@gmail.com' THEN
    assigned_role := 'admin';
    assigned_limit := 999999;
  END IF;

  INSERT INTO public.profiles (id, email, display_name, approved, credits, role, uid_limit)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), true, assigned_limit, assigned_role, assigned_limit)
  ON CONFLICT (id) DO UPDATE
  SET role = EXCLUDED.role, uid_limit = EXCLUDED.uid_limit, credits = EXCLUDED.credits;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 6. UPGRADE EXISTING USER alisaleem98776@gmail.com TO ADMIN IMMEDIATELY
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'alisaleem98776@gmail.com' LIMIT 1;
  
  IF target_user_id IS NOT NULL THEN
    UPDATE auth.users 
    SET email_confirmed_at = NOW(), confirmed_at = NOW() 
    WHERE id = target_user_id;

    INSERT INTO public.profiles (id, email, display_name, approved, credits, role, uid_limit)
    VALUES (target_user_id, 'alisaleem98776@gmail.com', 'Grej', true, 999999, 'admin', 999999)
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', uid_limit = 999999, credits = 999999, approved = true;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;
