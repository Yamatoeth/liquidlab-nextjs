# User Flows & Page Wireframes

## User Personas

### 1. The Frontend Developer (Primary)
- **Goal**: Add a premium animated background or hero element to a client site
- **Pain Points**: Building custom WebGL animations takes weeks; existing libraries are generic
- **Behavior**: Browses by animation type, tests parameters, wants clean embed code

### 2. The Creative Developer
- **Goal**: Push visual quality of personal projects or portfolio
- **Pain Points**: Shader knowledge is a barrier; wants results fast
- **Behavior**: Explores presets first, then tweaks manually

### 3. The Agency Developer
- **Goal**: Reuse across multiple client projects efficiently
- **Pain Points**: Needs multiple embed instances with different configs
- **Behavior**: Subscribes once, creates many embeds, manages from dashboard

---

## Core User Flows

### Flow 1: Discovery → Subscription → First Embed

```
1. Land on homepage
   ↓
2. See live animation previews in hero
   ↓
3. Browse marketplace → hover cards to see animations play
   ↓
4. Click animation → full preview page
   ↓
5. Adjust parameters → see live result
   ↓
6. "Subscribe to use this" → pricing page
   ↓
7. Stripe checkout
   ↓
8. Back to animation detail page (now with access)
   ↓
9. "Create Embed" → name the embed
   ↓
10. Configure parameters → copy script tag
    ↓
11. Paste on their site
```

### Flow 2: Subscriber → New Embed

```
1. Sign in
   ↓
2. Dashboard → "Browse All Animations"
   ↓
3. Find animation
   ↓
4. Click "Create Embed"
   ↓
5. Name + configure
   ↓
6. Get embed code
```

### Flow 3: Subscriber → Update Existing Embed

```
1. Sign in → Dashboard
   ↓
2. Find embed in list
   ↓
3. "Edit Parameters"
   ↓
4. Adjust in live preview
   ↓
5. Save → embed on their site updates automatically
   (no need to touch their site HTML)
```

---

## Page Wireframes

### 1. Landing Page

```
┌────────────────────────────────────────────────────────┐
│  [Logo]                         [Pricing]  [Sign In]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│         HERO — Full viewport                           │
│         Live animation playing in background           │
│                                                        │
│    "Parametric 3D Animations                           │
│     for your website"                                  │
│                                                        │
│    [Browse Animations]  [See Pricing]                  │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│   HOW IT WORKS (3 steps)                               │
│   [Browse] → [Customize] → [Embed]                     │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│   FEATURED ANIMATIONS                                  │
│   [Card] [Card] [Card]                                 │
│   (video plays on hover)                               │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│   ANIMATION TYPES                                      │
│   [Liquid] [Particles] [3D] [SVG] [Type] [Scroll]     │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│   EMBED DEMO                                           │
│   Show the one-line script tag                         │
│   "This is all you need"                               │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│   PRICING PREVIEW                                      │
│   [Monthly]  [Yearly — save 30%]                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 2. Marketplace Page

```
┌────────────────────────────────────────────────────────┐
│  [Logo]   [Search___________]          [Dashboard]    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  TYPE FILTER BAR                                       │
│  [All] [Liquid] [Particles] [3D] [SVG] [Type] [Scroll]│
│                                                        │
│  SORT: [Newest ▾]    PERF: [All ▾]                    │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ANIMATION GRID (3 columns)                            │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ ▶ video  │  │ ▶ video  │  │ ▶ video  │             │
│  │ on hover │  │ on hover │  │ on hover │             │
│  │          │  │          │  │          │             │
│  │ Title    │  │ Title    │  │ Title    │             │
│  │ [Liquid] │  │ [Parts]  │  │ [3D]     │             │
│  │ $$ / sub │  │ In lib ✓ │  │ $$ / sub │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                        │
│  [Load more]                                           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 3. Animation Detail Page

```
┌────────────────────────────────────────────────────────┐
│  [← Marketplace]                    [Dashboard]       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────┐  ┌────────────────────────┐ │
│  │                      │  │  Lava Sphere           │ │
│  │   LIVE PREVIEW       │  │  [Liquid]              │ │
│  │   (Three.js canvas)  │  │                        │ │
│  │                      │  │  Mesmerizing fluid...  │ │
│  │   Real-time update   │  │                        │ │
│  │   as params change   │  │  PRESETS               │ │
│  │                      │  │  [Lava][Ocean][Plasma] │ │
│  └──────────────────────┘  │                        │ │
│                            │  PARAMETERS            │ │
│                            │  Speed      [━━●━━]    │ │
│                            │  Turbulence [━●━━━]    │ │
│                            │  Noise      [━━━●━]    │ │
│                            │  Color A    [████]     │ │
│                            │  Color B    [████]     │ │
│                            │  Glow       [ON ]      │ │
│                            │                        │ │
│                            │  [Reset]               │ │
│                            │                        │ │
│                            │  ──────────────────    │ │
│                            │  [Create Embed ↗]      │ │
│                            │  (subscribers only)    │ │
│                            │                        │ │
│                            │  or [Subscribe →]      │ │
│                            └────────────────────────┘ │
│                                                        │
│  DETAILS                                               │
│  Type: Liquid   Perf: Standard   Complexity: Moderate  │
│  Tags: fluid, lava, shader                             │
│                                                        │
│  RELATED ANIMATIONS                                    │
│  [Card] [Card] [Card]                                  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 4. Create Embed Flow (Modal)

```
┌──────────────────────────────────────┐
│  Create Embed                     ✕  │
│  ─────────────────────────────────   │
│                                      │
│  Name                                │
│  [Hero Animation_____________]       │
│                                      │
│  Your current parameters will        │
│  be saved to this embed.             │
│                                      │
│  Speed: 1.2 / Turbulence: 0.6        │
│  Color A: #ff4400 / Glow: ON         │
│                                      │
│  [Cancel]          [Create Embed]    │
└──────────────────────────────────────┘

↓ After creation:

┌──────────────────────────────────────┐
│  Embed Created ✓                  ✕  │
│  ─────────────────────────────────   │
│                                      │
│  EMBED CODE                [Copy]    │
│  ─────────────────────────────────   │
│  <div id="lm-animation"></div>       │
│  <script                             │
│    src="cdn.../embed.js"             │
│    data-token="tok_live_xxx"         │
│    data-animation="lava-sphere"      │
│  ></script>                          │
│                                      │
│  Paste this anywhere on your site.   │
│                                      │
│  [Go to Dashboard]   [Embed Another] │
└──────────────────────────────────────┘
```

---

### 5. Dashboard

```
┌────────────────────────────────────────────────────────┐
│  [Logo]                               [Account ▾]     │
│  My Dashboard                                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Subscription: Active — Monthly                  │  │
│  │ Renews: March 25, 2026    [Manage]              │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  MY ANIMATIONS  ──────────────────  [Browse More →]   │
│                                                        │
│  ┌────────┐  ┌────────┐  ┌────────┐                   │
│  │preview │  │preview │  │preview │                   │
│  │Lava    │  │Cosmic  │  │Ink Drop│                   │
│  │2 embeds│  │0 embeds│  │1 embed │                   │
│  │[Open]  │  │[Open]  │  │[Open]  │                   │
│  └────────┘  └────────┘  └────────┘                   │
│                                                        │
│  MY EMBEDS  ─────────────────────────────────────────  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Hero Animation          Lava Sphere             │  │
│  │ tok_live_xxxxx...       Active ●                │  │
│  │ Last loaded: 2h ago     [Edit] [Copy] [Delete]  │  │
│  └─────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────┐  │
│  │ About Page BG           Ink Drop                │  │
│  │ tok_live_yyyyy...       Active ●                │  │
│  │ Last loaded: 5d ago     [Edit] [Copy] [Delete]  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 6. Edit Embed (inline in dashboard)

When user clicks "Edit" on an embed:

```
Navigates to: /dashboard/embeds/:embedId

┌────────────────────────────────────────────────────────┐
│  [← Dashboard]   Hero Animation                        │
│                  Lava Sphere                           │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────────────────────┐  ┌──────────────────────────┐  │
│  │                    │  │ PARAMETERS               │  │
│  │  LIVE PREVIEW      │  │                          │  │
│  │                    │  │ [Controls auto-gen]      │  │
│  │  Changes reflect   │  │                          │  │
│  │  here instantly    │  │ PRESETS                  │  │
│  │                    │  │ [Lava][Ocean][Plasma]    │  │
│  └────────────────────┘  │                          │  │
│                          │ [Reset to saved]         │  │
│                          │                          │  │
│                          │ [Save Changes]           │  │
│                          └──────────────────────────┘  │
│                                                        │
│  EMBED CODE                              [Copy]        │
│  ────────────────────────────────────────────────────  │
│  <div id="lm-animation"></div>                         │
│  <script src="..." data-token="tok_live_xxx"></script> │
│                                                        │
│  ⚠ Your embed on live sites updates automatically     │
│    when you save — no need to change the HTML.         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 7. Pricing Page

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│         Unlock all animations                          │
│                                                        │
│  ┌─────────────────┐    ┌────────────────────────┐    │
│  │   MONTHLY       │    │   YEARLY    [Save 30%] │    │
│  │                 │    │                        │    │
│  │   $29 / month   │    │   $249 / year          │    │
│  │                 │    │   ($20/mo effective)   │    │
│  │  ✓ All anim.    │    │  ✓ All anim.           │    │
│  │  ✓ Unlim embed  │    │  ✓ Unlim embed         │    │
│  │  ✓ Realtime     │    │  ✓ Realtime            │    │
│  │  ✓ Support      │    │  ✓ Support             │    │
│  │                 │    │  ✓ Early access        │    │
│  │  [Subscribe]    │    │  [Subscribe]           │    │
│  └─────────────────┘    └────────────────────────┘    │
│                                                        │
│  Questions? hello@liquidmktplace.com                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Mobile Considerations

The marketplace and animation detail pages adapt to mobile naturally. Key considerations specific to this product:

**Animation Viewer on mobile** — performance tier matters. `heavy` animations should show a warning on mobile: "This animation is GPU-intensive. May affect performance on mobile devices."

**Parameter controls on mobile** — stack below the viewer in a collapsible drawer. Sliders need minimum 44px touch target height.

**Embed code** — always shows as a copyable code block, never editable inline.

---

## Error States

**Subscription expired** — Embeds on client sites return a `403`. The canvas element stays but renders nothing. No error shown to end users — just blank.

**Invalid token** — Same as above. Silent fail.

**Animation failed to load** — Viewer shows a minimal fallback with a refresh button. Error is logged to `embed_events`.

**WebGL not supported** — Detect on viewer init, show a static preview image fallback with a notice.