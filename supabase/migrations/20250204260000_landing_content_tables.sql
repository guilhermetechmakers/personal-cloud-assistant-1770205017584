-- =====================================================
-- Migration: landing_content, feature_details, pricing_details
-- Created: 2025-02-04T26:00:00Z
-- Tables: feature_details, pricing_details, landing_content
-- Purpose: CMS-backed landing page content and pricing/feature config
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
-- TABLE: feature_details
-- Purpose: Feature cards for landing (Connectors, Skill Packs, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  feature_name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  link_to_details TEXT,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT feature_details_name_not_empty CHECK (length(trim(feature_name)) > 0)
);

CREATE INDEX IF NOT EXISTS feature_details_display_order_idx ON feature_details(display_order);

DROP TRIGGER IF EXISTS update_feature_details_updated_at ON feature_details;
CREATE TRIGGER update_feature_details_updated_at
  BEFORE UPDATE ON feature_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE feature_details ENABLE ROW LEVEL SECURITY;

-- Public read for landing page
CREATE POLICY "feature_details_select_public"
  ON feature_details FOR SELECT
  USING (true);

COMMENT ON TABLE feature_details IS 'Landing page feature cards (Connectors, Skill Packs, etc.)';

-- =====================================================
-- TABLE: pricing_details
-- Purpose: Pricing tiers (Free, Pro, Teams) for landing teaser
-- =====================================================
CREATE TABLE IF NOT EXISTS pricing_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tier_name TEXT NOT NULL,
  tier_features JSONB DEFAULT '[]'::jsonb,
  price TEXT,
  link_to_signup TEXT,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT pricing_details_tier_not_empty CHECK (length(trim(tier_name)) > 0)
);

CREATE INDEX IF NOT EXISTS pricing_details_display_order_idx ON pricing_details(display_order);

DROP TRIGGER IF EXISTS update_pricing_details_updated_at ON pricing_details;
CREATE TRIGGER update_pricing_details_updated_at
  BEFORE UPDATE ON pricing_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE pricing_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pricing_details_select_public"
  ON pricing_details FOR SELECT
  USING (true);

COMMENT ON TABLE pricing_details IS 'Landing pricing teaser tiers';

-- =====================================================
-- TABLE: landing_content
-- Purpose: CMS sections (hero, testimonials, etc.) with content_data JSON
-- =====================================================
CREATE TABLE IF NOT EXISTS landing_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_name TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  content_data JSONB DEFAULT '{}'::jsonb,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT landing_content_section_not_empty CHECK (length(trim(section_name)) > 0)
);

CREATE INDEX IF NOT EXISTS landing_content_display_order_idx ON landing_content(display_order);

DROP TRIGGER IF EXISTS update_landing_content_updated_at ON landing_content;
CREATE TRIGGER update_landing_content_updated_at
  BEFORE UPDATE ON landing_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE landing_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "landing_content_select_public"
  ON landing_content FOR SELECT
  USING (true);

COMMENT ON TABLE landing_content IS 'Landing page CMS sections (hero, testimonials, etc.)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS landing_content CASCADE;
-- DROP TABLE IF EXISTS pricing_details CASCADE;
-- DROP TABLE IF EXISTS feature_details CASCADE;
