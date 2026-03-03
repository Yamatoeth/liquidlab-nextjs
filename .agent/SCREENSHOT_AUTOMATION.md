# Screenshot Automation Implementation

## Overview

This document provides the complete implementation for automated screenshot generation using Puppeteer with Alpine.js support. This replaces manual Shopify screenshots with a scalable, consistent process.

---

## Prerequisites
```bash
# Install required packages
npm install puppeteer sharp @supabase/supabase-js dotenv
```

**Package purposes:**
- `puppeteer`: Browser automation for screenshots
- `sharp`: Image optimization and resizing
- `@supabase/supabase-js`: Upload to Supabase Storage
- `dotenv`: Environment variable management

---

## Project Structure
```
/scripts
  ├── config.js                    # Centralized configuration
  ├── demo-data.js                 # Shopify demo data for screenshots
  ├── screenshot-generator.js      # Main generator with Alpine.js support
  ├── upload-to-supabase.js        # Upload helper
  ├── optimize-images.js           # Image optimization
  └── batch-generate.js            # Batch processing with preview mode

/screenshots (temporary)
  ├── {slug}-desktop.png
  ├── {slug}-mobile.png
  └── {slug}-hover.png
```

---

## Core Implementation

### 1. Configuration (`scripts/config.js`)
```javascript
/**
 * Centralized configuration for screenshot generation
 */
module.exports = {
  // Viewport configurations
  viewports: {
    desktop: { width: 1920, height: 1080 },
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 }
  },

  // Clip regions by category (what portion of the page to capture)
  clips: {
    'Header': { x: 360, y: 0, width: 1200, height: 400 },
    'Cart': { x: 120, y: 50, width: 1200, height: 800 },
    'Product Page': { x: 360, y: 140, width: 1200, height: 800 },
    'Sections': { x: 360, y: 100, width: 1200, height: 800 },
    'Animations': { x: 360, y: 140, width: 1200, height: 800 },
    'Footer': { x: 360, y: 140, width: 1200, height: 600 },
    'Utilities': { x: 360, y: 140, width: 1200, height: 800 },
    'default': { x: 360, y: 140, width: 1200, height: 800 }
  },

  // Timing delays (milliseconds)
  delays: {
    afterLoad: 1000,        // Wait after page load
    alpineInit: 1500,       // Wait for Alpine.js initialization
    beforeScreenshot: 500,  // Wait before taking screenshot
    hoverAnimation: 300,    // Wait for hover animations
    stateTransition: 800    // Wait for state transitions (modals, drawers)
  },

  // Supabase storage configuration
  storage: {
    bucket: 'snippet-assets',
    basePath: 'snippets'
  },

  // Image optimization settings
  optimization: {
    quality: 90,
    compressionLevel: 9,
    adaptiveFiltering: true
  },

  // Auto-trigger selectors per category
  triggers: {
    'Cart': {
      selector: '[x-data*="cartDrawer"], [x-data*="cart"]',
      action: (el) => {
        if (el.__x && el.__x.$data) {
          el.__x.$data.open = true;
        }
      }
    },
    'Header': {
      selector: '[x-data*="megaMenu"], .mega-menu__item',
      action: (el) => {
        if (el.__x && el.__x.$data) {
          el.__x.$data.open = 'Products';
        }
      }
    },
    'Product Page': {
      selector: '[x-data*="quickView"], [x-data*="productGallery"]',
      action: (el) => {
        if (el.__x && el.__x.$data && el.__x.$data.open !== undefined) {
          el.__x.$data.open = true;
        }
      }
    }
  }
};
```

---

### 2. Demo Data (`scripts/demo-data.js`)
```javascript
/**
 * Realistic Shopify demo data for screenshots
 * This data is injected into the window object for snippets to use
 */
module.exports = {
  product: {
    id: 7234567890,
    handle: 'premium-cotton-tshirt',
    title: 'Premium Cotton T-Shirt',
    vendor: 'Acme Store',
    type: 'Apparel',
    price: 2999, // in cents
    compare_at_price: 3999,
    available: true,
    description: '<p>Premium quality cotton t-shirt with a modern fit. Made from 100% organic cotton, perfect for everyday wear.</p>',
    featured_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop'
    ],
    variants: [
      { 
        id: 40001, 
        title: 'Small / Black', 
        price: 2999, 
        available: true,
        option1: 'Small',
        option2: 'Black'
      },
      { 
        id: 40002, 
        title: 'Medium / Black', 
        price: 2999, 
        available: true,
        option1: 'Medium',
        option2: 'Black'
      },
      { 
        id: 40003, 
        title: 'Large / Black', 
        price: 2999, 
        available: false,
        option1: 'Large',
        option2: 'Black'
      },
      { 
        id: 40004, 
        title: 'Small / White', 
        price: 2999, 
        available: true,
        option1: 'Small',
        option2: 'White'
      }
    ],
    options: [
      { name: 'Size', values: ['Small', 'Medium', 'Large', 'X-Large'] },
      { name: 'Color', values: ['Black', 'White', 'Gray', 'Navy'] }
    ],
    tags: ['summer', 'cotton', 'basics', 'bestseller'],
    selected_or_first_available_variant: {
      id: 40001,
      title: 'Small / Black',
      price: 2999
    }
  },

  cart: {
    token: 'demo-cart-token',
    note: null,
    attributes: {},
    total_price: 8997,
    total_weight: 600,
    item_count: 3,
    items: [
      {
        id: 40001,
        product_id: 7234567890,
        title: 'Premium Cotton T-Shirt',
        variant_title: 'Medium / Black',
        quantity: 2,
        price: 2999,
        line_price: 5998,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop',
        handle: 'premium-cotton-tshirt',
        url: '/products/premium-cotton-tshirt'
      },
      {
        id: 40102,
        product_id: 7234567891,
        title: 'Classic Denim Jeans',
        variant_title: '32 / Blue',
        quantity: 1,
        price: 2999,
        line_price: 2999,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&h=80&fit=crop',
        handle: 'classic-denim-jeans',
        url: '/products/classic-denim-jeans'
      }
    ],
    currency: 'USD'
  },

  collection: {
    id: 123456,
    handle: 'summer-collection',
    title: 'Summer Collection',
    description: 'Light and breathable pieces for warm weather',
    products_count: 24,
    all_tags: ['summer', 'cotton', 'linen', 'breathable', 'color-black', 'color-white', 'size-s', 'size-m', 'size-l']
  },

  shop: {
    name: 'Acme Store',
    currency: 'USD',
    money_format: '${{amount}}'
  },

  customer: {
    id: 98765,
    email: 'customer@example.com',
    first_name: 'John',
    last_name: 'Doe',
    accepts_marketing: true
  }
};
```

---

### 3. Screenshot Generator (`scripts/screenshot-generator.js`)
```javascript
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const config = require('./config');
const demoData = require('./demo-data');

/**
 * Generate screenshots for a snippet
 * @param {Object} snippet - Snippet object with code and metadata
 * @param {Object} options - Screenshot options
 */
async function generateScreenshots(snippet, options = {}) {
  const {
    outputDir = './screenshots',
    captureHover = true,
    debug = false
  } = options;

  console.log(`📸 Generating screenshots for: ${snippet.title}`);

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Launch browser
  const browser = await puppeteer.launch({
    headless: !debug,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    devtools: debug
  });

  try {
    const page = await browser.newPage();

    // Build HTML from snippet
    const html = buildSnippetHTML(snippet);
    
    // Set content
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 15000 
    });

    // Wait for Alpine.js to initialize
    console.log('  ⏳ Waiting for Alpine.js...');
    await page.waitForTimeout(config.delays.alpineInit);

    // Auto-trigger interactive states
    await autoTriggerState(page, snippet);

    const screenshots = {};
    const clipConfig = config.clips[snippet.category] || config.clips.default;

    // Desktop screenshot
    console.log('  📱 Capturing desktop view...');
    await page.setViewport(config.viewports.desktop);
    await page.waitForTimeout(config.delays.beforeScreenshot);
    
    const desktopPath = path.join(outputDir, `${snippet.slug}-desktop.png`);
    await page.screenshot({
      path: desktopPath,
      clip: clipConfig
    });
    screenshots.desktop = desktopPath;
    console.log('  ✅ Desktop screenshot saved');

    // Mobile screenshot
    console.log('  📱 Capturing mobile view...');
    await page.setViewport(config.viewports.mobile);
    await page.waitForTimeout(config.delays.beforeScreenshot);
    
    const mobilePath = path.join(outputDir, `${snippet.slug}-mobile.png`);
    await page.screenshot({
      path: mobilePath,
      fullPage: false
    });
    screenshots.mobile = mobilePath;
    console.log('  ✅ Mobile screenshot saved');

    // Hover state (if applicable)
    if (captureHover && shouldCaptureHover(snippet)) {
      console.log('  📱 Capturing hover state...');
      await page.setViewport(config.viewports.desktop);
      
      const hoverSelector = snippet.hover_selector || 'a:first-of-type, button:first-of-type, .mega-menu__item:first-child';
      
      try {
        await page.hover(hoverSelector);
        await page.waitForTimeout(config.delays.hoverAnimation);
        
        const hoverPath = path.join(outputDir, `${snippet.slug}-hover.png`);
        await page.screenshot({
          path: hoverPath,
          clip: clipConfig
        });
        screenshots.hover = hoverPath;
        console.log('  ✅ Hover screenshot saved');
      } catch (err) {
        console.log('  ⚠️  Hover state capture skipped (element not found)');
      }
    }

    return screenshots;

  } catch (error) {
    console.error('❌ Screenshot generation failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Auto-trigger interactive states based on category
 */
async function autoTriggerState(page, snippet) {
  const trigger = config.triggers[snippet.category];
  
  if (!trigger) return;

  console.log(`  🎯 Auto-triggering ${snippet.category} state...`);
  
  try {
    await page.evaluate((selector, categoryAction) => {
      const element = document.querySelector(selector);
      if (element && element.__x && element.__x.$data) {
        // Execute category-specific action
        eval(categoryAction);
      }
    }, trigger.selector, trigger.action.toString());

    // Wait for state transition
    await page.waitForTimeout(config.delays.stateTransition);
    console.log('  ✅ State triggered successfully');
  } catch (err) {
    console.log('  ⚠️  Auto-trigger failed, continuing with default state');
  }
}

/**
 * Determine if hover state should be captured
 */
function shouldCaptureHover(snippet) {
  const hoverCategories = ['Header', 'Product Page', 'Cart', 'Sections'];
  return hoverCategories.includes(snippet.category);
}

/**
 * Build HTML document from snippet code with Alpine.js and demo data
 */
function buildSnippetHTML(snippet) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${snippet.title}</title>
  
  <!-- Alpine.js (required for interactive snippets) -->
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  
  <style>
    /* Reset */
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Base styles (Shopify-like) */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
                   'Helvetica', 'Arial', sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #000000;
      background: #ffffff;
      padding: 40px 20px;
      min-height: 100vh;
    }

    /* Container */
    .snippet-container {
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
    }

    /* Common snippet styles */
    .cart-drawer__overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 40;
    }

    .cart-drawer__panel {
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      width: 400px;
      max-width: 90vw;
      background: white;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
      z-index: 50;
    }

    .quick-view-modal {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .quick-view-modal__overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
    }

    .quick-view-modal__content {
      position: relative;
      background: white;
      border-radius: 12px;
      max-width: 900px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      z-index: 51;
    }

    /* Hide elements with x-cloak until Alpine loads */
    [x-cloak] { 
      display: none !important; 
    }

    /* Snippet-specific CSS */
    ${snippet.css_code || ''}
  </style>
</head>
<body>
  <div class="snippet-container">
    ${snippet.liquid_code}
  </div>

  <script>
    // Inject Shopify demo data
    window.product = ${JSON.stringify(demoData.product)};
    window.cart = ${JSON.stringify(demoData.cart)};
    window.collection = ${JSON.stringify(demoData.collection)};
    window.shop = ${JSON.stringify(demoData.shop)};
    window.customer = ${JSON.stringify(demoData.customer)};

    // Shopify helper functions
    window.Shopify = {
      formatMoney: function(cents, format) {
        return '$' + (cents / 100).toFixed(2);
      }
    };

    // Wait for Alpine to initialize
    document.addEventListener('alpine:init', () => {
      console.log('✅ Alpine.js initialized');
    });

    // Snippet-specific JavaScript
    ${snippet.javascript_code || ''}
  </script>
</body>
</html>
  `.trim();
}

module.exports = { generateScreenshots };
```

---

### 4. Batch Processing with Preview Mode (`scripts/batch-generate.js`)
```javascript
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');
const { generateScreenshots } = require('./screenshot-generator');
const { uploadScreenshots, updateSnippetURLs } = require('./upload-to-supabase');
const { optimizeAllScreenshots } = require('./optimize-images');
const config = require('./config');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Generate screenshots for all published snippets
 */
async function batchGenerateAll() {
  console.log('🚀 Starting batch screenshot generation...\n');

  // Fetch all published snippets
  const { data: snippets, error } = await supabase
    .from('snippets')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to fetch snippets:', error);
    return;
  }

  console.log(`📋 Found ${snippets.length} snippets to process\n`);

  let successful = 0;
  let failed = 0;

  for (const snippet of snippets) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Processing: ${snippet.title} (${snippet.slug})`);
      console.log('='.repeat(60));

      // Generate screenshots
      const screenshots = await generateScreenshots(snippet, {
        outputDir: './screenshots',
        captureHover: true
      });

      // Optimize images
      console.log('\n🔧 Optimizing images...');
      await optimizeAllScreenshots('./screenshots');

      // Upload to Supabase
      const urls = await uploadScreenshots(snippet.slug, screenshots);

      // Update snippet record
      await updateSnippetURLs(snippet.id, urls);

      successful++;
      console.log(`\n✅ Completed: ${snippet.title}\n`);

    } catch (error) {
      failed++;
      console.error(`\n❌ Failed: ${snippet.title}`);
      console.error(`   Error: ${error.message}\n`);
      // Continue with next snippet instead of stopping
      continue;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Batch Generation Summary');
  console.log('='.repeat(60));
  console.log(`Total snippets: ${snippets.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log('='.repeat(60));
}

/**
 * Generate screenshots for a single snippet by slug
 */
async function generateForSnippet(slug) {
  console.log(`🎯 Generating screenshots for: ${slug}\n`);

  // Fetch snippet
  const { data: snippet, error } = await supabase
    .from('snippets')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('❌ Snippet not found:', error);
    return;
  }

  try {
    // Generate
    const screenshots = await generateScreenshots(snippet);

    // Optimize
    await optimizeAllScreenshots('./screenshots');

    // Upload
    const urls = await uploadScreenshots(snippet.slug, screenshots);

    // Update
    await updateSnippetURLs(snippet.id, urls);

    console.log('\n✅ Screenshot generation complete!');

  } catch (error) {
    console.error('\n❌ Generation failed:', error);
  }
}

/**
 * Preview snippet in visible browser for debugging
 * @param {string} slug - Snippet slug to preview
 */
async function previewSnippet(slug) {
  console.log(`🖼️  Opening preview for: ${slug}\n`);

  // Fetch snippet
  const { data: snippet, error } = await supabase
    .from('snippets')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('❌ Snippet not found:', error);
    return;
  }

  const browser = await puppeteer.launch({
    headless: false,  // Visible browser
    devtools: true,   // DevTools open
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    
    // Build HTML
    const { buildSnippetHTML } = require('./screenshot-generator');
    const html = buildSnippetHTML(snippet);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.setViewport(config.viewports.desktop);

    console.log('✅ Preview mode active');
    console.log('📌 Browser will stay open for debugging');
    console.log('🔧 DevTools are available');
    console.log('❌ Close the browser window to exit\n');

    // Wait indefinitely until browser is closed manually
    await new Promise((resolve) => {
      browser.on('disconnected', resolve);
    });

  } catch (error) {
    console.error('❌ Preview failed:', error);
    await browser.close();
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--all')) {
    batchGenerateAll();
  } else if (args.includes('--slug')) {
    const slugIndex = args.indexOf('--slug');
    const slug = args[slugIndex + 1];
    if (slug) {
      generateForSnippet(slug);
    } else {
      console.error('❌ Please provide a slug: --slug <snippet-slug>');
    }
  } else if (args.includes('--preview')) {
    const previewIndex = args.indexOf('--preview');
    const slug = args[previewIndex + 1];
    if (slug) {
      previewSnippet(slug);
    } else {
      console.error('❌ Please provide a slug: --preview <snippet-slug>');
    }
  } else {
    console.log(`
📸 Screenshot Generator CLI

Usage:
  node scripts/batch-generate.js --all                    Generate for all snippets
  node scripts/batch-generate.js --slug <slug>            Generate for specific snippet
  node scripts/batch-generate.js --preview <slug>         Open snippet in browser for debugging

Examples:
  node scripts/batch-generate.js --all
  node scripts/batch-generate.js --slug mega-menu
  node scripts/batch-generate.js --preview floating-cart-drawer
    `);
  }
}

module.exports = { batchGenerateAll, generateForSnippet, previewSnippet };
```

---

### 5. Add NPM Scripts to `package.json`
```json
{
  "scripts": {
    "screenshots:all": "node scripts/batch-generate.js --all",
    "screenshots:single": "node scripts/batch-generate.js --slug",
    "screenshots:preview": "node scripts/batch-generate.js --preview",
    "screenshots:optimize": "node scripts/optimize-images.js ./screenshots"
  }
}
```

---

## Usage

### Generate All Screenshots
```bash
npm run screenshots:all
```

### Generate Single Snippet
```bash
npm run screenshots:single -- mega-menu
```

### Preview Mode (Debug)
```bash
npm run screenshots:preview -- floating-cart-drawer
```

This will:
- Open a visible browser window
- Load the snippet with Alpine.js
- Open DevTools automatically
- Stay open until you manually close it

### Optimize Existing Images
```bash
npm run screenshots:optimize
```

---

## Environment Setup

### `.env` File
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Screenshot settings
SCREENSHOT_OUTPUT_DIR=./screenshots
SCREENSHOT_DEBUG=false
```

---

## Troubleshooting

### Common Issues

**1. "Alpine.js not initializing"**
```javascript
// Increase Alpine init delay in config.js
delays: {
  alpineInit: 2000  // Increase to 2 seconds
}
```

**2. "Cart drawer not showing"**
```javascript
// Check the auto-trigger selector in config.js
triggers: {
  'Cart': {
    selector: '[x-data]',  // Try broader selector
    action: (el) => {
      console.log('Found element:', el);
      if (el.__x) el.__x.$data.open = true;
    }
  }
}
```

**3. "Screenshot is blank"**
```javascript
// Increase wait times in config.js
delays: {
  afterLoad: 2000,
  beforeScreenshot: 1000
}
```

---

## Testing

### Test Single Snippet
```bash
# Create a simple test snippet
node -e "
const { generateScreenshots } = require('./scripts/screenshot-generator');
const testSnippet = {
  slug: 'test',
  title: 'Test Snippet',
  category: 'Cart',
  liquid_code: '<div x-data=\"{ open: false }\"><button @click=\"open = true\">Test</button></div>',
  css_code: 'button { padding: 10px 20px; background: black; color: white; }',
  javascript_code: ''
};
generateScreenshots(testSnippet, { debug: true });
"
```

---

## Next Steps

1. **Create config and demo-data files** using the code above
2. **Test with preview mode** on a single snippet
3. **Generate screenshots for all snippets** with batch mode
4. **Integrate with admin panel** for automatic generation on snippet creation

---

## Performance Tips

- Use `--preview` mode first to validate snippets render correctly
- Run batch generation during off-peak hours
- Consider using a job queue (Bull/BullMQ) for production
- Keep browser instance alive for multiple screenshots to save startup time