-- =====================================================
-- Migration: search_indexes and user_searches tables
-- Created: 2025-02-04T25:00:00Z
-- Tables: search_indexes, user_searches
-- Purpose: Search & Filter feature - indexed content and saved searches
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
-- TABLE: search_indexes
-- Purpose: Indexed data for inbox items, runs, skills, packs (searchable content)
-- =====================================================
CREATE TABLE IF NOT EXISTS search_indexes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inbox', 'run', 'skill', 'pack')),
  entity_id UUID NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS search_indexes_user_id_idx ON search_indexes(user_id);
CREATE INDEX IF NOT EXISTS search_indexes_type_idx ON search_indexes(type);
CREATE INDEX IF NOT EXISTS search_indexes_entity_id_idx ON search_indexes(entity_id);
CREATE INDEX IF NOT EXISTS search_indexes_created_at_idx ON search_indexes(created_at DESC);

-- Full-text search (optional; simple ilike can be used for MVP)
CREATE INDEX IF NOT EXISTS search_indexes_content_gin_idx ON search_indexes USING gin(to_tsvector('english', coalesce(content, '')));

ALTER TABLE search_indexes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "search_indexes_select_own"
  ON search_indexes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "search_indexes_insert_own"
  ON search_indexes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "search_indexes_update_own"
  ON search_indexes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "search_indexes_delete_own"
  ON search_indexes FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE search_indexes IS 'Searchable index for inbox, runs, skills, packs';
COMMENT ON COLUMN search_indexes.user_id IS 'Owner (references auth.users)';
COMMENT ON COLUMN search_indexes.type IS 'Domain: inbox, run, skill, pack';
COMMENT ON COLUMN search_indexes.entity_id IS 'Reference to source entity';
COMMENT ON COLUMN search_indexes.content IS 'Searchable text content';

-- =====================================================
-- TABLE: user_searches
-- Purpose: User-specific saved searches (name, parameters, metadata)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_searches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  search_name TEXT NOT NULL,
  search_parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT user_searches_name_not_empty CHECK (length(trim(search_name)) > 0)
);

CREATE INDEX IF NOT EXISTS user_searches_user_id_idx ON user_searches(user_id);
CREATE INDEX IF NOT EXISTS user_searches_created_at_idx ON user_searches(created_at DESC);

DROP TRIGGER IF EXISTS update_user_searches_updated_at ON user_searches;
CREATE TRIGGER update_user_searches_updated_at
  BEFORE UPDATE ON user_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_searches_select_own"
  ON user_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_searches_insert_own"
  ON user_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_searches_update_own"
  ON user_searches FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_searches_delete_own"
  ON user_searches FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE user_searches IS 'Saved search criteria per user';
COMMENT ON COLUMN user_searches.search_parameters IS 'Query, filters, date range, etc.';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS user_searches CASCADE;
-- DROP TABLE IF EXISTS search_indexes CASCADE;
