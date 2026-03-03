# Design System

## Visual Identity

LiquidMktplace embodies premium minimalism — a strict black and white aesthetic that lets the animations themselves be the visual spectacle. Every UI decision gets out of the way of the content.

## Color Palette

```css
/* Core */
--black: #000000;      /* Primary text, buttons, headers */
--white: #FFFFFF;      /* Backgrounds, cards */

/* Grey scale */
--grey-50: #FAFAFA;    /* Subtle backgrounds */
--grey-100: #F5F5F5;   /* Light borders */
--grey-200: #E5E5E5;   /* Medium borders */
--grey-300: #D4D4D4;   /* Disabled states */
--grey-400: #A3A3A3;   /* Secondary text */
--grey-800: #262626;   /* Hover on dark elements */
```

**Philosophy**: The UI is monochrome. Color lives in the animations. Never compete with the content.

## Typography

**Primary**: Inter, system-ui, -apple-system  
**Code**: 'JetBrains Mono', 'Fira Code', monospace

```css
--text-6xl: 3.75rem;   /* Hero headlines */
--text-5xl: 3rem;      /* Page headers */
--text-4xl: 2.25rem;   /* Section headers */
--text-3xl: 1.875rem;  /* Card titles */
--text-2xl: 1.5rem;    /* Subsections */
--text-xl: 1.25rem;    /* Component headers */
--text-lg: 1.125rem;   /* Emphasized body */
--text-base: 1rem;     /* Primary body */
--text-sm: 0.875rem;   /* Secondary text */
--text-xs: 0.75rem;    /* Labels, badges */
```

**Weights**: 400 body · 500 emphasis · 600 subheadings · 700 headings/CTAs

## Spacing (8px grid)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

## Border Radius

```css
--radius-sm: 0.375rem;   /* 6px — badges, small elements */
--radius-md: 0.5rem;     /* 8px — buttons, inputs */
--radius-lg: 0.75rem;    /* 12px — cards */
--radius-xl: 1rem;       /* 16px — large cards */
--radius-2xl: 1.5rem;    /* 24px — animation viewer, hero */
--radius-full: 9999px;   /* Pills */
```

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
```

---

## Key Components

### Animation Viewer

The canvas container is the hero element of every page that shows an animation.

```css
.animation-viewer {
  background: #000000;       /* Always black background */
  border-radius: 1.5rem;     /* 24px — prominent rounded */
  overflow: hidden;
  aspect-ratio: 16/9;
  position: relative;
}

/* Loading state — pulsing dark */
.animation-viewer--loading {
  background: #0a0a0a;
  animation: pulse 2s ease-in-out infinite;
}
```

### Animation Card (Marketplace)

```css
.animation-card {
  background: #FFFFFF;
  border: 1px solid #F5F5F5;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.animation-card:hover {
  border-color: #D4D4D4;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  transform: translateY(-4px);
}

/* Preview area — always dark to show animations properly */
.animation-card__preview {
  aspect-ratio: 16/9;
  background: #000000;
  overflow: hidden;
}
```

### Parameter Controls

Controls should feel precise and minimal — not playful. This is a developer tool.

```css
/* Slider track */
input[type="range"] {
  height: 2px;
  background: #E5E5E5;
  border-radius: 9999px;
  appearance: none;
  cursor: pointer;
}

/* Slider thumb */
input[type="range"]::-webkit-slider-thumb {
  width: 16px;
  height: 16px;
  background: #000000;
  border-radius: 50%;
  appearance: none;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
```

### Embed Code Block

```css
.embed-code {
  background: #FAFAFA;
  border: 1px solid #F5F5F5;
  border-radius: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #262626;
  padding: 1.25rem;
  overflow-x: auto;
  white-space: pre;
}
```

### Buttons

```css
/* Primary */
.btn-primary {
  background: #000000;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s;
}
.btn-primary:hover { background: #262626; }
.btn-primary:active { transform: scale(0.98); }

/* Secondary */
.btn-secondary {
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #E5E5E5;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
}
.btn-secondary:hover { background: #FAFAFA; }

/* Ghost */
.btn-ghost {
  background: transparent;
  color: #000000;
  padding: 12px 24px;
}
.btn-ghost:hover { background: #F5F5F5; }
```

### Inputs

```css
.input {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #000000;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.08);
}
```

### Badges

```css
/* Animation type badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #F5F5F5;
  color: #000000;
}

/* Performance tier variants */
.badge--lightweight { background: #F0FDF4; color: #166534; }
.badge--standard   { background: #F5F5F5; color: #000000; }
.badge--heavy      { background: #FEF2F2; color: #991B1B; }
```

---

## Layout

```css
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

**Animation Detail Layout**: 60/40 split (viewer left, controls right) on desktop. Stacks vertically on mobile.

**Marketplace Grid**: 3 columns desktop · 2 tablet · 1 mobile · 24px gap.

**Dashboard Grid**: 3 columns for animation library cards · Single column for embed list.

---

## Animation (UI Transitions)

```css
/* Standard */
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

/* Smooth */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

**Card hover**: `translateY(-4px)` + shadow increase  
**Button active**: `scale(0.98)`  
**Parameter slider thumb**: `scale(1.2)` on hover

---

## Specific UX Rules

**Animation previews in cards are always video** (autoplay on hover, muted, loop). Static image is fallback only.

**The animation viewer background is always `#000000`**. Never white. Animations are designed against dark.

**Parameter controls sidebar** has no title or header — just the controls. Minimalism.

**Embed code is never editable** inline — it's always a read-only code block with a copy button.

**Performance tier badge** is always visible on cards and detail pages. Developers need to know GPU requirements.

---

## Accessibility

- Focus: `outline: 2px solid #000000; outline-offset: 2px;`
- Touch targets: minimum 44×44px
- Contrast ratios: 4.5:1 for normal text, 3:1 for large
- Alt text on all preview images
- Canvas elements get `aria-label` describing the animation