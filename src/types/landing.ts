/**
 * Types for landing page content (feature_details, pricing_details, landing_content)
 */

export interface FeatureDetail {
  id: string
  feature_name: string
  description: string | null
  icon_url: string | null
  link_to_details: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface FeatureDetailInsert {
  id?: string
  feature_name: string
  description?: string | null
  icon_url?: string | null
  link_to_details?: string | null
  display_order?: number
}

export interface PricingDetail {
  id: string
  tier_name: string
  tier_features: string[]
  price: string | null
  link_to_signup: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface PricingDetailInsert {
  id?: string
  tier_name: string
  tier_features?: string[]
  price?: string | null
  link_to_signup?: string | null
  display_order?: number
}

export interface LandingContent {
  id: string
  section_name: string
  content_type: string
  content_data: Record<string, unknown>
  display_order: number
  created_at: string
  updated_at: string
}

export interface LandingContentInsert {
  id?: string
  section_name: string
  content_type: string
  content_data?: Record<string, unknown>
  display_order?: number
}

export type FeatureDetailRow = FeatureDetail
export type PricingDetailRow = PricingDetail
export type LandingContentRow = LandingContent
