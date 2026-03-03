# LiquidMktplace

> Parametric 3D animation SaaS — embed stunning animations on any website, customized in real-time

## Overview

LiquidMktplace is a SaaS platform where developers discover, customize, and embed premium 3D animations on their websites via a simple script tag. Animations are parametric — every parameter is tunable from the dashboard, and the embed updates instantly. No file downloads, no vendor lock-in to a specific framework.

The core differentiator: each animation is not a static asset but a **parametric visual system** — one animation generates thousands of visual variations through parameter tuning.

## Key Features

- **Parametric Animation Library** — Curated animations across 6 types, each with fully exposed parameters
- **Live Dashboard Customization** — Tune colors, speed, physics, noise, geometry in real-time preview
- **One-line Embed** — Single script tag integration, works on any website or framework
- **SaaS Token System** — Access controlled via tokens tied to subscriptions; revocable instantly
- **Multi-type Support** — Fluid/liquid shaders, particles, 3D objects, SVG/2D, typography, scroll transitions
- **Zero File Delivery** — Shaders and logic never leave the server; protected by design

## Animation Types Supported

| Type | Technology | Examples |
|------|-----------|---------|
| Liquid / Fluid | GLSL Shaders | Lava, ocean, plasma, ink |
| Particles | Three.js Points | Constellation, dust, fire |
| 3D Objects | GLB/GLTF + Three.js | Rotating gems, morphing shapes |
| 2D / SVG | Canvas / SVG animation | Illustrated loaders, icons |
| Typography | WebGL / CSS | Liquid text, particle text |
| Scroll / Transitions | GSAP + WebGL | Parallax, page morphs |

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **3D Rendering**: Three.js (primary), GLSL shaders
- **Animation**: GSAP for scroll/transitions
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe (subscriptions)
- **Asset Storage**: Supabase Storage
- **Embed Runtime**: Vanilla JS bundle served from CDN

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  LiquidMktplace                     │
│                                                     │
│  ┌─────────────┐    ┌──────────────────────────┐   │
│  │  Marketing  │    │      Dashboard            │   │
│  │  Site       │    │  (customize & get embed)  │   │
│  │  (React)    │    │  (React)                  │   │
│  └─────────────┘    └──────────────────────────┘   │
│                              │                      │
│                    ┌─────────▼──────────┐           │
│                    │   Supabase         │           │
│                    │   Auth + DB        │           │
│                    │   + Storage        │           │
│                    └─────────┬──────────┘           │
│                              │                      │
│                    ┌─────────▼──────────┐           │
│                    │   Embed Runtime    │           │
│                    │   (CDN-served JS)  │           │
│                    │   Token-gated      │           │
│                    └────────────────────┘           │
│                              │                      │
│              Client websites embed via script tag   │
└─────────────────────────────────────────────────────┘
```

## Embed Integration (Client Side)

The client copies one line from their dashboard and pastes it on their site:

```html
<div id="lm-animation"></div>
<script 
  src="https://cdn.liquidmktplace.com/embed.js"
  data-token="tok_live_xxxxx"
  data-animation="lava-sphere"
></script>
```

That's it. Parameters configured in the dashboard are fetched at runtime. The shader never leaves the CDN.

## Design Philosophy

- **Minimalism First** — Black & white aesthetic, generous whitespace, premium feel
- **Developer-Centric** — Clean embed API, clear documentation, no magic
- **Performance by Default** — GPU-driven animations, no CPU simulation, 60fps target
- **Protection by Architecture** — SaaS model means shaders are never exposed

## Project Structure

```
/src
  /components
    /animation       # AnimationViewer, ParameterControls, PresetSelector
    /auth            # Login, Signup, AuthModal
    /dashboard       # LibraryGrid, EmbedCodePanel, SubscriptionStatus
    /layout          # Header, Footer, Navigation
    /ui              # Button, Input, Card, Badge, Modal
    /marketplace     # AnimationCard, AnimationGrid, CategoryFilter
  /pages
    /landing         # Homepage
    /marketplace     # Browse animations
    /animation       # Animation detail + live preview
    /dashboard       # User dashboard (my animations, embed codes)
    /pricing         # Subscription plans
  /lib
    /supabase        # Supabase client + queries
    /stripe          # Stripe integration
    /embed           # Embed token management
    /animation       # Animation engine (Three.js wrapper)
  /hooks             # useAuth, useAnimations, useParameters
  /types             # TypeScript definitions
  /utils             # Helpers
```

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project
- Stripe account

### Environment Variables
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_CDN_BASE_URL=
```

### Installation
```bash
npm install
npm run dev
```

## Documentation

- [Design System](./DESIGN_SYSTEM.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [API Integration](./API_INTEGRATION.md)
- [Component Guide](./COMPONENT_GUIDE.md)
- [User Flows](./USER_FLOWS.md)
- [Types](./TYPES.md)
- [Visual Assets Guide](./VISUAL_ASSETS_GUIDE.md)
- [Roadmap](./ROADMAP.md)

## Core User Flows

1. **Discover** — Browse parametric animations with live preview
2. **Customize** — Tune parameters in dashboard, see changes instantly
3. **Subscribe** — Choose monthly or yearly plan
4. **Embed** — Copy one script tag, paste on site
5. **Manage** — Update parameters anytime; embed reflects changes live