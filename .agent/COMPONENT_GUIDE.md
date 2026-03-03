# Component Guide

## Architecture

LiquidMktplace components are organized around 3 core experiences: the **Marketplace** (discover), the **Viewer** (preview + customize), and the **Dashboard** (manage embeds).

## Directory Structure

```
/components
  /animation
    - AnimationViewer.tsx       # Three.js canvas + live preview
    - ParameterControls.tsx     # Auto-generated controls from params_schema
    - PresetSelector.tsx        # Apply presets
    - EmbedCodePanel.tsx        # Display embed script tag
    - AnimationTypeBadge.tsx    # Liquid / Particles / etc.
  /marketplace
    - AnimationCard.tsx         # Grid card with video preview
    - AnimationGrid.tsx         # Responsive grid layout
    - TypeFilter.tsx            # Filter by animation type
    - SearchBar.tsx             # Search input
  /dashboard
    - EmbedList.tsx             # User's configured embeds
    - EmbedItem.tsx             # Single embed with token + controls
    - SubscriptionStatus.tsx    # Plan status card
    - CreateEmbedModal.tsx      # New embed setup flow
  /layout
    - Header.tsx
    - Footer.tsx
    - Navigation.tsx
  /ui
    - Button.tsx
    - Input.tsx
    - Card.tsx
    - Badge.tsx
    - Modal.tsx
    - Slider.tsx
    - ColorPicker.tsx
    - Toggle.tsx
    - CopyButton.tsx
  /auth
    - LoginForm.tsx
    - SignupForm.tsx
    - AuthModal.tsx
  /checkout
    - PricingCard.tsx
    - CheckoutButton.tsx
```

---

## Core Components

### 1. AnimationViewer

The heart of the product. Renders the parametric animation in a Three.js canvas and reacts to parameter changes in real-time.

```typescript
// components/animation/AnimationViewer.tsx
import { useEffect, useRef } from 'react'
import type { Animation, AnimationParams } from '@/types'

interface AnimationViewerProps {
  animation: Animation
  params: AnimationParams
  className?: string
}

export function AnimationViewer({ animation, params, className = '' }: AnimationViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<any>(null)

  // Initialize engine on mount
  useEffect(() => {
    if (!canvasRef.current) return

    const engine = initAnimationEngine(canvasRef.current, animation)
    engineRef.current = engine

    return () => engine.dispose()
  }, [animation.id])

  // Update uniforms when params change — no re-render, just uniform update
  useEffect(() => {
    if (!engineRef.current) return
    engineRef.current.updateParams(params)
  }, [params])

  return (
    <div className={`relative bg-black rounded-2xl overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ aspectRatio: '16/9' }}
      />
    </div>
  )
}

// Animation engine factory — returns different engines based on animation type
function initAnimationEngine(canvas: HTMLCanvasElement, animation: Animation) {
  switch (animation.animation_types?.slug) {
    case 'liquid':
      return initShaderEngine(canvas, animation)
    case 'particles':
      return initParticleEngine(canvas, animation)
    case '3d-object':
      return initObjectEngine(canvas, animation)
    default:
      return initShaderEngine(canvas, animation)
  }
}
```

---

### 2. ParameterControls

Auto-generates UI controls from the animation's `params_schema`. No manual UI per animation.

```typescript
// components/animation/ParameterControls.tsx
import { Slider } from '@/components/ui/Slider'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { Toggle } from '@/components/ui/Toggle'
import type { ParamSchema, AnimationParams } from '@/types'

interface ParameterControlsProps {
  schema: ParamSchema[]
  params: AnimationParams
  onChange: (key: string, value: any) => void
}

export function ParameterControls({ schema, params, onChange }: ParameterControlsProps) {
  return (
    <div className="space-y-6">
      {schema.map((param) => (
        <div key={param.key}>
          <label className="block text-sm font-medium text-black mb-2">
            {param.label}
          </label>

          {param.type === 'float' && (
            <Slider
              min={param.min!}
              max={param.max!}
              step={param.step ?? 0.01}
              value={params[param.key] ?? param.default}
              onChange={(v) => onChange(param.key, v)}
            />
          )}

          {param.type === 'color' && (
            <ColorPicker
              value={params[param.key] ?? param.default}
              onChange={(v) => onChange(param.key, v)}
            />
          )}

          {param.type === 'boolean' && (
            <Toggle
              checked={params[param.key] ?? param.default}
              onChange={(v) => onChange(param.key, v)}
            />
          )}

          {param.type === 'select' && (
            <select
              value={params[param.key] ?? param.default}
              onChange={(e) => onChange(param.key, e.target.value)}
              className="w-full px-3 py-2 border border-grey-200 rounded-lg text-sm"
            >
              {param.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

### 3. PresetSelector

One-click application of curated parameter sets.

```typescript
// components/animation/PresetSelector.tsx
import type { Preset, AnimationParams } from '@/types'

interface PresetSelectorProps {
  presets: Preset[]
  activePreset: string | null
  onApply: (preset: Preset) => void
}

export function PresetSelector({ presets, activePreset, onApply }: PresetSelectorProps) {
  if (!presets.length) return null

  return (
    <div>
      <p className="text-xs font-medium text-grey-400 uppercase tracking-wider mb-3">
        Presets
      </p>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onApply(preset)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
              activePreset === preset.name
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-grey-200 hover:border-black'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

### 4. EmbedCodePanel

Shows the embed script tag and copy button after the user has configured their animation.

```typescript
// components/animation/EmbedCodePanel.tsx
import { CopyButton } from '@/components/ui/CopyButton'
import type { EmbedInstance } from '@/types'

interface EmbedCodePanelProps {
  embed: EmbedInstance
  animationSlug: string
}

export function EmbedCodePanel({ embed, animationSlug }: EmbedCodePanelProps) {
  const embedCode = `<div id="lm-animation"></div>
<script 
  src="${import.meta.env.VITE_CDN_BASE_URL}/embed.js"
  data-token="${embed.token}"
  data-animation="${animationSlug}"
></script>`

  return (
    <div className="bg-grey-50 border border-grey-100 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-grey-100">
        <span className="text-xs font-medium text-black uppercase tracking-wide">
          Embed Code
        </span>
        <CopyButton text={embedCode} />
      </div>
      <pre className="p-4 text-sm text-grey-800 overflow-x-auto">
        <code>{embedCode}</code>
      </pre>
    </div>
  )
}
```

---

### 5. AnimationCard

Marketplace grid card — shows a looping video preview on hover.

```typescript
// components/marketplace/AnimationCard.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimationTypeBadge } from './AnimationTypeBadge'
import type { Animation } from '@/types'

interface AnimationCardProps {
  animation: Animation
  hasAccess?: boolean
}

export function AnimationCard({ animation, hasAccess = false }: AnimationCardProps) {
  const [videoActive, setVideoActive] = useState(false)

  return (
    <Link to={`/animations/${animation.slug}`}>
      <div
        className="group bg-white border border-grey-100 rounded-2xl overflow-hidden hover:border-grey-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        onMouseEnter={() => setVideoActive(true)}
        onMouseLeave={() => setVideoActive(false)}
      >
        {/* Preview */}
        <div className="aspect-video bg-black overflow-hidden relative">
          {animation.preview_image_url && (
            <img
              src={animation.preview_image_url}
              alt={animation.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                videoActive && animation.preview_video_url ? 'opacity-0' : 'opacity-100'
              }`}
            />
          )}
          {videoActive && animation.preview_video_url && (
            <video
              src={animation.preview_video_url}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-black leading-tight">
              {animation.title}
            </h3>
            {animation.animation_types && (
              <AnimationTypebadge type={animation.animation_types.slug} />
            )}
          </div>

          <p className="text-sm text-grey-400 line-clamp-2">
            {animation.short_description || animation.description}
          </p>

          <div className="mt-4 flex items-center justify-between">
            {hasAccess ? (
              <span className="text-sm font-medium text-black">In Library ✓</span>
            ) : (
              <span className="text-sm font-medium text-grey-400">Subscribe to access</span>
            )}
            <span className={`text-xs px-2 py-1 rounded-full ${
              animation.performance_tier === 'lightweight'
                ? 'bg-grey-50 text-grey-400'
                : animation.performance_tier === 'heavy'
                ? 'bg-grey-100 text-black'
                : 'bg-grey-50 text-grey-400'
            }`}>
              {animation.performance_tier}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

---

### 6. EmbedList (Dashboard)

Shows all the user's configured embed instances.

```typescript
// components/dashboard/EmbedList.tsx
import { EmbedItem } from './EmbedItem'
import type { EmbedInstance } from '@/types'

interface EmbedListProps {
  embeds: EmbedInstance[]
  onDelete: (embedId: string) => void
  onRename: (embedId: string, name: string) => void
}

export function EmbedList({ embeds, onDelete, onRename }: EmbedListProps) {
  if (!embeds.length) {
    return (
      <div className="text-center py-16 border border-dashed border-grey-200 rounded-2xl">
        <p className="text-grey-400 text-lg mb-2">No embeds yet</p>
        <p className="text-grey-300 text-sm">Configure an animation to get your first embed code</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {embeds.map((embed) => (
        <EmbedItem
          key={embed.id}
          embed={embed}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  )
}
```

---

### 7. Slider (UI Primitive)

```typescript
// components/ui/Slider.tsx
interface SliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  showValue?: boolean
}

export function Slider({ min, max, step = 0.01, value, onChange, showValue = true }: SliderProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 bg-grey-200 rounded-full appearance-none cursor-pointer accent-black"
      />
      {showValue && (
        <span className="text-sm font-mono text-grey-400 w-10 text-right">
          {value.toFixed(2)}
        </span>
      )}
    </div>
  )
}
```

---

### 8. CopyButton

```typescript
// components/ui/CopyButton.tsx
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  text: string
  label?: string
}

export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-black hover:bg-grey-100 rounded-lg transition-colors"
    >
      {copied ? (
        <><Check className="w-4 h-4" /> Copied</>
      ) : (
        <><Copy className="w-4 h-4" /> {label}</>
      )}
    </button>
  )
}
```

---

## Custom Hooks

### useAnimationParams

Manages parameter state for the live preview.

```typescript
// hooks/useAnimationParams.ts
import { useState, useCallback } from 'react'
import type { ParamSchema, AnimationParams } from '@/types'

export function useAnimationParams(schema: ParamSchema[]) {
  const defaultParams = schema.reduce((acc, param) => {
    acc[param.key] = param.default
    return acc
  }, {} as AnimationParams)

  const [params, setParams] = useState<AnimationParams>(defaultParams)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const updateParam = useCallback((key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }))
    setActivePreset(null) // Clear preset when manually editing
  }, [])

  const applyPreset = useCallback((preset: { name: string; params: AnimationParams }) => {
    setParams(prev => ({ ...prev, ...preset.params }))
    setActivePreset(preset.name)
  }, [])

  const resetParams = useCallback(() => {
    setParams(defaultParams)
    setActivePreset(null)
  }, [defaultParams])

  return { params, activePreset, updateParam, applyPreset, resetParams }
}
```

### useAuth

```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

### useAnimations

```typescript
// hooks/useAnimations.ts
import { useEffect, useState } from 'react'
import { fetchAnimations } from '@/lib/supabase/animations'
import type { Animation } from '@/types'

export function useAnimations(filters?: { typeId?: string; search?: string }) {
  const [animations, setAnimations] = useState<Animation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    load()
  }, [filters?.typeId, filters?.search])

  async function load() {
    try {
      setLoading(true)
      const data = await fetchAnimations(filters)
      setAnimations(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { animations, loading, error, refetch: load }
}
```