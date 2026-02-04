/**
 * React Query hooks for landing page content (features, pricing, CMS sections).
 */

import { useQuery } from '@tanstack/react-query'
import {
  fetchFeatureDetails,
  fetchPricingDetails,
  fetchLandingContent,
} from '@/lib/landing'

export const landingKeys = {
  all: ['landing'] as const,
  features: () => [...landingKeys.all, 'features'] as const,
  pricing: () => [...landingKeys.all, 'pricing'] as const,
  content: () => [...landingKeys.all, 'content'] as const,
}

export function useLandingFeatures() {
  return useQuery({
    queryKey: landingKeys.features(),
    queryFn: fetchFeatureDetails,
    staleTime: 1000 * 60 * 10,
  })
}

export function useLandingPricing() {
  return useQuery({
    queryKey: landingKeys.pricing(),
    queryFn: fetchPricingDetails,
    staleTime: 1000 * 60 * 10,
  })
}

export function useLandingContent() {
  return useQuery({
    queryKey: landingKeys.content(),
    queryFn: fetchLandingContent,
    staleTime: 1000 * 60 * 10,
  })
}
