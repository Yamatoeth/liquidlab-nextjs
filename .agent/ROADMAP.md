# Product Roadmap

## Overview

Development is split into focused phases. The priority is getting a working end-to-end SaaS embed flow live as fast as possible, then expanding the animation library and polish.

---

## Phase 1 — Foundation & First Animation
**Timeline: Weeks 1–3**
**Goal: One animation working, embedded, gated by subscription**

### Infrastructure
- [X] Supabase project setup (DB, Auth, Storage)
- [ ] Stripe products created (monthly + yearly)
- [ ] CDN setup for embed runtime delivery
- [X] React app scaffolded (Next + TypeScript + Tailwind)

### Core Feature: One working embed
- [X] Build first animation (liquid/fluid shader — the flagship)
- [ ] Embed runtime (`embed.js`) — loads animation via script tag
- [ ] Token validation endpoint (`/api/embed/validate`)
- [ ] Embed instance creation in DB
- [ ] Manual test: script tag on an external HTML page

### Auth
- [X] Sign up / Sign in / Sign out
- [X] Profile creation

### Success Criteria
A subscriber can paste a script tag on any HTML page and see the animation playing. If their subscription lapses, it stops.

---

## Phase 2 — Parametric System & Marketplace
**Timeline: Weeks 4–6**
**Goal: Animations are customizable; marketplace is browsable**

### Parametric Engine
- [X] `params_schema` standard defined and documented
- [X] `ParameterControls` component (auto-generates UI from schema)
- [X] `AnimationViewer` component (Three.js canvas + uniform updates)
- [X] `PresetSelector` component
- [ ] Live preview: param change → uniform update → no re-render

### Marketplace
- [X] Animation listing page with type filter
- [X] Animation card with video hover preview
- [X] Animation detail page (viewer + controls + presets)
- [X] Search

### Subscription Gate
- [ ] Stripe subscription checkout
- [ ] Webhook handler (grant/revoke access)
- [ ] Access check on animation detail page

### Success Criteria
A visitor can browse animations, adjust parameters live without signing in (preview mode), then subscribe to get embed access.

---

## Phase 3 — Dashboard & Embed Management
**Timeline: Weeks 7–9**
**Goal: Users can manage multiple embeds from a clean dashboard**

### Dashboard
- [ ] "My Animations" — library of all accessible animations
- [ ] "My Embeds" — list of all configured embed instances
- [ ] Create embed flow (name + initial params → get token)
- [ ] Edit embed params (update params → embed live-updates on their site)
- [ ] Delete / deactivate embed token
- [ ] Copy embed code panel
- [ ] Subscription status card + Stripe customer portal link

### Embed System
- [ ] Multiple embeds per animation per user
- [ ] Embed load tracking (`embed_events` + `load_count`)
- [ ] Token management (active/inactive)

### Success Criteria
A user can have 5 different embeds of the same animation with 5 different parameter sets, all manageable from one dashboard.

---

## Phase 4 — Animation Library Expansion
**Timeline: Weeks 10–14**
**Goal: Cover all 6 animation types with at least 2-3 animations each**

### Animations to Build

**Liquid / Fluid (GLSL)**
- [ ] Lava Sphere (flagship — Phase 1)
- [ ] Ocean Surface
- [ ] Ink Drop
- [ ] Plasma Field

**Particles**
- [ ] Cosmic Dust
- [ ] Fire Emitter
- [ ] Constellation

**3D Objects (GLB/GLTF)**
- [ ] Morphing Gem
- [ ] Floating Torus
- [ ] Crystal Cluster

**SVG / 2D**
- [ ] Animated Blob
- [ ] SVG Path Morph
- [ ] Illustrated Loader

**Typography**
- [ ] Liquid Text
- [ ] Particle Text
- [ ] Glitch Text

**Scroll / Transitions**
- [ ] Parallax Depth
- [ ] Page Morph Transition
- [ ] Scroll-driven Reveal

### Technical
- [ ] Per-animation runtime bundles (tree-shaken, minimal size)
- [ ] Performance tier tagging (lightweight / standard / heavy)
- [ ] Mobile-safe detection + fallback for heavy animations

---

## Phase 5 — Preview Video Pipeline
**Timeline: Week 12–13 (parallel with Phase 4)**
**Goal: Every animation has a looping MP4 preview**

- [ ] Puppeteer capture script
- [ ] FFmpeg conversion pipeline
- [ ] Automated upload to Supabase Storage
- [ ] Thumbnail generation
- [ ] Per-preset video capture for featured presets

---

## Phase 6 — Performance & Polish
**Timeline: Weeks 15–17**
**Goal: Production-ready quality**

### Performance
- [ ] Embed runtime bundle size < 80KB (gzipped)
- [ ] Animation load time < 1.5s on broadband
- [ ] 60fps target on standard GPU
- [ ] WebGL not supported → graceful fallback (static image)
- [ ] Mobile performance warnings for heavy animations

### UX Polish
- [ ] Loading states (skeleton screens, canvas shimmer)
- [ ] Error states (WebGL fail, token expired, network error)
- [ ] Smooth preset transitions (param interpolation)
- [ ] Responsive animation viewer (maintains aspect ratio on all screen sizes)
- [ ] Onboarding flow for new subscribers (first embed guidance)

### SEO
- [ ] Meta tags per animation page
- [ ] OG image per animation (thumbnail)
- [ ] Sitemap

---

## Phase 7 — Growth Features
**Timeline: Weeks 18–22**

- [ ] Email marketing (welcome series, new animation alerts) via Resend
- [ ] Affiliate/referral system
- [ ] Analytics dashboard for users (embed loads over time)
- [ ] "Recently Added" and "Popular" sections on marketplace
- [ ] Featured animations rotating homepage slot
- [ ] Tags/collections ("Dark Mode", "Minimal", "Colorful")
- [ ] Embed performance analytics (load time per embed)

---

## Phase 8 — Advanced Embed Features
**Timeline: Weeks 23+**

- [ ] Responsive embed sizing (user sets width/height or aspect ratio)
- [ ] Embed events webhook (user's server gets notified on load)
- [ ] Optional: iframe embed mode (for sandboxed environments)
- [ ] Optional: npm package for React/Vue/Svelte
- [ ] Optional: Multiple embed instances of same animation, same page, different params

---

## Future Considerations

### Team Plans
Allow agencies to manage animations across multiple client projects under one billing account.

### Custom Animations (Commission)
Users request a custom animation built to spec. One-off commission + recurring embed fee.

### Animation Builder
A no-code interface to compose parametric animations by combining shaders and geometry. Ambitious — Phase 9+.

### Shopify Liquid Snippets
Original product idea — add as a separate category once animation SaaS is stable. Same infrastructure (Supabase, Stripe, embed system).

---

## Technical Constraints (Non-negotiable)

- Shaders never delivered directly to client browsers (always served runtime from CDN, logic encapsulated)
- All animations GPU-driven — no CPU simulation, no physics engines
- Mesh complexity < 100k vertices
- Texture assets < 4MB per animation
- Embed runtime bundle < 100KB gzipped (excluding Three.js, loaded separately if needed)

---

## KPIs

| Metric | Target (Month 6) |
|--------|-----------------|
| MRR | $5,000 |
| Active subscribers | 150+ |
| Total embed instances | 400+ |
| Animation library size | 15+ |
| Embed load time (p95) | < 2s |
| Churn rate | < 6%/month |
| Conversion (free preview → subscribe) | 4%+ |

---

## Decision Log

**SaaS embed over file download**
Rationale: Shaders protected by architecture, recurring revenue, parameter updates don't require re-download.

**Script tag over iframe**
Rationale: Enables scroll-driven animations, parallax, full page interaction. iframe creates hard constraints.

**Dashboard-side customization only**
Rationale: Simpler embed API (just a token), parameters fetched server-side, no exposure in client HTML.

**Three.js as primary renderer**
Rationale: Best ecosystem, good GLTF support, large community, shader-friendly. GSAP for scroll animations.

**Supabase over custom backend**
Rationale: RLS for security, realtime for live updates, storage for assets. Speed to market.