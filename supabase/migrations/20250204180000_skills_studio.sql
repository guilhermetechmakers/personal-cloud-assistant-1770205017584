-- =====================================================
-- Migration: skills, skill_blocks, skill_version_history, skill_tests
-- Created: 2025-02-04T18:00:00Z
-- Tables: skills, skill_blocks, skill_version_history, skill_tests
-- Purpose: Skill Studio no-code builder: skills, blocks, version history, test runs
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
-- TABLE: skills
-- Purpose: User-created skills: name, trigger, status (draft/published), version
-- =====================================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'schedule', 'event')),
  trigger_config JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  version INTEGER NOT NULL DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT skills_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS skills_user_id_idx ON skills(user_id);
CREATE INDEX IF NOT EXISTS skills_status_idx ON skills(status);
CREATE INDEX IF NOT EXISTS skills_created_at_idx ON skills(created_at DESC);

DROP TRIGGER IF EXISTS update_skills_updated_at ON skills;
CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_select_own"
  ON skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "skills_insert_own"
  ON skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skills_update_own"
  ON skills FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skills_delete_own"
  ON skills FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE skills IS 'User-created skills for Skill Studio; draft or published';
COMMENT ON COLUMN skills.trigger_config IS 'Schedule cron or event config (JSON)';

-- =====================================================
-- TABLE: skill_blocks
-- Purpose: Blocks within a skill: type, config, order
-- =====================================================
CREATE TABLE IF NOT EXISTS skill_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,

  block_type TEXT NOT NULL CHECK (block_type IN (
    'Fetch', 'Transform', 'Search', 'WebAgent', 'CreateOutput', 'Deliver', 'Guard'
  )),
  config JSONB DEFAULT '{}'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS skill_blocks_skill_id_idx ON skill_blocks(skill_id);
CREATE INDEX IF NOT EXISTS skill_blocks_order_idx ON skill_blocks(skill_id, order_index);

DROP TRIGGER IF EXISTS update_skill_blocks_updated_at ON skill_blocks;
CREATE TRIGGER update_skill_blocks_updated_at
  BEFORE UPDATE ON skill_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE skill_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skill_blocks_select_own"
  ON skill_blocks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM skills s WHERE s.id = skill_blocks.skill_id AND s.user_id = auth.uid())
  );

CREATE POLICY "skill_blocks_insert_own"
  ON skill_blocks FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM skills s WHERE s.id = skill_blocks.skill_id AND s.user_id = auth.uid())
  );

CREATE POLICY "skill_blocks_update_own"
  ON skill_blocks FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM skills s WHERE s.id = skill_blocks.skill_id AND s.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM skills s WHERE s.id = skill_blocks.skill_id AND s.user_id = auth.uid())
  );

CREATE POLICY "skill_blocks_delete_own"
  ON skill_blocks FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM skills s WHERE s.id = skill_blocks.skill_id AND s.user_id = auth.uid())
  );

COMMENT ON TABLE skill_blocks IS 'Blocks within a skill: Fetch, Transform, Search, etc.';

-- =====================================================
-- TABLE: skill_version_history
-- Purpose: Version snapshots for revert
-- =====================================================
CREATE TABLE IF NOT EXISTS skill_version_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT skill_version_history_version_positive CHECK (version > 0)
);

CREATE INDEX IF NOT EXISTS skill_version_history_skill_id_idx ON skill_version_history(skill_id);
CREATE INDEX IF NOT EXISTS skill_version_history_created_at_idx ON skill_version_history(created_at DESC);

ALTER TABLE skill_version_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skill_version_history_select_own"
  ON skill_version_history FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM skills s WHERE s.id = skill_version_history.skill_id AND s.user_id = auth.uid())
  );

CREATE POLICY "skill_version_history_insert_own"
  ON skill_version_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skill_version_history_delete_own"
  ON skill_version_history FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM skills s WHERE s.id = skill_version_history.skill_id AND s.user_id = auth.uid())
  );

COMMENT ON TABLE skill_version_history IS 'Version snapshots for Skill Studio revert';

-- =====================================================
-- TABLE: skill_tests
-- Purpose: Test run records: inputs, outputs, status
-- =====================================================
CREATE TABLE IF NOT EXISTS skill_tests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,

  inputs JSONB DEFAULT '{}'::jsonb,
  outputs JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS skill_tests_skill_id_idx ON skill_tests(skill_id);
CREATE INDEX IF NOT EXISTS skill_tests_created_at_idx ON skill_tests(created_at DESC);

ALTER TABLE skill_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skill_tests_select_own"
  ON skill_tests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM skills s WHERE s.id = skill_tests.skill_id AND s.user_id = auth.uid())
  );

CREATE POLICY "skill_tests_insert_own"
  ON skill_tests FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM skills s WHERE s.id = skill_tests.skill_id AND s.user_id = auth.uid())
  );

COMMENT ON TABLE skill_tests IS 'Test run records for Skill Studio test runner';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS skill_tests CASCADE;
-- DROP TABLE IF EXISTS skill_version_history CASCADE;
-- DROP TABLE IF EXISTS skill_blocks CASCADE;
-- DROP TABLE IF EXISTS skills CASCADE;
