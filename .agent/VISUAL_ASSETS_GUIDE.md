# Visual Assets Guide

## Overview

LiquidMktplace has two visual asset needs: **animation previews** (showing what each parametric animation looks like) and **marketing assets** (brand, landing page, social). Since the product *is* the animations, the previews are the most critical asset — they directly drive conversion.

---

## Asset Types

### 1. Animation Previews (Critical)

**Purpose**: Show the animation in motion. Static screenshots are nearly useless for this product — video is mandatory.

| Asset | Specs | Purpose |
|-------|-------|---------|
| `preview.mp4` | 1200×675px, 5-10s, loop, muted, <3MB | Card hover preview |
| `preview-thumbnail.jpg` | 1200×675px, <150KB | Static fallback + OG image |
| `preset-{name}.mp4` | 800×450px, 3-5s, <2MB | Per-preset preview (optional) |

**Naming convention:**
```
animations/{slug}/preview.mp4
animations/{slug}/preview-thumbnail.jpg
animations/{slug}/preset-lava.mp4
animations/{slug}/preset-ocean.mp4
```

---

### 2. Marketing Assets

| Asset | Specs | Purpose |
|-------|-------|---------|
| `hero-bg.mp4` | Full viewport, seamless loop | Landing page hero background |
| `og-image.jpg` | 1200×630px | Open Graph / social sharing |
| `type-{slug}.jpg` | 1920×400px | Animation type category header |

---

## Preview Video Generation

### Method: Headless Browser + Three.js

The best approach is capturing directly from the animation runtime — what you see is exactly what the buyer gets.

```
scripts/
  capture-preview.js     # Main capture script
  animation-template.html # Minimal HTML shell for rendering
  upload-previews.js     # Upload to Supabase Storage
```

### capture-preview.js

```javascript
const puppeteer = require('puppeteer')
const { createClient } = require('@supabase/supabase-js')
const path = require('path')
const fs = require('fs').promises
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function captureAnimationPreview(slug, options = {}) {
  const {
    duration = 6000,      // ms to record
    fps = 30,
    width = 1200,
    height = 675,
    preset = null,        // capture a specific preset
    debug = false,
  } = options

  console.log(`🎬 Capturing: ${slug}${preset ? ` (${preset})` : ''}`)

  // Fetch animation from DB
  const { data: animation, error } = await supabase
    .from('animations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !animation) {
    throw new Error(`Animation not found: ${slug}`)
  }

  const browser = await puppeteer.launch({
    headless: !debug,
    args: [
      '--no-sandbox',
      '--enable-webgl',
      '--use-gl=swiftshader',  // Software WebGL for headless
      '--disable-setuid-sandbox',
    ],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width, height, deviceScaleFactor: 1 })

    // Build render HTML
    const params = preset
      ? animation.presets.find(p => p.name === preset)?.params ?? {}
      : animation.presets[0]?.params ?? {}

    const html = buildRenderHTML(animation, params)
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Wait for animation to initialize
    await page.waitForTimeout(1500)

    // Capture frames
    const outputDir = path.join('./captures', slug)
    await fs.mkdir(outputDir, { recursive: true })

    const frameCount = Math.floor((duration / 1000) * fps)
    const frameDelay = 1000 / fps

    console.log(`  📸 Capturing ${frameCount} frames...`)

    for (let i = 0; i < frameCount; i++) {
      await page.screenshot({
        path: path.join(outputDir, `frame-${String(i).padStart(4, '0')}.png`),
        clip: { x: 0, y: 0, width, height },
      })
      await page.waitForTimeout(frameDelay)
    }

    console.log('  ✅ Frames captured')
    return outputDir

  } finally {
    await browser.close()
  }
}

function buildRenderHTML(animation, params) {
  const paramsJson = JSON.stringify(params)
  const schemaJson = JSON.stringify(animation.params_schema)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; overflow: hidden; }
    canvas { width: 100vw; height: 100vh; display: block; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>
    window.ANIMATION_PARAMS = ${paramsJson};
    window.ANIMATION_SCHEMA = ${schemaJson};
    window.ANIMATION_TYPE = "${animation.animation_types?.slug || 'liquid'}";
  </script>
  <script src="${animation.runtime_bundle_url}"></script>
</body>
</html>
  `.trim()
}

module.exports = { captureAnimationPreview }
```

### Convert Frames to MP4

```bash
# Requires ffmpeg
ffmpeg -framerate 30 -i captures/{slug}/frame-%04d.png \
  -c:v libx264 -pix_fmt yuv420p \
  -movflags +faststart \
  -crf 23 \
  output/{slug}-preview.mp4
```

### Capture Thumbnail

```javascript
async function captureThumbnail(slug, page) {
  // Capture single frame at t=2s (animation usually "interesting" by then)
  await page.waitForTimeout(2000)
  
  const outputPath = `./captures/${slug}/thumbnail.jpg`
  await page.screenshot({
    path: outputPath,
    type: 'jpeg',
    quality: 90,
    clip: { x: 0, y: 0, width: 1200, height: 675 },
  })
  
  return outputPath
}
```

---

## Upload to Supabase Storage

```javascript
// scripts/upload-previews.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function uploadAnimationAssets(slug) {
  const captureDir = path.join('./captures', slug)
  const outputDir = path.join('./output', slug)

  // Upload preview video
  const videoPath = path.join(outputDir, 'preview.mp4')
  const videoBuffer = await fs.readFile(videoPath)

  const { error: videoError } = await supabase.storage
    .from('animation-assets')
    .upload(`animations/${slug}/preview.mp4`, videoBuffer, {
      contentType: 'video/mp4',
      upsert: true,
    })

  if (videoError) throw videoError

  // Upload thumbnail
  const thumbPath = path.join(captureDir, 'thumbnail.jpg')
  const thumbBuffer = await fs.readFile(thumbPath)

  const { error: thumbError } = await supabase.storage
    .from('animation-assets')
    .upload(`animations/${slug}/preview-thumbnail.jpg`, thumbBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (thumbError) throw thumbError

  // Get public URLs
  const { data: videoUrl } = supabase.storage
    .from('animation-assets')
    .getPublicUrl(`animations/${slug}/preview.mp4`)

  const { data: thumbUrl } = supabase.storage
    .from('animation-assets')
    .getPublicUrl(`animations/${slug}/preview-thumbnail.jpg`)

  // Update animation record
  await supabase
    .from('animations')
    .update({
      preview_video_url: videoUrl.publicUrl,
      preview_image_url: thumbUrl.publicUrl,
    })
    .eq('slug', slug)

  console.log(`✅ Assets uploaded for: ${slug}`)
}
```

---

## CLI Usage

```bash
# Capture single animation
node scripts/capture-preview.js --slug lava-sphere

# Capture with specific preset
node scripts/capture-preview.js --slug lava-sphere --preset ocean

# Capture all published animations
node scripts/capture-preview.js --all

# Debug mode (visible browser)
node scripts/capture-preview.js --slug lava-sphere --debug

# Capture + convert + upload in one command
npm run assets:generate -- --slug lava-sphere
```

**package.json scripts:**
```json
{
  "scripts": {
    "assets:capture": "node scripts/capture-preview.js",
    "assets:convert": "node scripts/convert-to-mp4.js",
    "assets:upload": "node scripts/upload-previews.js",
    "assets:generate": "node scripts/pipeline.js"
  }
}
```

---

## Marketing Assets

### Landing Page Hero Background

The hero video should be one of the most visually impressive animations in the library — ideally a liquid/fluid shader that loops seamlessly.

**Specs:**
```
Format: MP4 (H.264)
Resolution: 1920×1080px minimum, 3840×2160 preferred
Duration: 10-30s seamless loop
File size: < 8MB
Overlay: 60% dark overlay in CSS to ensure text legibility
```

**CSS usage:**
```css
.hero {
  position: relative;
  overflow: hidden;
}

.hero__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;  /* Subtle — text must remain primary */
}
```

### Open Graph Image

Since the product is animated, the OG image should be a thumbnail of the most visually striking animation with the logo and tagline overlaid.

**Specs:**
```
Dimensions: 1200×630px
Format: JPEG, quality 90
Text: "LiquidMktplace" + "Parametric 3D Animations for your website"
Background: Best thumbnail from library
```

### Animation Type Headers

One per animation type — abstract representation of the category. These appear at the top of filtered marketplace views.

```
Dimensions: 1920×300px
Format: JPEG
Style: Dark background (consistent with animation previews)
Content: Type name + subtle motion-blur or abstract visual
```

---

## Storage Structure

```
Supabase Storage bucket: animation-assets

animations/
├── lava-sphere/
│   ├── preview.mp4
│   ├── preview-thumbnail.jpg
│   ├── preset-lava.mp4
│   └── preset-ocean.mp4
├── cosmic-dust/
│   ├── preview.mp4
│   └── preview-thumbnail.jpg

marketing/
├── hero-bg.mp4
├── og-image.jpg
├── type-liquid.jpg
├── type-particles.jpg
├── type-3d-object.jpg
├── type-svg.jpg
├── type-typography.jpg
└── type-scroll.jpg
```

---

## Quality Standards

**Video previews:**
- [ ] Animation is clearly visible against dark background
- [ ] Loop point is seamless (no visible cut)
- [ ] Most visually interesting moment happens within first 2 seconds
- [ ] File size < 3MB
- [ ] Muted (no audio)

**Thumbnails:**
- [ ] Captures an interesting moment (not the very start)
- [ ] Sharp, not motion-blurred
- [ ] File size < 150KB

---

## Maintenance

Regenerate previews when:
- Default parameters for an animation change
- Shader is updated
- New presets are added (capture preset-specific videos)
- Visual bug is fixed

All generation is non-destructive — existing assets stay live until new ones are uploaded and confirmed.