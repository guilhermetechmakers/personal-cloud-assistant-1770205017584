-- =====================================================
-- Migration: trigger to create profile on auth signup
-- Created: 2025-02-04T29:00:00Z
-- Purpose: Auto-create public.profiles row when a new auth.users row is inserted (signup/OAuth)
-- =====================================================

-- Function to run in auth context and insert into public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    timezone,
    locale,
    workspace_role
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      (NEW.raw_user_meta_data->>'given_name') || ' ' || (NEW.raw_user_meta_data->>'family_name')
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    'UTC',
    'en-US',
    'member'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger on auth.users (runs in Supabase with migration privileges)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

COMMENT ON FUNCTION public.handle_new_auth_user() IS 'Creates a public.profiles row when a new user signs up (email or OAuth)';
