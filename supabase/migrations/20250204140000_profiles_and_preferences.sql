-- =====================================================
-- Migration: profiles and user_preferences tables
-- Created: 2025-02-04T14:00:00Z
-- Tables: profiles, user_preferences
-- Purpose: Extended user profile and assistant preferences for User Profile page
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: profiles
-- Purpose: Extended user profile (1:1 with auth.users): display name, timezone, locale, avatar, workspace role, 2FA flag
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  full_name TEXT,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en-US',
  avatar_url TEXT,
  workspace_role TEXT DEFAULT 'member' CHECK (workspace_role IN ('member', 'admin', 'owner')),
  two_fa_enabled BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS profiles_updated_at_idx ON profiles(updated_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only read/update their own profile; insert on signup (handled by trigger or app)
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No DELETE (cascade from auth.users)

COMMENT ON TABLE profiles IS 'Extended user profile data (1:1 with auth.users)';
COMMENT ON COLUMN profiles.id IS 'References auth.users(id); same as user id';
COMMENT ON COLUMN profiles.two_fa_enabled IS 'Whether user has enabled two-factor authentication';

-- =====================================================
-- TABLE: user_preferences
-- Purpose: Assistant preferences per user: tone, verbosity, default approval level
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  assistant_tone TEXT DEFAULT 'professional' CHECK (assistant_tone IN ('professional', 'friendly', 'concise', 'detailed')),
  verbosity TEXT DEFAULT 'medium' CHECK (verbosity IN ('low', 'medium', 'high')),
  default_approval_level TEXT DEFAULT 'requires_approval' CHECK (default_approval_level IN ('draft_only', 'requires_approval', 'always_allow')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS user_preferences_updated_at_idx ON user_preferences(updated_at DESC);

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences_select_own"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_own"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_own"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_delete_own"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE user_preferences IS 'Assistant and approval preferences per user';
COMMENT ON COLUMN user_preferences.assistant_tone IS 'Tone of assistant responses';
COMMENT ON COLUMN user_preferences.default_approval_level IS 'Default for irreversible actions: draft_only, requires_approval, always_allow';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS user_preferences CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
