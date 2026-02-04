/**
 * Landing page content API (Supabase when configured, static fallback)
 */

import { supabase } from '@/lib/supabase'
import type { FeatureDetail, PricingDetail, LandingContent } from '@/types/landing'

export async function fetchFeatureDetails(): Promise<FeatureDetail[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('feature_details')
      .select('*')
      .order('display_order', { ascending: true })
    if (!error && data?.length) return data as FeatureDetail[]
  }
  return []
}

export async function fetchPricingDetails(): Promise<PricingDetail[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('pricing_details')
      .select('*')
      .order('display_order', { ascending: true })
    if (!error && data?.length) return data as PricingDetail[]
  }
  return []
}

export async function fetchLandingContent(): Promise<LandingContent[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('landing_content')
      .select('*')
      .order('display_order', { ascending: true })
    if (!error && data?.length) return data as LandingContent[]
  }
  return []
}
