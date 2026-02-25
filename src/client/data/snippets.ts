export interface Snippet {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    images: string[];
    code: string;
    features: string[];
}

export const categories = [
  "All",
  "Header",
  "Product Page",
  "Cart",
  "Sections",
  "Animations",
  "Footer",
  "Utilities",
  "React",
  "TypeScript",
  "Backend",
  "UX",
  "Forms",
  "Performance",
  "Media",
  "Accessibility",
  "PWA",
];

export const snippets: Snippet[] = [
  {
    id: "mega-menu",
    title: "Social Proof",
    description: "A fully responsive mega menu with multi-column dropdowns, image support, and smooth animations. Drop-in ready for any Shopify theme.",
    category: "Header",
    price: 4.99,
    images: ["mega-menu/image.png"],
    code: `<div class="social-proof-block">
    <div class="profile-circles-wrapper">
        <div class="profile-circle" style="background-image: url(https://cdn.shopify.com/s/files/1/0687/1620/0001/files/imgi_98_98b1b6ad81ee0071dfbb8984387f0674.jpg?v=1765287838);"></div>
        <div class="profile-circle" style="background-image: url(https://cdn.shopify.com/s/files/1/0687/1620/0001/files/imgi_94_89ab355028fc16076f99d87b910079b9.jpg?v=1765287838);"></div>
        <div class="profile-circle" style="background-image: url(https://cdn.shopify.com/s/files/1/0687/1620/0001/files/imgi_97_e9082007b92f4d1e23dce25c3cbb1caa.jpg?v=1765287838);"></div>
    </div>

    <div class="social-proof__text-wrapper">
        <p class="social-proof__names">
            [CUSTOMER NAMES]
            <span class="verified-badge" aria-label="Verified">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1e90ff" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </span>
        </p>
        <p class="social-proof__purchases">
            [TEXT]
        </p>
    </div>
</div>

<style>

/* -------------------------------------- */
/* Styles for social proof */
/* -------------------------------------- */

.social-proof-block {
    display: flex;
    align-items: center;
    padding: 15px 0;
    max-width: 450px;
    margin: 10px auto;
}

.profile-circles-wrapper {
    display: flex;
    position: relative;
    margin-right: 15px;
}

/* Style for profile circle */

.profile-circle {
    width: 45px; /* Taille du cercle */
    height: 45px;
    border-radius: 50%;
    background-size: cover;
    background-position: center;
    border: 2px solid white; /* Bordure blanche pour séparer les cercles */
    position: relative;
    left: 0;
    z-index: 10;
}

/* Offset circles for the superimposition effect */

.profile-circles-wrapper .profile-circle:nth-child(2) {
    margin-left: -15px;
    z-index: 9;
}

.profile-circles-wrapper .profile-circle:nth-child(3) {
    margin-left: -15px;
    z-index: 8;
}

.social-proof__text-wrapper {
    line-height: 1;
}


.social-proof__names {
    font-size: 1.5em;
    font-weight: 700;
    color: #333;
    margin: 0 0 5px 0;
    display: flex;
    align-items: center;
}


.verified-badge {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #1e90ff; /* Bleu vif */
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin-left: 8px;
}

.verified-badge svg {
    width: 14px;
    height: 14px;
}


.social-proof__purchases {
    font-size: 1em;
    color: #555;
    margin: 0;
    font-weight: 400;
}

.social-proof__purchases strong {
    font-weight: 700;
}
</style>`,
    features: ["Responsive design", "Multi-column layout", "Image support", "Smooth transitions"],
  },

  {
  id: "product-color-swatches",
  title: "Product Color Swatches",
  description: "Beautiful color swatches for variant selection. Supports images, colors, and tooltips. Works with Shopify's variant system.",
  category: "Product Page",
  price: 19,
  images: [],
  code: `{% comment %} Color Swatches - LiquidMktplace {% endcomment %}
<div x-data="colorSwatches()" class="color-swatches">
  <label class="swatches-label">
    Color: <span x-text="selectedColor"></span>
  </label>

  <div class="swatches-grid">
    {% for option in product.options_with_values %}
      {% if option.name == 'Color' %}
        {% for value in option.values %}
          <button @click="selectColor('{{ value }}')"
                  :class="{ 'active': selectedColor === '{{ value }}' }"
                  class="swatch"
                  data-tooltip="{{ value }}">
            {% assign color_file = value | handleize | append: '.png' %}
            {% if images[color_file] %}
              <img src="{{ images[color_file] | img_url: '50x50' }}" alt="{{ value }}">
            {% else %}
              <span class="swatch-color" 
                    style="background-color: {{ value | downcase }};"></span>
            {% endif %}
          </button>
        {% endfor %}
      {% endif %}
    {% endfor %}
  </div>
</div>

<script>
function colorSwatches() {
  return {
    selectedColor: '{{ product.selected_or_first_available_variant.option1 }}',

    selectColor(color) {
      this.selectedColor = color;
      
      // Update product form
      const select = document.querySelector('select[name="id"]');
      const variant = {{ product.variants | json }}.find(v => 
        v.options.includes(color)
      );
      
      if (variant && select) {
        select.value = variant.id;
        select.dispatchEvent(new Event('change'));
      }
    }
  }
}
</script>`,
  features: ["Image swatches", "Color fallback", "Tooltips", "Variant linking"],
},

{
  id: "shipping-calculator",
  title: "Shipping Rate Calculator",
  description: "Let customers estimate shipping costs before checkout. Uses Shopify's Shipping API for accurate rates.",
  category: "Cart",
  price: 29,
  images: [''],
  code: `{% comment %} Shipping Calculator - LiquidMktplace {% endcomment %}
<div x-data="shippingCalc()" class="shipping-calculator">
  <h3>Estimate Shipping</h3>

  <form @submit.prevent="calculateRates()" class="shipping-form">
    <div class="form-row">
      <label>Country</label>
      <select x-model="country" required>
        <option value="">Select Country</option>
        <option value="US">United States</option>
        <option value="CA">Canada</option>
        <option value="GB">United Kingdom</option>
        <!-- Add more countries -->
      </select>
    </div>

    <div class="form-row" x-show="country === 'US' || country === 'CA'">
      <label>State/Province</label>
      <input type="text" x-model="province" placeholder="e.g., CA">
    </div>

    <div class="form-row">
      <label>ZIP/Postal Code</label>
      <input type="text" x-model="zip" required placeholder="e.g., 90210">
    </div>

    <button type="submit" 
            :disabled="loading"
            class="btn-calculate">
      <span x-show="!loading">Calculate Rates</span>
      <span x-show="loading">Loading...</span>
    </button>
  </form>

  <div x-show="rates.length > 0" x-transition class="shipping-rates">
    <h4>Available Shipping Methods:</h4>
    <template x-for="rate in rates" :key="rate.name">
      <div class="rate-item">
        <span x-text="rate.name"></span>
        <strong x-text="formatMoney(rate.price)"></strong>
      </div>
    </template>
  </div>

  <div x-show="error" x-transition class="shipping-error">
    <p x-text="error"></p>
  </div>
</div>

<script>
function shippingCalc() {
  return {
    country: '',
    province: '',
    zip: '',
    rates: [],
    loading: false,
    error: '',

    async calculateRates() {
      this.loading = true;
      this.error = '';
      this.rates = [];

      try {
        const response = await fetch('/cart/shipping_rates.json?shipping_address[zip]=' + this.zip + 
                                     '&shipping_address[country]=' + this.country +
                                     '&shipping_address[province]=' + this.province);
        
        if (!response.ok) throw new Error('Unable to calculate rates');
        
        const data = await response.json();
        this.rates = data.shipping_rates;
      } catch (e) {
        this.error = 'Could not calculate shipping. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    formatMoney(cents) {
      return '$' + (cents / 100).toFixed(2);
    }
  }
}
</script>`,
  features: ["Real shipping rates", "Shopify API", "Form validation", "Error handling"],
},

{
  id: "product-bundle-builder",
  title: "Product Bundle Builder",
  description: "Let customers create their own product bundles with a discount. Perfect for gift sets, sample packs, and upselling.",
  category: "Product Page",
  price: 45,
  images:[],
  code: `{% comment %} Bundle Builder - LiquidMktplace {% endcomment %}
<div x-data="bundleBuilder()" x-init="init()" class="bundle-builder">
  <h3>{{ section.settings.heading }}</h3>
  <p>{{ section.settings.subheading }}</p>

  <div class="bundle-steps">
    <div class="bundle-step" 
         :class="{ 'completed': selected.length >= minItems }">
      <span class="step-number">1</span>
      Select <span x-text="minItems"></span> items
    </div>
    <div class="bundle-step">
      <span class="step-number">2</span>
      Save {{ section.settings.discount_percentage }}%
    </div>
  </div>

  <div class="bundle-grid">
    {% for product in section.settings.products %}
      <div class="bundle-item"
           :class="{ 'selected': isSelected({{ product.id }}) }">
        <img src="{{ product.featured_image | img_url: '300x300' }}" 
             alt="{{ product.title }}">
        <h4>{{ product.title }}</h4>
        <p class="bundle-price">
          <span class="original"></span>
          <span class="discounted" x-text="getDiscountedPrice({{ product.price }})"></span>
        </p>
        
        <button @click="toggleProduct({{ product.id }})"
                :disabled="!canSelect({{ product.id }})"
                class="btn-select">
          <span x-show="!isSelected({{ product.id }})">Add to Bundle</span>
          <span x-show="isSelected({{ product.id }})">✓ Added</span>
        </button>
      </div>
    {% endfor %}
  </div>

  <div class="bundle-summary">
    <div class="summary-row">
      <span>Items selected:</span>
      <strong><span x-text="selected.length"></span> / <span x-text="minItems"></span></strong>
    </div>
    <div class="summary-row">
      <span>Original price:</span>
      <span x-text="'$' + originalTotal.toFixed(2)"></span>
    </div>
    <div class="summary-row highlight">
      <span>Bundle price:</span>
      <strong x-text="'$' + discountedTotal.toFixed(2)"></strong>
    </div>
    <div class="summary-row savings">
      <span>You save:</span>
      <strong x-text="'$' + (originalTotal - discountedTotal).toFixed(2)"></strong>
    </div>

    <button @click="addBundleToCart()"
            :disabled="selected.length < minItems || loading"
            class="btn-add-bundle">
      <span x-show="!loading">Add Bundle to Cart</span>
      <span x-show="loading">Adding...</span>
    </button>
  </div>
</div>

<script>
function bundleBuilder() {
  return {
    selected: [],
    minItems: {{ section.settings.min_items | default: 3 }},
    maxItems: {{ section.settings.max_items | default: 5 }},
    discountPercent: {{ section.settings.discount_percentage | default: 15 }},
    loading: false,

    init() {
      // Pre-select default products if specified
    },

    toggleProduct(id) {
      const index = this.selected.indexOf(id);
      if (index > -1) {
        this.selected.splice(index, 1);
      } else {
        this.selected.push(id);
      }
    },

    isSelected(id) {
      return this.selected.includes(id);
    },

    canSelect(id) {
      return this.isSelected(id) || this.selected.length < this.maxItems;
    },

    get originalTotal() {
      return this.selected.reduce((sum, id) => {
        const product = this.getProduct(id);
        return sum + (product ? product.price / 100 : 0);
      }, 0);
    },

    get discountedTotal() {
      return this.originalTotal * (1 - this.discountPercent / 100);
    },

    getDiscountedPrice(cents) {
      const price = cents / 100;
      const discounted = price * (1 - this.discountPercent / 100);
      return '$' + discounted.toFixed(2);
    },

    async addBundleToCart() {
      if (this.selected.length < this.minItems) return;

      this.loading = true;
      try {
        const items = this.selected.map(id => ({ id, quantity: 1 }));
        
        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        });

        // Apply discount code if configured
        {% if section.settings.discount_code %}
          await fetch('/discount/{{ section.settings.discount_code }}');
        {% endif %}

        window.location.href = '/cart';
      } catch (e) {
        alert('Error adding bundle to cart');
      } finally {
        this.loading = false;
      }
    },

    getProduct(id) {
      // Helper to get product details
      return {{ section.settings.products | json }}.find(p => p.id === id);
    }
  }
}
</script>`,
  features: ["Multi-select", "Auto discount", "Real-time pricing", "Validation"],
},

{
  id: "scroll-progress-bar",
  title: "Scroll Progress Indicator",
  description: "Elegant progress bar showing how far the user has scrolled. Great for blog posts and long product descriptions.",
  category: "Animations",
  price: 10,
  images: [],
  code: `{% comment %} Scroll Progress Bar - LiquidMktplace {% endcomment %}
<div x-data="scrollProgress()" 
     x-init="init()"
     class="scroll-progress">
  <div class="scroll-progress-bar" 
       :style="\`width: \${progress}%\`"></div>
</div>

<script>
function scrollProgress() {
  return {
    progress: 0,

    init() {
      window.addEventListener('scroll', () => this.update());
      this.update();
    },

    update() {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      this.progress = (winScroll / height) * 100;
    }
  }
}
</script>

<style>
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(0,0,0,0.1);
  z-index: 9999;
}

.scroll-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.1s ease;
}
</style>`,
  features: ["Smooth animation", "Lightweight", "Zero dependencies", "Customizable colors"],
},

{
  id: "product-upsell-popup",
  title: "Add-to-Cart Upsell Popup",
  description: "Show related products immediately after Add to Cart. Boosts AOV with smart product recommendations.",
  category: "Cart",
  price: 36,
  images: [],
  code: `{% comment %} Upsell Popup - LiquidMktplace {% endcomment %}
<div x-data="upsellPopup()" 
     x-show="visible"
     @keydown.escape.window="close()"
     style="display: none;"
     class="upsell-popup">
  
  <div @click="close()" class="upsell-popup__overlay"></div>
  
  <div class="upsell-popup__content">
    <button @click="close()" class="upsell-popup__close">×</button>

    <div class="upsell-success">
      ✓ Added to cart!
    </div>

    <h3>{{ section.settings.heading }}</h3>
    <p>{{ section.settings.subheading }}</p>

    <div class="upsell-products">
      {% for product in recommendations.products limit: 3 %}
        <div class="upsell-product">
          <img src="{{ product.featured_image | img_url: '200x200' }}" 
               alt="{{ product.title }}">
          <div class="upsell-product__info">
            <h4>{{ product.title }}</h4>
            <p class="price">{{ product.price | money }}</p>
            <button @click="addUpsell({{ product.variants.first.id }})"
                    :disabled="adding === {{ product.variants.first.id }}"
                    class="btn-add-small">
              <span x-show="adding !== {{ product.variants.first.id }}">+ Add</span>
              <span x-show="adding === {{ product.variants.first.id }}">Adding...</span>
            </button>
          </div>
        </div>
      {% endfor %}
    </div>

    <div class="upsell-actions">
      <button @click="close()" class="btn-continue">Continue Shopping</button>
      <button @click="goToCart()" class="btn-view-cart">View Cart ({{ cart.item_count }})</button>
    </div>
  </div>
</div>

<script>
function upsellPopup() {
  return {
    visible: false,
    adding: null,

    init() {
      // Listen for add-to-cart events
      document.addEventListener('cart:item-added', () => {
        this.show();
      });
    },

    show() {
      this.visible = true;
      document.body.style.overflow = 'hidden';
    },

    close() {
      this.visible = false;
      document.body.style.overflow = '';
    },

    async addUpsell(variantId) {
      this.adding = variantId;
      try {
        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity: 1 })
        });
        
        // Update cart count
        window.dispatchEvent(new Event('cart:updated'));
      } finally {
        this.adding = null;
      }
    },

    goToCart() {
      window.location.href = '/cart';
    }
  }
}

// Trigger popup when product is added
document.addEventListener('submit', (e) => {
  if (e.target.matches('.product-form')) {
    setTimeout(() => {
      document.dispatchEvent(new Event('cart:item-added'));
    }, 500);
  }
});
</script>`,
  features: ["Smart recommendations", "Multi-add support", "Cart integration", "Event-driven"],
},
  // Ajoutez ces snippets à votre tableau existant dans snippets.ts

{
  id: "floating-cart-drawer",
  title: "Floating Cart Drawer",
  description: "A premium slide-out cart drawer with smooth animations, quantity controls, and real-time price updates. Works with Shopify Ajax API.",
  category: "Cart",
  price: 35,
  images:[],
  code: `{% comment %} Floating Cart Drawer - LiquidMktplace {% endcomment %}
<div x-data="cartDrawer()" x-init="init()">
  <!-- Trigger Button -->
  <button @click="open = true" class="cart-trigger">
    <svg class="w-6 h-6"><!-- Cart icon --></svg>
    <span x-text="itemCount" class="cart-badge"></span>
  </button>

  <!-- Drawer Overlay -->
  <div x-show="open" 
       @click="open = false"
       x-transition:enter="transition ease-out duration-300"
       x-transition:enter-start="opacity-0"
       x-transition:enter-end="opacity-100"
       class="cart-drawer__overlay"></div>

  <!-- Drawer Panel -->
  <div x-show="open"
       @click.away="open = false"
       x-transition:enter="transition ease-out duration-300"
       x-transition:enter-start="translate-x-full"
       x-transition:enter-end="translate-x-0"
       class="cart-drawer__panel">
    
    <div class="cart-drawer__header">
      <h2>Your Cart (<span x-text="itemCount"></span>)</h2>
      <button @click="open = false">×</button>
    </div>

    <div class="cart-drawer__items">
      <template x-for="item in items" :key="item.id">
        <div class="cart-item">
          <img :src="item.image" :alt="item.title" class="cart-item__image">
          <div class="cart-item__details">
            <h3 x-text="item.title"></h3>
            <p x-text="formatMoney(item.price)"></p>
            <div class="cart-item__quantity">
              <button @click="updateQuantity(item.id, item.quantity - 1)">-</button>
              <input type="number" :value="item.quantity" @change="updateQuantity(item.id, $event.target.value)">
              <button @click="updateQuantity(item.id, item.quantity + 1)">+</button>
            </div>
          </div>
          <button @click="removeItem(item.id)" class="cart-item__remove">Remove</button>
        </div>
      </template>
    </div>

    <div class="cart-drawer__footer">
      <div class="cart-drawer__total">
        <span>Subtotal:</span>
        <span x-text="formatMoney(total)"></span>
      </div>
      <button @click="window.location.href='/checkout'" class="cart-drawer__checkout">
        Checkout
      </button>
    </div>
  </div>
</div>

<script>
function cartDrawer() {
  return {
    open: false,
    items: [],
    itemCount: 0,
    total: 0,
    
    init() {
      this.fetchCart();
    },
    
    async fetchCart() {
      const res = await fetch('/cart.js');
      const cart = await res.json();
      this.items = cart.items;
      this.itemCount = cart.item_count;
      this.total = cart.total_price;
    },
    
    async updateQuantity(id, quantity) {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity })
      });
      this.fetchCart();
    },
    
    async removeItem(id) {
      await this.updateQuantity(id, 0);
    },
    
    formatMoney(cents) {
      return (cents / 100).toFixed(2) + ' ' + '{{ cart.currency.symbol }}';
    }
  }
}
</script>`,
  features: ["Ajax API integration", "Smooth animations", "Quantity controls", "Responsive design"],
},

{
  id: "product-quick-view",
  title: "Product Quick View Modal",
  description: "Let customers preview products in a modal without leaving the collection page. Includes size selector, Add to Cart, and image gallery.",
  category: "Product Page",
  price: 32,
  images:[],
  code: `{% comment %} Quick View Modal - LiquidMktplace {% endcomment %}
<div x-data="quickView()">
  <!-- Trigger (use on product cards) -->
  <button @click="openQuickView('{{ product.id }}')" class="quick-view-trigger">
    Quick View
  </button>

  <!-- Modal -->
  <div x-show="open" 
       @keydown.escape.window="open = false"
       class="quick-view-modal"
       style="display: none;">
    
    <div @click="open = false" class="quick-view-modal__overlay"></div>
    
    <div class="quick-view-modal__content">
      <button @click="open = false" class="quick-view-modal__close">×</button>
      
      <template x-if="product">
        <div class="quick-view-grid">
          <!-- Images -->
          <div class="quick-view__images">
            <img :src="selectedImage" :alt="product.title" class="main-image">
            <div class="thumbnail-grid">
              <template x-for="image in product.images" :key="image">
                <img :src="image" @click="selectedImage = image" class="thumbnail">
              </template>
            </div>
          </div>

          <!-- Product Info -->
          <div class="quick-view__info">
            <h2 x-text="product.title"></h2>
            <p class="price" x-text="formatMoney(product.price)"></p>
            <div x-html="product.description" class="description"></div>

            <!-- Variant Selector -->
            <div class="variant-selector" x-show="product.variants.length > 1">
              <label>Size:</label>
              <select x-model="selectedVariant">
                <template x-for="variant in product.variants" :key="variant.id">
                  <option :value="variant.id" x-text="variant.title"></option>
                </template>
              </select>
            </div>

            <!-- Add to Cart -->
            <button @click="addToCart()" 
                    :disabled="loading"
                    class="btn-add-to-cart">
              <span x-show="!loading">Add to Cart</span>
              <span x-show="loading">Adding...</span>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</div>

<script>
function quickView() {
  return {
    open: false,
    product: null,
    selectedVariant: null,
    selectedImage: null,
    loading: false,

    async openQuickView(productId) {
      const res = await fetch(\`/products/\${productId}.js\`);
      this.product = await res.json();
      this.selectedVariant = this.product.variants[0].id;
      this.selectedImage = this.product.images[0];
      this.open = true;
    },

    async addToCart() {
      this.loading = true;
      try {
        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: this.selectedVariant,
            quantity: 1
          })
        });
        this.open = false;
        // Trigger cart refresh event
        window.dispatchEvent(new Event('cart:updated'));
      } finally {
        this.loading = false;
      }
    },

    formatMoney(cents) {
      return '$' + (cents / 100).toFixed(2);
    }
  }
}
</script>`,
  features: ["Ajax API", "Image gallery", "Variant selector", "Mobile optimized"],
},

{
  id: "sticky-add-to-cart",
  title: "Sticky Add to Cart Bar",
  description: "A fixed bottom bar that appears when scrolling past the product form. Shows product image, price, and Add to Cart button.",
  category: "Product Page",
  price: 18,
  images:[],
  code: `{% comment %} Sticky Add to Cart - LiquidMktplace {% endcomment %}
<div x-data="stickyCart()" 
     x-init="init()"
     x-show="visible"
     x-transition:enter="transition ease-out duration-300"
     x-transition:enter-start="translate-y-full"
     x-transition:enter-end="translate-y-0"
     class="sticky-cart-bar">
  
  <div class="sticky-cart-bar__content">
    <div class="sticky-cart-bar__product">
      <img src="{{ product.featured_image | img_url: '80x80' }}" 
           alt="{{ product.title }}"
           class="product-thumb">
      <div>
        <p class="product-title">{{ product.title }}</p>
        <p class="product-price">{{ product.price | money }}</p>
      </div>
    </div>

    <button @click="addToCart()" 
            :disabled="loading"
            class="sticky-cart-bar__button">
      <span x-show="!loading">Add to Cart</span>
      <span x-show="loading">Adding...</span>
    </button>
  </div>
</div>

<script>
function stickyCart() {
  return {
    visible: false,
    loading: false,
    formPosition: 0,

    init() {
      const form = document.querySelector('.product-form');
      if (form) {
        this.formPosition = form.offsetTop + form.offsetHeight;
        window.addEventListener('scroll', () => {
          this.visible = window.scrollY > this.formPosition;
        });
      }
    },

    async addToCart() {
      this.loading = true;
      const variantId = document.querySelector('[name="id"]').value;
      
      try {
        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity: 1 })
        });
        window.dispatchEvent(new Event('cart:updated'));
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>`,
  features: ["Scroll detection", "Mobile-first", "Ajax integration", "Lightweight"],
},

{
  id: "announcement-bar-rotator",
  title: "Rotating Announcement Bar",
  description: "Display multiple announcements with smooth auto-rotation. Includes pause on hover and manual navigation.",
  category: "Header",
  price: 15,
  images:[],
  code: `{% comment %} Announcement Bar Rotator - LiquidMktplace {% endcomment %}
<div x-data="announcementBar()" 
     x-init="startRotation()"
     @mouseenter="stopRotation()"
     @mouseleave="startRotation()"
     class="announcement-bar">
  
  <div class="announcement-bar__container">
    {% for block in section.blocks %}
      <div x-show="current === {{ forloop.index0 }}"
           x-transition:enter="transition ease-out duration-300"
           x-transition:enter-start="opacity-0 translate-y-2"
           x-transition:enter-end="opacity-100 translate-y-0"
           class="announcement-bar__item">
        {{ block.settings.text }}
        {% if block.settings.link %}
          <a href="{{ block.settings.link }}" class="announcement-bar__link">
            {{ block.settings.link_text }}
          </a>
        {% endif %}
      </div>
    {% endfor %}
  </div>

  <div class="announcement-bar__controls">
    <button @click="previous()">‹</button>
    <button @click="next()">›</button>
  </div>
</div>

<script>
function announcementBar() {
  return {
    current: 0,
    total: {{ section.blocks.size }},
    interval: null,

    startRotation() {
      this.interval = setInterval(() => this.next(), 5000);
    },

    stopRotation() {
      if (this.interval) clearInterval(this.interval);
    },

    next() {
      this.current = (this.current + 1) % this.total;
    },

    previous() {
      this.current = (this.current - 1 + this.total) % this.total;
    }
  }
}
</script>`,
  features: ["Auto-rotation", "Manual controls", "Pause on hover", "Schema ready"],
},

{
  id: "image-comparison-slider",
  title: "Before/After Image Slider",
  description: "Interactive before/after slider perfect for product transformations, testimonials, or showcasing results.",
  category: "Sections",
  price: 28,
  images:[],
  code: `{% comment %} Image Comparison Slider - LiquidMktplace {% endcomment %}
<div x-data="imageCompare()" 
     x-init="init()"
     class="image-compare">
  
  <div class="image-compare__container" 
       @mousemove="handleMove($event)"
       @touchmove="handleMove($event)">
    
    <!-- Before Image -->
    <div class="image-compare__before">
      <img src="{{ section.settings.before_image | img_url: '1200x' }}" 
           alt="Before">
      <span class="image-compare__label">Before</span>
    </div>

    <!-- After Image -->
    <div class="image-compare__after" 
         :style="\`clip-path: inset(0 0 0 \${position}%)\`">
      <img src="{{ section.settings.after_image | img_url: '1200x' }}" 
           alt="After">
      <span class="image-compare__label">After</span>
    </div>

    <!-- Slider Handle -->
    <div class="image-compare__handle" 
         :style="\`left: \${position}%\`"
         @mousedown="dragging = true"
         @touchstart="dragging = true">
      <div class="handle-line"></div>
      <div class="handle-button">
        <svg><!-- Arrows icon --></svg>
      </div>
    </div>
  </div>
</div>

<script>
function imageCompare() {
  return {
    position: 50,
    dragging: false,
    container: null,

    init() {
      this.container = this.$el.querySelector('.image-compare__container');
      
      document.addEventListener('mouseup', () => this.dragging = false);
      document.addEventListener('touchend', () => this.dragging = false);
    },

    handleMove(e) {
      if (!this.dragging && e.type !== 'mousemove') return;
      
      const rect = this.container.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      this.position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    }
  }
}
</script>`,
  features: ["Touch support", "Responsive", "Smooth dragging", "Customizable"],
},

{
  id: "testimonial-carousel",
  title: "Testimonials Carousel",
  description: "Elegant testimonial slider with auto-play, dots navigation, and star ratings. Fully customizable via section settings.",
  category: "Sections",
  price: 25,
  images:[],
  code: `{% comment %} Testimonials Carousel - LiquidMktplace {% endcomment %}
<div x-data="testimonialCarousel()" 
     x-init="init()"
     class="testimonials-carousel">
  
  <div class="testimonials-carousel__track">
    {% for block in section.blocks %}
      <div x-show="current === {{ forloop.index0 }}"
           x-transition:enter="transition ease-out duration-500"
           x-transition:enter-start="opacity-0 scale-95"
           x-transition:enter-end="opacity-100 scale-100"
           class="testimonial-card">
        
        <div class="testimonial-card__stars">
          {% for i in (1..block.settings.rating) %}
            <svg class="star"><!-- Star icon --></svg>
          {% endfor %}
        </div>

        <blockquote class="testimonial-card__quote">
          {{ block.settings.quote }}
        </blockquote>

        <div class="testimonial-card__author">
          {% if block.settings.avatar %}
            <img src="{{ block.settings.avatar | img_url: '80x80' }}" 
                 alt="{{ block.settings.author }}">
          {% endif %}
          <div>
            <p class="author-name">{{ block.settings.author }}</p>
            <p class="author-title">{{ block.settings.title }}</p>
          </div>
        </div>
      </div>
    {% endfor %}
  </div>

  <!-- Navigation Dots -->
  <div class="testimonials-carousel__dots">
    {% for block in section.blocks %}
      <button @click="goTo({{ forloop.index0 }})"
              :class="{ 'active': current === {{ forloop.index0 }} }"
              class="dot"></button>
    {% endfor %}
  </div>

  <!-- Arrow Controls -->
  <button @click="previous()" class="carousel-arrow carousel-arrow--left">‹</button>
  <button @click="next()" class="carousel-arrow carousel-arrow--right">›</button>
</div>

<script>
function testimonialCarousel() {
  return {
    current: 0,
    total: {{ section.blocks.size }},
    interval: null,

    init() {
      this.interval = setInterval(() => this.next(), 6000);
    },

    next() {
      this.current = (this.current + 1) % this.total;
    },

    previous() {
      this.current = (this.current - 1 + this.total) % this.total;
    },

    goTo(index) {
      this.current = index;
      clearInterval(this.interval);
      this.interval = setInterval(() => this.next(), 6000);
    }
  }
}
</script>`,
  features: ["Auto-play", "Star ratings", "Avatar support", "Smooth transitions"],
},

{
  id: "predictive-search",
  title: "Predictive Search Overlay",
  description: "Real-time product search with suggestions, thumbnails, and category filtering. Powered by Shopify's Predictive Search API.",
  category: "Header",
  price: 38,
  images:[],
  code: `{% comment %} Predictive Search - LiquidMktplace {% endcomment %}
<div x-data="predictiveSearch()" class="predictive-search">
  
  <!-- Search Input -->
  <div class="search-input-wrapper">
    <input type="search"
           x-model="query"
           @input.debounce.300ms="search()"
           @focus="open = true"
           placeholder="Search products..."
           class="search-input">
    <svg class="search-icon"><!-- Magnifying glass --></svg>
  </div>

  <!-- Results Overlay -->
  <div x-show="open && query.length > 0"
       @click.away="open = false"
       x-transition
       class="search-results-overlay">
    
    <template x-if="loading">
      <div class="search-loading">Searching...</div>
    </template>

    <template x-if="!loading && results.length > 0">
      <div class="search-results">
        <template x-for="product in results" :key="product.id">
          <a :href="product.url" class="search-result-item">
            <img :src="product.image" :alt="product.title" class="result-thumb">
            <div class="result-info">
              <p class="result-title" x-text="product.title"></p>
              <p class="result-price" x-text="formatMoney(product.price)"></p>
            </div>
          </a>
        </template>
        <a href="#" @click="viewAll()" class="search-view-all">
          View all results →
        </a>
      </div>
    </template>

    <template x-if="!loading && query.length > 0 && results.length === 0">
      <div class="search-no-results">
        No products found for "<span x-text="query"></span>"
      </div>
    </template>
  </div>
</div>

<script>
function predictiveSearch() {
  return {
    query: '',
    results: [],
    open: false,
    loading: false,

    async search() {
      if (this.query.length < 2) {
        this.results = [];
        return;
      }

      this.loading = true;
      try {
        const res = await fetch(\`/search/suggest.json?q=\${encodeURIComponent(this.query)}&resources[type]=product&resources[limit]=8\`);
        const data = await res.json();
        this.results = data.resources.results.products.map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          url: p.url,
          image: p.featured_image.url
        }));
      } finally {
        this.loading = false;
      }
    },

    viewAll() {
      window.location.href = \`/search?q=\${encodeURIComponent(this.query)}\`;
    },

    formatMoney(cents) {
      return '$' + (cents / 100).toFixed(2);
    }
  }
}
</script>`,
  features: ["Real-time search", "Product thumbnails", "Shopify API", "Debounced requests"],
},

{
  id: "countdown-timer-section",
  title: "Countdown Timer Section",
  description: "Create urgency with a customizable countdown timer. Perfect for flash sales, product launches, or limited offers.",
  category: "Sections",
  price: 20,
  images:[],
  code: `{% comment %} Countdown Timer Section - LiquidMktplace {% endcomment %}
<div x-data="countdown('{{ section.settings.end_date }}')" 
     x-init="init()"
     class="countdown-section">
  
  <div class="countdown-content">
    <h2>{{ section.settings.heading }}</h2>
    <p>{{ section.settings.subheading }}</p>

    <div class="countdown-timer" x-show="!expired">
      <div class="countdown-unit">
        <span class="countdown-number" x-text="days"></span>
        <span class="countdown-label">Days</span>
      </div>
      <div class="countdown-unit">
        <span class="countdown-number" x-text="hours"></span>
        <span class="countdown-label">Hours</span>
      </div>
      <div class="countdown-unit">
        <span class="countdown-number" x-text="minutes"></span>
        <span class="countdown-label">Minutes</span>
      </div>
      <div class="countdown-unit">
        <span class="countdown-number" x-text="seconds"></span>
        <span class="countdown-label">Seconds</span>
      </div>
    </div>

    <div x-show="expired" class="countdown-expired">
      {{ section.settings.expired_message }}
    </div>

    {% if section.settings.button_link %}
      <a href="{{ section.settings.button_link }}" class="countdown-cta">
        {{ section.settings.button_text }}
      </a>
    {% endif %}
  </div>
</div>

<script>
function countdown(endDate) {
  return {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
    interval: null,

    init() {
      this.update();
      this.interval = setInterval(() => this.update(), 1000);
    },

    update() {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        this.expired = true;
        clearInterval(this.interval);
        return;
      }

      this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    }
  }
}
</script>`,
  features: ["Real-time countdown", "Expiry handling", "Schema ready", "Customizable CTA"],
},

{
  id: "product-size-chart",
  title: "Product Size Chart Modal",
  description: "A beautiful, responsive size chart modal with table layout. Essential for fashion and apparel stores.",
  category: "Product Page",
  price: 16,
  images:[],
  code: `{% comment %} Size Chart Modal - LiquidMktplace {% endcomment %}
<div x-data="{ open: false }" class="size-chart-wrapper">
  
  <!-- Trigger Link -->
  <button @click="open = true" class="size-chart-trigger">
    📏 Size Guide
  </button>

  <!-- Modal -->
  <div x-show="open"
       @keydown.escape.window="open = false"
       style="display: none;"
       class="size-chart-modal">
    
    <div @click="open = false" class="size-chart-modal__overlay"></div>
    
    <div class="size-chart-modal__content">
      <div class="size-chart-modal__header">
        <h3>{{ section.settings.title }}</h3>
        <button @click="open = false">×</button>
      </div>

      <div class="size-chart-modal__body">
        {{ section.settings.description }}

        <table class="size-chart-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Chest (in)</th>
              <th>Waist (in)</th>
              <th>Hip (in)</th>
            </tr>
          </thead>
          <tbody>
            {% for row in section.settings.sizes %}
              <tr>
                <td>{{ row.size }}</td>
                <td>{{ row.chest }}</td>
                <td>{{ row.waist }}</td>
                <td>{{ row.hip }}</td>
              </tr>
            {% endfor %}
          </tbody>
        </table>

        <div class="size-chart-tips">
          <strong>How to measure:</strong>
          <p>{{ section.settings.measurement_tips }}</p>
        </div>
      </div>
    </div>
  </div>
</div>`,
  features: ["Responsive table", "Measurement tips", "Schema ready", "Accessible"],
},

{
  id: "parallax-image-section",
  title: "Parallax Image Section",
  description: "Eye-catching parallax scrolling effect for hero images or section backgrounds. Smooth and performant.",
  category: "Animations",
  price: 22,
  images:[],
  code: `{% comment %} Parallax Image Section - LiquidMktplace {% endcomment %}
<section class="parallax-section"
         x-data="parallax()"
         x-init="init()">
  
  <div class="parallax-bg"
       :style="\`transform: translateY(\${offset}px)\`">
    <img src="{{ section.settings.image | img_url: '2000x' }}" 
         alt="{{ section.settings.alt_text }}">
  </div>

  <div class="parallax-content">
    <h2>{{ section.settings.heading }}</h2>
    <p>{{ section.settings.text }}</p>
    {% if section.settings.button_link %}
      <a href="{{ section.settings.button_link }}" class="btn">
        {{ section.settings.button_text }}
      </a>
    {% endif %}
  </div>
</section>

<script>
function parallax() {
  return {
    offset: 0,
    section: null,

    init() {
      this.section = this.$el;
      window.addEventListener('scroll', () => this.update());
      this.update();
    },

    update() {
      const rect = this.section.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = 0.5; // Parallax speed

      if (rect.top < window.innerHeight && rect.bottom > 0) {
        this.offset = (scrolled - this.section.offsetTop) * rate;
      }
    }
  }
}
</script>`,
  features: ["Smooth scrolling", "Performant", "Customizable speed", "Mobile optimized"],
},

{
  id: "ajax-product-filter",
  title: "Ajax Collection Filters",
  description: "Filter products by price, color, size, and tags without page reload. Works with Shopify's collection filters.",
  category: "Sections",
  price: 42,
  images:[],
  code: `{% comment %} Ajax Collection Filters - LiquidMktplace {% endcomment %}
<div x-data="collectionFilters()" class="collection-filters">
  
  <!-- Sidebar Filters -->
  <aside class="filters-sidebar">
    <h3>Filter Products</h3>

    <!-- Price Range -->
    <div class="filter-group">
      <h4>Price</h4>
      <input type="range" 
             x-model="priceMax"
             min="0" 
             max="{{ collection.products | map: 'price' | max }}"
             @change="applyFilters()">
      <span>Up to $<span x-text="(priceMax / 100).toFixed(2)"></span></span>
    </div>

    <!-- Color -->
    <div class="filter-group">
      <h4>Color</h4>
      {% for tag in collection.all_tags %}
        {% if tag contains 'color-' %}
          <label>
            <input type="checkbox" 
                   value="{{ tag }}"
                   @change="toggleFilter('tags', '{{ tag }}')">
            {{ tag | remove: 'color-' }}
          </label>
        {% endif %}
      {% endfor %}
    </div>

    <!-- Size -->
    <div class="filter-group">
      <h4>Size</h4>
      {% for tag in collection.all_tags %}
        {% if tag contains 'size-' %}
          <label>
            <input type="checkbox" 
                   value="{{ tag }}"
                   @change="toggleFilter('tags', '{{ tag }}')">
            {{ tag | remove: 'size-' }}
          </label>
        {% endif %}
      {% endfor %}
    </div>

    <button @click="clearFilters()" class="btn-clear">Clear All</button>
  </aside>

  <!-- Product Grid -->
  <div class="products-grid">
    <template x-if="loading">
      <div class="loading-spinner">Loading...</div>
    </template>

    <template x-if="!loading">
      <div class="product-grid">
        <template x-for="product in products" :key="product.id">
          <div class="product-card">
            <a :href="product.url">
              <img :src="product.image" :alt="product.title">
              <h3 x-text="product.title"></h3>
              <p x-text="formatMoney(product.price)"></p>
            </a>
          </div>
        </template>
      </div>
    </template>
  </div>
</div>

<script>
function collectionFilters() {
  return {
    products: [],
    loading: false,
    priceMax: 100000,
    selectedTags: [],

    init() {
      this.loadProducts();
    },

    toggleFilter(type, value) {
      const index = this.selectedTags.indexOf(value);
      if (index > -1) {
        this.selectedTags.splice(index, 1);
      } else {
        this.selectedTags.push(value);
      }
      this.applyFilters();
    },

    async applyFilters() {
      this.loading = true;
      const params = new URLSearchParams({
        price_max: this.priceMax,
        tags: this.selectedTags.join(',')
      });

      const res = await fetch(\`{{ collection.url }}?view=json&\${params}\`);
      const data = await res.json();
      this.products = data.products;
      this.loading = false;
    },

    clearFilters() {
      this.selectedTags = [];
      this.priceMax = 100000;
      this.applyFilters();
    },

    async loadProducts() {
      const res = await fetch('{{ collection.url }}?view=json');
      const data = await res.json();
      this.products = data.products;
    },

    formatMoney(cents) {
      return '$' + (cents / 100).toFixed(2);
    }
  }
}
</script>`,
  features: ["Ajax filtering", "Price range", "Multiple filters", "No page reload"],
},
];