# Type Definitions

## Core Domain Types

```typescript
// types/index.ts

// ─── Profiles ─────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  subscription_status: SubscriptionStatus
  subscription_plan: SubscriptionPlan | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_start_date: string | null
  subscription_end_date: string | null
  created_at: string
  updated_at: string
}

export type SubscriptionStatus = 'none' | 'active' | 'canceled' | 'past_due'
export type SubscriptionPlan = 'monthly' | 'yearly'

// ─── Animation Types (categories) ─────────────────────────

export interface AnimationType {
  id: string
  name: string
  slug: AnimationTypeSlug
  description: string | null
  icon: string | null
  display_order: number
  created_at: string
}

export type AnimationTypeSlug =
  | 'liquid'
  | 'particles'
  | '3d-object'
  | 'svg'
  | 'typography'
  | 'scroll'

// ─── Param Schema ──────────────────────────────────────────

export type ParamType = 'float' | 'color' | 'boolean' | 'select' | 'integer'

export interface ParamSchema {
  key: string
  type: ParamType
  label: string
  default: any
  // Float / integer fields
  min?: number
  max?: number
  step?: number
  // Select field
  options?: Array<{ label: string; value: string }>
  // UI grouping
  group?: string
}

export type AnimationParams = Record<string, any>

// ─── Presets ───────────────────────────────────────────────

export interface Preset {
  name: string
  params: AnimationParams
  thumbnail?: string // Optional preview image for this preset
}

// ─── Animations ────────────────────────────────────────────

export interface Animation {
  id: string
  title: string
  slug: string
  description: string
  short_description: string | null
  animation_type_id: string | null
  params_schema: ParamSchema[]
  presets: Preset[]
  runtime_bundle_url: string | null
  preview_video_url: string | null
  preview_image_url: string | null
  screenshots: string[]
  tags: string[]
  complexity: AnimationComplexity
  performance_tier: PerformanceTier
  embed_count: number
  view_count: number
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  // Relations
  animation_types?: AnimationType
}

export type AnimationComplexity = 'simple' | 'moderate' | 'complex'
export type PerformanceTier = 'lightweight' | 'standard' | 'heavy'

// ─── Embed Instances ───────────────────────────────────────

export interface EmbedInstance {
  id: string
  user_id: string
  animation_id: string
  name: string
  params: AnimationParams
  preset_name: string | null
  token: string
  token_active: boolean
  last_loaded_at: string | null
  load_count: number
  created_at: string
  updated_at: string
  // Relations
  animations?: Pick<Animation, 'id' | 'title' | 'slug' | 'preview_image_url'>
}

// ─── User Animations (access) ──────────────────────────────

export interface UserAnimation {
  id: string
  user_id: string
  animation_id: string
  access_type: 'subscription'
  granted_at: string
}

// ─── Favorites ─────────────────────────────────────────────

export interface Favorite {
  id: string
  user_id: string
  animation_id: string
  created_at: string
}

// ─── Dashboard View ────────────────────────────────────────

export interface UserDashboardItem {
  user_id: string
  animation_id: string
  title: string
  slug: string
  short_description: string | null
  animation_type: string
  preview_image_url: string | null
  preview_video_url: string | null
  access_type: 'subscription'
  granted_at: string
  embed_count: number
}
```

---

## Component Props Types

```typescript
// types/components.ts

import type { Animation, AnimationParams, ParamSchema, Preset, EmbedInstance, AnimationType } from '.'

// Animation components
export interface AnimationViewerProps {
  animation: Animation
  params: AnimationParams
  className?: string
}

export interface ParameterControlsProps {
  schema: ParamSchema[]
  params: AnimationParams
  onChange: (key: string, value: any) => void
}

export interface PresetSelectorProps {
  presets: Preset[]
  activePreset: string | null
  onApply: (preset: Preset) => void
}

export interface EmbedCodePanelProps {
  embed: EmbedInstance
  animationSlug: string
}

// Marketplace components
export interface AnimationCardProps {
  animation: Animation
  hasAccess?: boolean
}

export interface AnimationGridProps {
  animations: Animation[]
  userAnimationIds?: string[]
  loading?: boolean
}

export interface TypeFilterProps {
  types: AnimationType[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

// Dashboard components
export interface EmbedListProps {
  embeds: EmbedInstance[]
  onDelete: (embedId: string) => void
  onRename: (embedId: string, name: string) => void
}

// UI components
export interface SliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  showValue?: boolean
}

export interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
}

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}
```

---

## Hook Return Types

```typescript
// types/hooks.ts

import type { Animation, AnimationParams, EmbedInstance, Profile, UserDashboardItem } from '.'
import type { User } from '@supabase/supabase-js'

export interface UseAuthReturn {
  user: User | null
  loading: boolean
}

export interface UseAnimationParamsReturn {
  params: AnimationParams
  activePreset: string | null
  updateParam: (key: string, value: any) => void
  applyPreset: (preset: { name: string; params: AnimationParams }) => void
  resetParams: () => void
}

export interface UseAnimationsReturn {
  animations: Animation[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export interface UseUserDashboardReturn {
  items: UserDashboardItem[]
  loading: boolean
  error: Error | null
  hasAccess: (animationId: string) => boolean
}

export interface UseEmbedsReturn {
  embeds: EmbedInstance[]
  loading: boolean
  createEmbed: (animationId: string, name: string, params: AnimationParams) => Promise<EmbedInstance>
  updateEmbed: (embedId: string, params: AnimationParams) => Promise<void>
  deleteEmbed: (embedId: string) => Promise<void>
}

export interface UseFavoritesReturn {
  favorites: string[]
  isFavorited: (animationId: string) => boolean
  toggleFavorite: (animationId: string) => Promise<void>
}
```

---

## API Types

```typescript
// types/api.ts

export interface APIError {
  message: string
  code: string
  statusCode: number
}

// Embed runtime validation response (from /api/embed/validate)
export interface EmbedValidationResponse {
  animationId: string
  params: Record<string, any>
  runtimeBundleUrl: string
}

// Stripe
export interface StripeSubscription {
  id: string
  customer: string
  status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing'
  current_period_start: number
  current_period_end: number
  metadata: {
    plan: 'monthly' | 'yearly'
  }
}
```

---

## Form Types

```typescript
// types/forms.ts

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  fullName: string
  acceptTerms: boolean
}

export interface CreateEmbedFormData {
  name: string
  animationId: string
}

export interface SearchFilters {
  query: string
  typeId: string | null
  tags: string[]
  performanceTier: 'lightweight' | 'standard' | 'heavy' | null
  sortBy: SortOption
}

export type SortOption = 'newest' | 'popular' | 'title_asc'
```

---

## Validation Schemas (Zod)

```typescript
// types/validation.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  fullName: z.string().min(2, 'Name required'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms' }),
  }),
})

export const createEmbedSchema = z.object({
  name: z.string().min(1, 'Name required').max(80, 'Too long'),
  animationId: z.string().uuid('Invalid animation'),
})

export const searchSchema = z.object({
  query: z.string().max(100),
  typeId: z.string().uuid().nullable(),
  tags: z.array(z.string()),
  performanceTier: z.enum(['lightweight', 'standard', 'heavy']).nullable(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type CreateEmbedFormData = z.infer<typeof createEmbedSchema>
```

---

## Constants

```typescript
// types/constants.ts

export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: 'monthly',
    name: 'Monthly',
    priceMonthly: 29,
    interval: 'month',
    features: [
      'Access to all animations',
      'Unlimited embed instances',
      'Real-time parameter updates',
      'All animation types',
      'Priority support',
    ],
  },
  YEARLY: {
    id: 'yearly',
    name: 'Yearly',
    priceMonthly: 20, // effective monthly
    priceYearly: 249,
    interval: 'year',
    features: [
      'Everything in Monthly',
      'Save ~30%',
      'Early access to new animations',
    ],
  },
} as const

export const ANIMATION_TYPE_LABELS: Record<string, string> = {
  liquid: 'Liquid',
  particles: 'Particles',
  '3d-object': '3D Object',
  svg: 'SVG',
  typography: 'Typography',
  scroll: 'Scroll',
}

export const PERFORMANCE_TIER_LABELS: Record<string, string> = {
  lightweight: 'Mobile-safe',
  standard: 'Standard',
  heavy: 'GPU-intensive',
}
```

---

## Database Types (Generated)

Generate from Supabase:

```bash
npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
```